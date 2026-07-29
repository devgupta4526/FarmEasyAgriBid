# AgriBid Platform — Failing Test Cases Report

> **Source:** End-to-End Manual QA Execution Report (July 29, 2026)
> **Scope:** All 16 confirmed FAIL test cases with root cause analysis and recommended fixes

---

## Summary of Failures

| Module | Failed TCs | Count |
|---|---|---|
| Farmer Product Management | TC-02-01, TC-02-03, TC-02-04 | 3 |
| Marketplace & Product Discovery | TC-03-05, TC-03-06 | 2 |
| AI Advisory Hub | TC-06-01, TC-06-02, TC-06-05 | 3 |
| UI Aesthetics & Settings | TC-10-01, TC-10-04 | 2 |
| Full Dashboard Suite | TC-11-03, TC-11-10, TC-11-14, TC-11-18, TC-11-21 | 5 |
| **Total** | | **16** |

---

## Module 02 — Farmer Product Management

---

### TC-02-01 · Create New Product Listing

**Status:** ❌ FAIL

**What was tested:**
Clicking "Add Product" on the Farmer dashboard (`/dashboard/farmer/products`).

**What happened:**
Navigation goes to `/dashboard/farmer/products/new`, which returns a Next.js **HTTP 404** page. Reproduced twice — via UI click and via direct URL navigation.

**Root Cause:**
The route `/dashboard/farmer/products/new` does not exist in the Next.js router. Either the page file (`pages/dashboard/farmer/products/new.tsx` or equivalent) was never created, or it was deleted/misconfigured during a deployment.

**Impact:**
Farmers **cannot create any product listing** through the UI. This is the single highest-impact defect for the Farmer persona.

**Fix:**
Create and register the missing Next.js route/page for product creation, wired to `POST /api/v1/products`.

---

### TC-02-03 · Edit Product Details & Stock Update

**Status:** ❌ FAIL

**What was tested:**
Clicking "Edit" on an existing product card on the Farmer dashboard.

**What happened:**
Navigation goes to `/dashboard/farmer/products/[id]/edit`, which also returns **HTTP 404**.

**Root Cause:**
Same as TC-02-01 — the dynamic edit route (`/dashboard/farmer/products/[id]/edit`) is missing from the Next.js router.

**Impact:**
Farmers **cannot update or correct any existing listing** — pricing, stock levels, and descriptions are frozen as-is.

**Fix:**
Create the dynamic edit page and wire it to `PATCH /api/v1/products/:id`.

---

### TC-02-04 · Archive / Delete Product Listing

**Status:** ❌ FAIL

**What was tested:**
Inspecting all action controls rendered on each product card in the Farmer dashboard.

**What happened:**
Only "Edit" and "View" buttons exist on each card. **No archive, delete, or trash control is present** in the current build.

**Root Cause:**
The archive/delete feature was never implemented on the frontend. The UI controls and corresponding API call are missing entirely.

**Impact:**
Farmers cannot remove discontinued or erroneous listings.

**Fix:**
Add an "Archive" or "Delete" button to product cards and wire it to the appropriate backend endpoint (e.g., `DELETE /api/v1/products/:id` or a status-toggle `PATCH`).

---

## Module 03 — Marketplace & Product Discovery

---

### TC-03-05 · Product Detail View & Page Count Increment

**Status:** ❌ FAIL

**What was tested:**
Navigating to `/marketplace/[id]` both directly and via clicking a live product card in the grid.

**What happened:**
Both methods return **HTTP 404**. The product detail page does not render for any product.

**Root Cause:**
The dynamic route `/marketplace/[id]` is missing or broken in the Next.js router — analogous to the product creation/edit route failures in TC-02-01 and TC-02-03.

**Impact (Cascade):**
This single defect **blocks three additional modules**:
- **TC-05-02** — "Buy Now" lives on this page → Checkout cannot be reached
- **TC-08-01** — "Contact Seller" lives on this page → Chat cannot be initiated
- Page-view increment API call is also never triggered

