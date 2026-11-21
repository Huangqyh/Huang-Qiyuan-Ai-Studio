# Security Specification — Huang Qiyuan Portfolio & Private Owner Studio

## 1. Data Invariants
1. **Default Deny**: All unspecified paths and collections reject reads and writes (`allow read, write: if false;`).
2. **Strict Owner-Only Mutation**: Only the verified portfolio owner (`huangqiyuan.1@gmail.com` with `email_verified == true`, or a pre-registered `/admins/{uid}` document) may create, update, or delete any document in `site_config`, `projects`, or `sketches`.
3. **Zero Self-Privilege Escalation**: Client SDKs can never create, update, or delete `/admins/{adminUid}`.
4. **Public Read Surface Strictly Scoped**:
   - `/site_config/{configId}` permits public `get` ONLY for `configId == 'portfolio'` when `resource.data.isPublished == true`. `list` is restricted to `isAdmin()`.
   - `/projects/{projectId}` permits public `get` and `list` ONLY when `resource.data.isPublished == true` (client queries enforce `where('isPublished', '==', true)`). Draft/unpublished items are visible only to `isAdmin()`.
   - `/sketches/{sketchId}` permits public `get` and `list` ONLY when `resource.data.isPublished == true`.
5. **Path & Schema Integrity**: Every document ID matches `^[a-zA-Z0-9_\-]+$` (`<= 128` chars), `id` fields match path wildcards, all strings and lists enforce upper size bounds, allowed keys are strictly gated with `hasAll` / `hasOnly` / `affectedKeys().hasOnly`, and `createdAt` is immutable while `updatedAt == request.time`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Project Creation**: Anonymous visitor calls `setDoc(/projects/hack-1, validProject)` → DENIED (not signed in as verified owner).
2. **Non-Owner Authenticated Write**: Random Google account (`attacker@gmail.com`, `email_verified: true`) tries `updateDoc(/site_config/portfolio, ...)` → DENIED (`isAdmin()` false).
3. **Email Spoofing (Unverified Owner Email)**: Auth token claims `email: "huangqiyuan.1@gmail.com"` with `email_verified: false` → DENIED (`email_verified == true` required).
4. **Self-Admin Privilege Escalation**: Authenticated non-owner calls `setDoc(/admins/{uid}, { email, createdAt })` → DENIED (`admins` writes unconditionally false).
5. **Shadow / Ghost Field Injection on Create**: Owner creates `/projects/proj-1` with extra key `isSuperAdmin: true` → DENIED (`keys().hasOnly(...)` rejects ghost key).
6. **Shadow / Ghost Field Injection on Update**: Owner updates `/projects/proj-1` adding ghost key `hiddenFlag: true` → DENIED (`affectedKeys().hasOnly(...)` rejects ghost key).
7. **Value Poisoning (Invalid Category Enum)**: Owner creates `/projects/proj-bad-cat` with `category: "Fake Category"` → DENIED (`isValidProject` category enum check).
8. **ID Poisoning / Mismatch**: Owner writes `/projects/bad$id` or `/projects/proj-a` with `data.id = "proj-b"` → DENIED (`isValidId(projectId)` and `data.id == projectId`).
9. **Denial-of-Wallet Oversized String**: Owner writes `/projects/proj-huge` with a 10,000-char `title` → DENIED (`data.title.size() <= 200`).
10. **Immutable `createdAt` Tampering**: Owner updates `/projects/proj-1` modifying `createdAt` to a new timestamp → DENIED (`incoming().createdAt == existing().createdAt`).
11. **Client-Spoofed `updatedAt` Timestamp**: Owner writes `updatedAt` set to a forged client date instead of `serverTimestamp()` (`request.time`) → DENIED (`incoming().updatedAt == request.time`).
12. **Unpublished Draft Scraping by Visitor**: Unauthenticated visitor attempts `getDoc(/projects/draft-1)` where `isPublished == false`, or `list` `/site_config` → DENIED (`resource.data.isPublished == true` / `isAdmin()` required).
