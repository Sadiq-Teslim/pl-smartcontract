const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export interface IntentResponse {
  neural_state: Record<string, unknown>;
  fingerprint: string;
  cid: string | null;
  pin_status: string;
  pin_error: string | null;
  flow_tx_id: string | null;
  flow_tx_status: string | null;
  flow_tx_error: string | null;
}

export interface GuardStatusResponse {
  is_valid: boolean;
  seconds_until_expiry: number;
  last_verified_cid: string;
  last_pulse_timestamp: number;
  pulse_validity_window: number;
}

export async function postIntent(
  intentSpike: boolean = true
): Promise<IntentResponse> {
  const res = await fetch(`${BACKEND_URL}/intent`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intent_spike: intentSpike }),
  });
  if (!res.ok) throw new Error(`POST /intent failed: ${res.status}`);
  return res.json();
}

export async function getGuardStatus(): Promise<GuardStatusResponse> {
  const res = await fetch(`${BACKEND_URL}/guard-status`);
  if (!res.ok) throw new Error(`GET /guard-status failed: ${res.status}`);
  return res.json();
}

export async function getLatestIntent(): Promise<IntentResponse> {
  const res = await fetch(`${BACKEND_URL}/latest-intent`);
  if (!res.ok) throw new Error(`GET /latest-intent failed: ${res.status}`);
  return res.json();
}