**Fix:**
Create and register the `/marketplace/[id]` dynamic route page, fetching product data from `GET /api/v1/products/:id`.

---

### TC-03-06 · Wishlist Item Toggle (Add / Remove)

**Status:** ❌ FAIL

**What was tested:**
Clicking the heart (wishlist) icon on a marketplace product card while logged in as a buyer.

**What happened:**
The heart icon **visually fills red** (client-side state update), but **zero backend API calls are fired**. Navigating to `/dashboard/buyer/wishlist` immediately after shows "Your wishlist is currently empty."

**Root Cause:**
The `onClick` handler for the wishlist button only updates local React state — it is not connected to any API call (e.g., `POST /api/v1/wishlist`). This is part of a **systemic pattern** of silent no-ops found across multiple modules (see also TC-11-03, TC-11-18, TC-11-21).

**Impact:**
Wishlist feature is entirely non-functional. Users are actively misled — they believe items are saved when they are not.

**Fix:**
Wire the wishlist toggle handler to `POST /api/v1/wishlist` (add) and `DELETE /api/v1/wishlist/:productId` (remove), and update UI state only on confirmed API success.

---

## Module 06 — AI Advisory Hub (Google Gemini)

---

### TC-06-01 · AI Price Advisor Query

**Status:** ❌ FAIL

**What was tested:**
Submitting a valid query to the Price Advisor while logged in as a farmer.

**What happened:**
`POST /api/v1/ai/price-advisor` returned **HTTP 500** with body:
```
{"error": "AI service temporarily unavailable"}
```
The frontend handles this gracefully (no crash), but the feature does not work.

**Root Cause:**
Backend AI integration (Google Gemini) is failing at the server level. Likely causes: expired or invalid Gemini API key, exhausted quota, or a misconfigured environment variable (`GEMINI_API_KEY` or equivalent) in the deployed environment.

**Impact:**
The AI Advisory Hub — a headline product feature — is completely non-functional platform-wide.

**Fix:**
1. Check the Gemini API key in the backend's environment configuration (Render dashboard).
2. Verify the key has active quota and billing.
3. Replace/rotate the key if expired and redeploy.

---

### TC-06-02 · AI Crop Advisory Recommendation

**Status:** ❌ FAIL

**What was tested:**
Submitting a query to the Crop Advisor.

**What happened:**
`POST /api/v1/ai/crop-advisor` returned **HTTP 500**, same error body as TC-06-01.

**Root Cause:**
Same root cause as TC-06-01 — all AI endpoints share the same backend Gemini integration and the same failure point.

**Fix:**
Same as TC-06-01 — fix the shared AI service configuration. All AI endpoints will recover together.

---

### TC-06-05 · Multilingual AI Chatbot Interaction

**Status:** ❌ FAIL

**What was tested:**
Sending a chat message to the AI chatbot.

**What happened:**
`POST /api/v1/ai/chat` returned **HTTP 500** with body:
```
{"error": "AI assistant temporarily unavailable"}
```
UI degrades gracefully with a fallback message.

**Root Cause:**
Same root cause as TC-06-01 and TC-06-02.

**Fix:**
Same as TC-06-01.

---

## Module 10 — UI Aesthetics, Dark Mode & Localisation

---

### TC-10-01 · Dark Mode / Light Mode Theme Toggle

**Status:** ❌ FAIL

**What was tested:**
Searched the rendered DOM and page source across the homepage, login page, and every dashboard header for a theme toggle — including moon/sun icons, aria-labels containing "theme"/"dark"/"light", and next-themes library references.

**What happened:**
**Nothing found.** No dark mode control exists anywhere in the current deployed build.

**Root Cause:**
The dark mode feature has not been implemented. No theming library (e.g., `next-themes`) is initialised, and no toggle UI component exists.

**Impact:**
Documented test case TC-10-01 cannot pass. Users have no way to switch themes.

