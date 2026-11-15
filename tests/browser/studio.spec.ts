import { test, expect } from "@playwright/test";
import { join } from "node:path";
const session = {
  screen: { id: "ready" },
  profile: {
    handle: "browser_test_fixture",
    choice: "own_key",
    consent: true,
    telemetry: false,
    plan: "Test fixture",
    hasOwnKey: false,
    aiProviders: [],
  },
};
async function authenticated(page: import("@playwright/test").Page) {
  await page.route("**/api/session", (r) => r.fulfill({ json: session }));
  await page.route("**/api/projects", (r) =>
    r.fulfill({
      json: r.request().method() === "GET" ? { projects: [] } : { ok: true },
    }),
  );
  await page.route("**/api/telemetry", (r) =>
    r.fulfill({ json: { ok: true } }),
  );
}
test("public first page requires Publik sign-in; responsive and no secret exposure", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Less editing. More creating." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Sign in with publik", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Create a video" }),
  ).toHaveCount(0);
  await page.screenshot({ path: "outputs/gate-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "outputs/gate-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("real browser upload, split, undo, speed, text, canvas, MP4 export and saved reopen", async ({
  page,
}) => {
  await authenticated(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "What will you create today?" }),
  ).toBeVisible();
  await page.screenshot({ path: "outputs/studio-home.png", fullPage: true });
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await expect(
    page.getByRole("button", { name: "Split clip at playhead" }),
  ).toBeVisible();
  await page.getByLabel("Timeline playhead").fill("1.5");
  await page.getByRole("button", { name: "Split clip at playhead" }).click();
  await expect(page.locator(".timeline-clip")).toHaveCount(2);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.locator(".timeline-clip")).toHaveCount(1);
  await page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(page.locator(".timeline-clip")).toHaveCount(2);
  await page.getByText("More adjustments", { exact: true }).click();
  await page.getByRole("slider", { name: /^Exposure/ }).fill("0.25");
  await page.getByLabel("Canvas aspect ratio").selectOption("1:1");
  await page.getByRole("button", { name: "Text", exact: true }).click();
  await page.getByRole("button", { name: "Add text", exact: true }).click();
  await page.getByLabel("Caption text").fill("Browser export test");
  await page.screenshot({ path: "outputs/editor-desktop.png", fullPage: true });
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page
    .getByRole("combobox", { name: /Resolution|Export resolution/i })
    .selectOption("854");
  const download = page.waitForEvent("download", { timeout: 150000 });
  await page.getByRole("button", { name: "Export video", exact: true }).click();
  const file = await Promise.race([
    download,
    page
      .getByRole("alert")
      .waitFor({ timeout: 150000 })
      .then(async () => {
        throw Error(await page.getByRole("alert").innerText());
      }),
  ]);
  await file.saveAs("outputs/verified-export.mp4");
  await expect(page.getByRole("status")).toContainText("MP4 exported");
  await page
    .getByRole("button", { name: "My creations", exact: true })
    .first()
    .click();
  await expect(page.locator(".project-card")).toHaveCount(1);
  await page.locator(".project-card-title").click();
  await expect(page.locator(".timeline-clip")).toHaveCount(2);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "outputs/editor-mobile.png", fullPage: true });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("AI failure preserves timeline and explains recovery", async ({
  page,
}) => {
  await authenticated(page);
  await page.route("**/api/ai/**", (r) =>
    r.fulfill({
      status: 402,
      json: {
        error: "Not enough publik API balance.",
        url: "https://publikhq.com/wallet",
      },
    }),
  );
  await page.goto("/");
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await page.getByRole("button", { name: "Find my best takes" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Not enough publik API balance.",
    { timeout: 120000 },
  );
  await expect(page.locator(".timeline-clip")).toHaveCount(1);
});

test("MediaRecorder takes with generated camera source, teleprompter and playable import", async ({
  page,
}) => {
  await authenticated(page);
  // The test uses real browser MediaRecorder/canvas/audio, with a generated camera
  // source. OS-level camera/microphone permission remains a physical-device check.
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const c = document.createElement("canvas");
      c.width = 320;
      c.height = 180;
      const ctx = c.getContext("2d")!;
      let frame = 0;
      setInterval(() => {
        ctx.fillStyle = frame++ % 2 ? "#a8f0f0" : "#598fd9";
        ctx.fillRect(0, 0, 320, 180);
      }, 50);
      const stream = c.captureStream(24);
      const audio = new AudioContext({
          sinkId: { type: "none" },
        } as AudioContextOptions),
        osc = audio.createOscillator(),
        dest = audio.createMediaStreamDestination();
      osc.connect(dest);
      osc.start();
      void audio.resume();
      stream.addTrack(dest.stream.getAudioTracks()[0]);
      return stream;
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Record", exact: true })
    .first()
    .click();
  await page
    .getByRole("button", { name: "Enable camera & microphone" })
    .click();
  await expect(
    page.getByRole("button", { name: "Start recording" }),
  ).toBeEnabled();
  await page
    .getByPlaceholder("Paste your script. It stays out of the recording.")
    .fill("This script should not be burned into the footage.");
  await page.getByRole("button", { name: "Start recording" }).click();
  await page.waitForTimeout(1800);
  await page.getByRole("button", { name: "Stop recording" }).click();
  await expect(
    page.getByRole("heading", { name: "1 recorded takes" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Use these takes" }).click();
  await expect(
    page.getByRole("button", { name: "Split clip at playhead" }),
  ).toBeVisible({ timeout: 120000 });
  await expect(page.locator(".timeline-clip")).toHaveCount(1);
});

test("overlay and imported audio appear in actual exported media", async ({
  page,
}) => {
  await authenticated(page);
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Create a video", exact: true }),
  ).toBeVisible();
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await page.getByRole("button", { name: "Layers", exact: true }).click();
  await page
    .getByRole("button", { name: "Add image / video" })
    .click({ noWaitAfter: true });
  await page
    .locator("input[type=file]")
    .nth(1)
    .setInputFiles(join(process.cwd(), "outputs/overlay.png"));
  await expect(page.locator(".layer-settings")).toHaveCount(1);
  await page
    .getByRole("button", { name: "Add audio", exact: true })
    .click({ noWaitAfter: true });
  await page
    .locator("input[type=file]")
    .nth(1)
    .setInputFiles(join(process.cwd(), "outputs/music.wav"));
  await expect(page.locator(".layer-settings")).toHaveCount(2);
  await page.getByRole("button", { name: "Export", exact: true }).click();
  await page
    .getByRole("combobox", { name: /Resolution|Export resolution/i })
    .selectOption("854");
  const d = page.waitForEvent("download", { timeout: 120000 });
  await page.getByRole("button", { name: "Export video", exact: true }).click();
  await (await d).saveAs("outputs/layers-export.mp4");
  await expect(page.getByRole("status")).toContainText("MP4 exported");
});

test("batch creates separate persistent editable projects", async ({
  page,
}) => {
  await authenticated(page);
  await page.goto("/");
  await page.getByRole("button", { name: /Batch edit/ }).click();
  await page
    .locator(".batch-box input")
    .nth(0)
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await page
    .locator(".batch-box input")
    .nth(1)
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await page.getByRole("checkbox", { name: /Run AI editing/ }).uncheck();
  await page.getByRole("button", { name: "Create 2 projects" }).click();
  await expect(page.locator(".project-card")).toHaveCount(2);
});

test("mutation routes reject requests from another origin", async ({
  request,
}) => {
  const r = await request.post("/api/projects", {
    headers: { origin: "https://untrusted.invalid" },
    data: { id: "invalid" },
  });
  expect(r.status()).toBe(403);
  expect(await r.json()).toMatchObject({
    error: "This request must come from EditAI.",
  });
});

test("Publik Chirp upload flow creates one resumable word-timestamp job per source", async ({
  page,
}) => {
  await page.route("**/api/session", (r) =>
    r.fulfill({
      json: { ...session, profile: { ...session.profile, choice: "publik" } },
    }),
  );
  await page.route("**/api/projects", (r) =>
    r.fulfill({ json: { projects: [] } }),
  );
  await page.route("**/api/telemetry", (r) =>
    r.fulfill({ json: { ok: true } }),
  );
  let jobs = 0,
    uploads = 0;
  await page.route("**/api/ai/speech-source/*", (r) =>
    r.fulfill({ json: { id: null, pending: false } }),
  );
  await page.route("**/api/ai/audio-upload", (r) => {
    uploads++;
    return r.fulfill({
      json: {
        id: "upl_fixture",
        uploadTicket: "encrypted-fixture-ticket",
      },
    });
  });
  await page.route("**/api/ai/audio-put", async (r) => {
    expect(r.request().headers()["authorization"]).toBeUndefined();
    expect(r.request().headers()["x-upload-ticket"]).toBe(
      "encrypted-fixture-ticket",
    );
    await r.fulfill({ status: 200, body: "" });
  });
  await page.route("**/api/ai/transcription-job", (r) => {
    jobs++;
    expect(r.request().postDataJSON().sourceId).toBeTruthy();
    return r.fulfill({ json: { id: "trx_fixture", status: "queued" } });
  });
  await page.route("**/api/ai/transcription-job/trx_fixture", (r) =>
    r.fulfill({
      json: {
        id: "trx_fixture",
        status: "completed",
        words: [
          { word: "A", start: 0.3, end: 0.5 },
          { word: "real", start: 0.5, end: 0.8 },
          { word: "caption.", start: 0.9, end: 1.3 },
        ],
      },
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Create a video", exact: true }),
  ).toBeVisible();
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await page
    .getByRole("button", { name: "Generate captions", exact: true })
    .click();
  await expect(page.locator(".text-layer-list>button")).toHaveCount(1);
  expect(jobs).toBe(1);
  expect(uploads).toBe(1);
  await page
    .getByRole("button", { name: "Generate speech captions", exact: true })
    .click();
  await expect(page.locator(".text-layer-list>button")).toHaveCount(1);
  expect(jobs).toBe(1);
});

test("visual style references attach actual browser-decoded image frames to chat", async ({
  page,
}) => {
  await authenticated(page);
  let reference: any;
  await page.route("**/api/ai/chat", (r) => {
    reference = r.request().postDataJSON().reference;
    return r.fulfill({
      json: {
        message: "Fixture response: reference received; no edits applied.",
        generateCaptions: false,
        captionFormat: null,
        operations: [],
      },
    });
  });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Create a video", exact: true }),
  ).toBeVisible();
  await page
    .locator("input[type=file]")
    .first()
    .setInputFiles(join(process.cwd(), "outputs/fixture.mp4"));
  await page.getByRole("button", { name: "EditAI", exact: true }).click();
  await page.getByRole("button", { name: "Add a style reference" }).click();
  await page
    .locator("input[type=file]")
    .nth(2)
    .setInputFiles(join(process.cwd(), "outputs/overlay.png"));
  await expect(
    page.getByRole("button", { name: "Remove reference" }),
  ).toBeVisible();
  await page.getByLabel("Message EditAI").fill("Match this reference style");
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  await expect(page.locator(".message.assistant")).toContainText(
    "reference received",
  );
  expect(reference.kind).toBe("image");
  expect(reference.frames[0].base64JPEG.startsWith("/9j/")).toBe(true);
});
