// Server adaptation of https://publikhq.com/sdk/publik.ts.md for per-browser hosted sessions.
// Installs and keys are isolated per visitor; no host-global credential or background telemetry timer.
export const APP_SLUG = "editai-studio";
export const APP_VERSION = "0.1.0";
export const USES_AI = true;
export const ORIGIN = "https://publikhq.com";
export const MODELS = {
  fast: "publik-fast",
  balanced: "publik-balanced",
  smart: "publik-smart",
} as const;
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public url?: string,
  ) {
    super(message);
  }
}
export async function publik(
  path: string,
  key: string,
  body?: unknown,
  timeout = 30000,
) {
  const r = await fetch(`${ORIGIN}/api/v1${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeout),
  });
  const b: any = await r.json().catch(() => ({}));
  if (!r.ok)
    throw new ApiError(
      r.status,
      b.error?.message || `publik API answered ${r.status}.`,
      safePublikURL(b.error?.top_up_url),
    );
  return {
    body: b,
    charge: Number(r.headers.get("x-publik-charge-micros") || 0),
  };
}
export function safePublikURL(s: unknown): string | undefined {
  try {
    const u = new URL(String(s));
    return u.protocol === "https:" && u.hostname === "publikhq.com"
      ? u.href
      : undefined;
  } catch {
    return undefined;
  }
}
export async function provision(token: string, installId: string) {
  if (!token)
    throw new ApiError(
      503,
      "Publik onboarding is not configured yet. Please try again later.",
    );
  const r = await fetch(`${ORIGIN}/api/v1/installs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal: AbortSignal.timeout(20000),
    body: JSON.stringify({
      app_token: token,
      app_slug: APP_SLUG,
      app_version: APP_VERSION,
      os: "linux",
      install_id: installId,
      device_name: "EditAI Web browser session",
      disclosure_version: 1,
      dialects: ["chat_completions"],
    }),
  });
  const b: any = await r.json().catch(() => ({}));
  if (!r.ok || !b.key)
    throw new ApiError(
      r.status === 200 ? 503 : r.status,
      b.error?.message || "publik could not set up this browser.",
    );
  return b;
}
export async function readWallet(key: string) {
  return (await publik("/wallet", key)).body;
}
export function gateScreen(w: any, choice: string | null) {
  if (w.claim_state !== "claimed")
    return {
      id: "sign_in",
      title: "Sign in with publik",
      body: "Connect your publik account to open your studio. Your videos stay private.",
      buttons: [{ action: "sign_in", label: "Sign in with publik" }],
      claimURL: safePublikURL(w.claim_url),
    };
  if (!choice) {
    const ready = w.plan?.kind !== "none" || w.balance_micros > 0;
    return {
      id: "choose",
      title: ready ? "Connect your plan" : "Choose how to pay for AI",
      body: ready
        ? "Connect your publik plan, or use your own key."
        : "Get a publik plan for AI, or use your own key.",
      buttons: [
        {
          action: ready ? "connect" : "get_plan",
          label: ready ? "Connect your plan" : "Get a plan",
        },
        { action: "own_key", label: "Use my own key" },
      ],
      claimURL: safePublikURL(w.top_up_url) || ORIGIN + "/wallet",
    };
  }
  return { id: "ready", title: "Ready", body: "", buttons: [] };
}
export async function sendEvent(
  key: string,
  installId: string,
  event: "app_opened" | "active_session",
) {
  const r = await fetch(`${ORIGIN}/api/v1/telemetry`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(5000),
    body: JSON.stringify({
      v: 1,
      app: APP_SLUG,
      install_id: installId,
      event,
      app_version: APP_VERSION,
      os: "linux",
    }),
  });
  return r.ok;
}