**Fix:**
Either implement dark mode (integrate `next-themes` or equivalent, add a toggle to the header), **or** explicitly mark this feature as out-of-scope and remove/defer the test case until the next release.

---

### TC-10-04 · Graceful Network & API Error Handling

**Status:** ❌ FAIL

**What was tested:**
Setting the browser context offline, then submitting the "Update Password" form on `/dashboard/settings`.

**What happened:**
Instead of a network-error message, the UI displayed a **false-positive "Password changed successfully" toast** — despite the browser being fully offline and no network call being possible.

**Root Cause:**
The Update Password form handler is not wired to any API call at all. The success toast fires unconditionally on button click, independent of any backend response. This is consistent with the same silent no-op pattern found in TC-03-06, TC-11-03, TC-11-18, and TC-11-21.

**Impact:**
Users are deceived into believing their password was updated when it was not. This is a **security concern** in addition to a UX defect.

**Fix:**
Wire the form submission to `PATCH /api/v1/auth/password` (or equivalent), show the success toast only on HTTP 200, and show an error toast on failure or network error.

---

## Module 11 — Full Dashboard Sub-Pages Suite

---

### TC-11-03 · User Account & Security Settings

**Status:** ❌ FAIL

**What was tested:**
Loading `/dashboard/settings` and interacting with the Personal Information and Update Password forms.

**What happened (two sub-failures):**

1. **Profile form loads blank** — Full Name and Email fields are empty, not pre-populated with the logged-in user's data.
2. **Save Profile fires no API call** — Clicking "Save Profile" shows a success toast but zero network requests are made. Fields are empty again on reload.
3. **Update Password also fires no API call** — Same silent no-op behavior (confirmed offline in TC-10-04).

**Root Cause:**
- Pre-fill failure: The settings page is not fetching the current user's profile data on mount (missing `useEffect` + `GET /api/v1/auth/me` or equivalent).
- Save no-op: Same systemic issue as TC-03-06 — the form submit handler was never wired to an API call.

**Impact:**
Users cannot update their name, email, or password. The Settings page is entirely non-functional for data persistence.

**Fix:**
1. On page load, call `GET /api/v1/auth/me` and pre-fill form fields with the response.
2. On "Save Profile", call `PATCH /api/v1/users/me` with the form data; show success/error toast based on response.
3. On "Update Password", call `PATCH /api/v1/auth/password`; same pattern.

---

### TC-11-10 · Farmer Product Reviews

**Status:** ❌ FAIL

**What was tested:**
Loading the reviews section of the Farmer dashboard.

**What happened:**
`GET /api/v1/reviews` returned **HTTP 422 Unprocessable Entity**. The UI degrades gracefully to "0.0/5.0, 0 Reviews, No customer reviews yet" rather than crashing, but the displayed figures are a result of the API failure, not the actual review data.

**Root Cause:**
The `GET /api/v1/reviews` request is likely missing a required query parameter (e.g., `farmerId`, `productId`) that the backend validates and rejects with 422 when absent. This is a frontend bug — the page is calling the endpoint without the necessary context.

**Impact:**
Farmer cannot view their product reviews or ratings. The displayed "0 reviews" figure is misleading.

