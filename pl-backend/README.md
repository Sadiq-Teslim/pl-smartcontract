# Biological-to-Digital Bridge (Dev 1)

This service simulates neural intent, hashes it into a neural fingerprint, pins it to Filecoin via Lighthouse, and exposes the latest intent over a FastAPI gateway.

## Features
- Synthetic EEG generation (alpha/beta waves)
- Intent spike trigger
- SHA-256 neural fingerprinting
- Filecoin pinning via Lighthouse API
- FastAPI gateway with /latest-intent

## Setup
1. Create a Python virtual environment and install dependencies:
   - pip install -r requirements.txt

2. Configure environment variables (optional but recommended):
   - LIGHTHOUSE_API_KEY: Lighthouse API key
   - LIGHTHOUSE_ENDPOINT: Override Lighthouse endpoint (default: https://node.lighthouse.storage/api/v0/add)
   - INTENT_STORAGE_PATH: JSON file path for persisted latest intent (default: ./data/latest_intent.json)

3. Run the API:
   - uvicorn app.main:app --reload

## API
- POST /intent
  - Triggers a simulated intent spike, hashes it, and pins to Filecoin.
- GET /latest-intent
  - Returns the latest intent data, fingerprint, and CID.
- GET /health

## Notes
If LIGHTHOUSE_API_KEY is not set, the service will still run but will skip pinning and return a null CID with a status flag.

## Frontend README (Quick Integration Guide)
This backend is designed to be called by your frontend when a user clicks the “Intent” button. Use the steps below to integrate safely and predictably.

### Required Endpoints
- POST /intent
   - Triggers a simulated intent spike, generates the neural fingerprint, and pins it to Filecoin (if configured).
- GET /latest-intent
   - Returns the most recent intent, fingerprint, CID, and pin status.

### Suggested Frontend Flow
1. User clicks the “Intent” button.
2. Frontend calls POST /intent.
3. UI switches the Orb to “Pulse Detected”.
4. Frontend polls or calls GET /latest-intent to display CID and verification status.

### Example (Vanilla JS)
```js
const API_BASE = "http://localhost:8000";

async function triggerIntent() {
   const response = await fetch(`${API_BASE}/intent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ intent_spike: true })
   });

   if (!response.ok) {
      throw new Error("Intent failed");
   }

   return response.json();
}

async function getLatestIntent() {
   const response = await fetch(`${API_BASE}/latest-intent`);
   if (!response.ok) {
      throw new Error("No intent available");
   }
   return response.json();
}
```

### UI Copy Suggestions
- Button label: “Record Intent”
- Success state: “Pulse Detected”
- Verification state: “CID pinned to Filecoin”

### Common Frontend Errors
- 404 on /latest-intent: No intent exists yet. Trigger POST /intent first.
- cid is null: Lighthouse API key missing or pin failed. Check status and error fields.

### CORS Note
If you’re calling the API from a browser on a different port, enable CORS in your frontend or proxy requests through your dev server.
