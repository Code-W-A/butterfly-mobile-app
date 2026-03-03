## Mobile-Web Admin Sync Contract

This document defines the shared data contract between Butterfly mobile and the Next.js web admin.

### 1) User profile schema (`users/{uid}`)

```json
{
  "firstName": "Andrei",
  "lastName": "Popescu",
  "displayName": "Andrei Popescu",
  "email": "andrei@example.com",
  "phone": "07xxxxxxxx",
  "avatarUrl": "https://...",
  "equipment": {
    "blade": { "source": "catalog", "catalogId": "blade_timo_boll_alc", "label": "Timo Boll ALC" },
    "forehand": { "source": "custom", "catalogId": "", "label": "Dignics 09C 2.1" },
    "backhand": { "source": "catalog", "catalogId": "rubber_tenergy_05", "label": "Tenergy 05" }
  },
  "createdAt": 1735689600000,
  "updatedAt": 1735689600000
}
```

Notes:
- `equipment.*.source` is `catalog` or `custom`.
- Mobile reads legacy string values, but writes only the object format above.

### 2) Equipment catalog source (admin-owned)

Preferred Firestore shape:
- `settings/equipmentCatalog`:
  - `blades[]`
  - `rubbers[]`

Each item:

```json
{
  "id": "blade_timo_boll_alc",
  "name": "Timo Boll ALC",
  "brand": "Butterfly",
  "active": true,
  "updatedAt": 1735689600000
}
```

### 3) Package component roles (canonical)

Backend/admin should write only these keys for package items:
- `blade`
- `forehand`
- `backhand`

Mobile display labels:
- `blade` -> `Lemn`
- `forehand` -> `Forehand`
- `backhand` -> `Rever`

### 4) Official attributes policy

Mobile no longer relies on local formulas for official attributes. Admin/backend is the source of truth and should provide official values in recommendation payloads. In UI we hide `Greutate` from the main attributes section.

### 5) Codex brief for Next.js admin

Send this to Codex in the admin repo:

1. Add/manage official equipment catalog with `blades[]` and `rubbers[]` (id, name, brand, active, updatedAt).
2. Expose catalog read API/queries for mobile.
3. Ensure recommendation payload sends official attributes and canonical package roles (`blade`, `forehand`, `backhand`).
4. In admin UI, rename package component labels to `Lemn`, `Forehand`, `Rever`.
5. Support user profile equipment as hybrid: catalog pick (`catalogId`) or free text (`custom` via `label`), with backward-compatible reads.

### 6) E2E validation checklist

- Update profile in mobile: first name, avatar URL, blade + forehand + backhand.
- Verify Firestore user doc persists schema exactly.
- Open profile and recommendation menu again; greeting uses first name.
- Verify avatar renders in recommendation menu and profile header.
- Open recommendation details; attributes show control/spin/speed without weight.
- Open package details; component labels show `Lemn`, `Forehand`, `Rever`.