**Fix:**
Inspect the `/api/v1/reviews` endpoint contract, identify the required parameters, and ensure the frontend passes them (e.g., the logged-in farmer's ID) when making the request.

---

### TC-11-14 · Buyer Wishlist

**Status:** ❌ FAIL

**What was tested:**
Navigating to `/dashboard/buyer/wishlist` after attempting to add an item from the marketplace.

**What happened:**
Page correctly shows "Your wishlist is currently empty" — but this confirms the broken add-to-wishlist flow documented in TC-03-06, since the item added from the marketplace was never actually saved.

**Root Cause:**
This is a downstream symptom of TC-03-06. The wishlist page itself renders correctly; the problem is that nothing ever reaches it because the add-to-wishlist API call is never made.

**Fix:**
Fix TC-03-06 (wire the wishlist heart button to the backend API). The wishlist dashboard page should then work correctly.

---

### TC-11-18 · Admin Product Moderation

**Status:** ❌ FAIL

**What was tested:**
Clicking "Approve" on a product with status `pending_review` in the Admin moderation panel.

**What happened:**
Clicking "Approve" fires **zero backend API calls**. The product status remains `pending_review` both immediately and after a full page reload. No change is persisted.

**Root Cause:**
Same systemic silent no-op pattern as TC-03-06, TC-11-03, and TC-11-21. The "Approve" button's `onClick` handler is not connected to any API call (e.g., `PATCH /api/v1/admin/products/:id/approve`).

**Impact:**
Admins **cannot approve or moderate any product listing**. Farmers' new products are permanently stuck in `pending_review` and can never go live on the marketplace.

**Fix:**
Wire the "Approve" (and "Reject") button to `PATCH /api/v1/admin/products/:id/status` with the appropriate status payload, and refresh the product list on success.

---

### TC-11-21 · Admin Announcements

**Status:** ❌ FAIL

**What was tested:**
Broadcasting a test announcement from the Admin dashboard.

**What happened:**
The announcement appears in the "Active Announcements" list and a "broadcasted successfully" toast is shown — but **zero backend API calls are fired**. After a page reload, the announcement is gone.

**Root Cause:**
Same systemic silent no-op pattern. The broadcast action only updates local React state; it is never persisted to the backend (missing `POST /api/v1/admin/announcements` call).

**Impact:**
Admin announcements are entirely non-functional. No announcement can reach users.

**Fix:**
Wire the broadcast action to `POST /api/v1/admin/announcements`, update the UI list only on a successful response, and ensure the endpoint persists data to the database.

---

## Cross-Cutting Issue — Silent No-Op Pattern

The following **5 confirmed failures** all share the same root cause: an `onClick`/`onSubmit` handler that fires a success toast or updates local UI state **without ever calling the backend**:

| Test Case | Action | Expected API Call |
|---|---|---|
| TC-03-06 | Add to Wishlist | `POST /api/v1/wishlist` |
| TC-10-04 / TC-11-03 | Update Password / Save Profile | `PATCH /api/v1/auth/password`, `PATCH /api/v1/users/me` |
| TC-11-18 | Admin Approve Product | `PATCH /api/v1/admin/products/:id/status` |
| TC-11-21 | Admin Broadcast Announcement | `POST /api/v1/admin/announcements` |

**Recommended Action:** Rather than fixing these in isolation, conduct a **full audit of every form submit and action button** across all dashboards. Verify each one fires a real network request (observable in DevTools → Network tab). This pattern may exist in untested pages as well.

---

## Priority Order for Fixes

| Priority | Test Case(s) | Why |
|---|---|---|
| 🔴 P1 | TC-02-01, TC-02-03 | Farmers cannot create or edit products — core flow broken |
| 🔴 P1 | TC-03-05 | Product detail 404 cascades to block Checkout, Chat, and Buy Now |
| 🔴 P1 | TC-11-18 | Admin cannot approve products — marketplace supply is permanently frozen |
| 🔴 P1 | TC-03-06, TC-10-04, TC-11-03, TC-11-21 | Silent no-ops actively mislead users; systemic audit required |
| 🟠 P2 | TC-06-01, TC-06-02, TC-06-05 | Headline AI feature fully down — single root cause (API key/quota) |
| 🟠 P2 | TC-11-10 | Reviews endpoint returning 422 — missing required param |
| 🟡 P3 | TC-02-04 | Archive/delete product UI missing |
| 🟡 P3 | TC-10-01 | Dark mode not implemented — clarify if in scope |
| 🟡 P3 | TC-11-14 | Wishlist dashboard blocked by TC-03-06 fix |

---

*Report generated from QA Execution results dated July 29, 2026. All failures are backed by direct HTTP status codes, API response bodies, or DOM observations — none are inferred.*