import test from "node:test";
import assert from "node:assert/strict";
import {
  encrypt,
  decrypt,
  sameOrigin,
  jsonBody,
} from "../lib/server/security.ts";
import { safePublikURL, ApiError } from "../lib/server/publik.ts";
const key = () =>
  btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
test("stored credentials use authenticated encryption with unique IVs", async () => {
  const k = key(),
    a = await encrypt("fixture credential", k),
    b = await encrypt("fixture credential", k);
  assert.notEqual(a, b);
  assert.equal(await decrypt(a, k), "fixture credential");
  await assert.rejects(decrypt(a, key()));
  assert.ok(!a.includes("fixture credential"));
});
test("cross-origin and missing-origin writes are rejected before data access", () => {
  for (const origin of ["https://untrusted.invalid", undefined])
    assert.throws(
      () =>
        sameOrigin(
          new Request("https://editai.example/api/projects", {
            method: "POST",
            headers: origin ? { origin } : {},
          }),
        ),
      (e: any) => e instanceof ApiError && e.status === 403,
    );
  assert.doesNotThrow(() =>
    sameOrigin(
      new Request("https://editai.example/api/projects", {
        method: "POST",
        headers: { origin: "https://editai.example" },
      }),
    ),
  );
});
test("JSON parsing is bounded even without a content-length header", async () => {
  const req = new Request("https://example.test", {
    method: "POST",
    body: JSON.stringify({ text: "x".repeat(200) }),
  });
  await assert.rejects(jsonBody(req, 100), (e: any) => e.status === 413);
  await assert.rejects(
    jsonBody(
      new Request("https://example.test", { method: "POST", body: "not JSON" }),
    ),
    (e: any) => e.status === 400,
  );
});
test("payment recovery links allow only the official HTTPS origin", () => {
  assert.equal(
    safePublikURL("https://publikhq.com/wallet"),
    "https://publikhq.com/wallet",
  );
  for (const url of [
    "javascript:alert(1)",
    "https://publikhq.com.untrusted.invalid/wallet",
    "http://publikhq.com",
    "https://user:pass@publikhq.com/wallet",
  ])
    assert.equal(safePublikURL(url), undefined);
});
