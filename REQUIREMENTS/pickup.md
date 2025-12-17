# Pickup OTP Flow (Phone-Based)

## Overview
- OTP is requested and verified using only the phone number.
- No user accounts, recipient IDs, or parcel IDs are involved.
- OTP is delivered via Discord webhook (temporary replacement for SMS).

## Request OTP
**Endpoint:** `POST /pickup/otp/request`

**Input**
- `phone` (string, required, numeric)

**Behavior**
- Generate `otp_code` (6 digits) and `otp_ref` (uuid).
- Hash `otp_code` before storing.
- Save OTP with status `ACTIVE` and expiry = now + 5 minutes.
- Send OTP to Discord webhook (non-blocking).

**Response**
- `otp_ref`
- `expires_at`

## Verify OTP
**Endpoint:** `POST /pickup/otp/verify`

**Input**
- `phone` (string, required)
- `otp_ref` (string, required)
- `otp_code` (string, required)

**Behavior**
- Look up OTP by `otp_ref + phone`.
- Validate status = `ACTIVE`, not expired, and hash matches.
- On success: mark OTP `VERIFIED`, set `verified_at`.
- Generate `pickup_token` (uuid) with expiry = now + 15 minutes.
- Do **not** store token in DB yet.

**Response**
- `pickup_token`
- `expires_at`

## List Parcels for Pickup
**Endpoint:** `GET /pickup/parcels`

**Header**
- `X-Pickup-Token` (required)

**Behavior**
- Validate pickup token and expiry (15 minutes from verify).
- Resolve phone from token.
- List parcels where:
  - `status = READY_FOR_PICKUP`
  - `receiver_phone = phone` OR `sender_phone = phone`
- Sorted by `created_at` ascending.

**Response**
- array of `ParcelPickupView` (no phone numbers, no pickup code)

## Error Codes
- `INVALID_REQUEST` (400)
- `OTP_NOT_FOUND` (404)
- `OTP_ALREADY_USED` (409)
- `OTP_EXPIRED` (410)
- `TOO_MANY_REQUESTS` (429, optional rate limit)
- `INVALID_TOKEN` (401)
- `TOKEN_EXPIRED` (410)
