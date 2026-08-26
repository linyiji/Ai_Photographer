# OPPO Stable HTTPS Transport Manual Gate

Parent: `XFX_FIRST_COMPLETE_NON_AI_PRODUCT_FLOW_ACCEPTANCE_01`  
Amendment: `XFX_FIRST_COMPLETE_NON_AI_OPPO_CAMERA_FIDELITY_AND_TRANSPORT_REACCEPTANCE_AMENDMENT_03`

## Why this gate is manual

The current workstation has no already-authorized stable named HTTPS tunnel, trusted controlled HTTPS endpoint, reusable certificate, or Cloudflare named-tunnel credential. Anonymous Quick Tunnel is not accepted as final evidence because the previous 7.7–8.8 MB OPPO requests were cancelled before the FastAPI route was reached.

No account, credential, DNS, certificate, or paid infrastructure may be created by this task. Run the following only after an Owner-authorized stable HTTPS ingress is available.

## Local services

PowerShell window 1 — backend, local port `8000`:

```powershell
Set-Location 'D:\Projects\Ai_Photographer\apps\api'
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

The stable API ingress must forward trusted HTTPS to:

```text
http://127.0.0.1:8000
```

PowerShell window 2 — build the H5 bundle with the public stable API origin, then serve local port `4175`:

```powershell
Set-Location 'D:\Projects\Ai_Photographer\apps\client'
$env:XFX_API_BASE = 'https://<OWNER_AUTHORIZED_STABLE_API_HOST>'
$env:XFX_PRODUCT_MODE = 'INTERNAL_DEMO'
& 'C:\Users\qi181\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' node_modules\@tarojs\cli\bin\taro build --type h5
..\api\.venv\Scripts\python.exe -m http.server 4175 --bind 127.0.0.1 --directory dist
```

The stable frontend ingress must forward trusted HTTPS to:

```text
http://127.0.0.1:4175
```

The OPPO must open the stable frontend HTTPS URL. Do not use a browser TLS bypass.

## Health and origin proof

Before opening the product on OPPO:

```powershell
Invoke-RestMethod 'https://<OWNER_AUTHORIZED_STABLE_API_HOST>/health'
```

Expected HTTP `200` body:

```json
{"status":"ok","runtime":"LOCKED_L1","database":"sqlite"}
```

Upload endpoint:

```text
POST https://<OWNER_AUTHORIZED_STABLE_API_HOST>/assets/uploads
multipart field name = file
Idempotency-Key = one stable key for the same session and local CaptureCandidate
```

The successful response must be HTTP `201`, return an `asset_id`, and include:

```text
X-XFX-Origin-Reached: 1
```

## Required 7–9 MB OPPO procedure

1. On OPPO K11 / Chrome Mobile, open the stable frontend HTTPS URL and start one legal new/resumed session.
2. Capture a device-native ImageCapture JPEG; record native dimensions, MIME, bytes, candidate id, and session id. Payload must remain representative of the accepted approximately 7–9 MB class.
3. Tap `使用这张` once. Record `UPLOAD_IN_PROGRESS`, request timestamp, response status, `X-XFX-Origin-Reached`, and returned `asset_id`.
4. Verify `GET /assets/{asset_id}` and `GET /assets/{asset_id}/content`, SQLite/registry persistence, PhotographySession readback, workflow advance, and refresh/resume.
5. Perform one controlled connectivity interruption during a second upload. The same local candidate must remain available as `UPLOAD_RETRYABLE_FAILED`.
6. Restore connectivity and retry without retaking. Reuse the same `Idempotency-Key`; expect `UPLOAD_SUCCEEDED`, the same single authoritative `asset_id`, and no duplicate stored asset.
7. Preserve textual telemetry and screenshots only. Do not commit the native photograph, transient Preview Reference Frame, token, certificate, or tunnel credential.

Formal PASS requires both the origin proof and the real-device sequence. Local automated upload tests alone are not OPPO transport acceptance.
