# Cursor Agent Task — Bus Ticketing App: Bug Fixes & Feature Enhancements

## Context

This is the Flutter customer-facing app for a bus ticketing platform (paired with an Express/TypeScript/Prisma/MySQL backend and a React/Vite admin-operator dashboard). Work through the items below in priority order. After each fix, verify it doesn't break adjacent functionality (especially navigation and state/cache behavior, which already have known issues). Use the existing state management, theming, and navigation patterns already in this codebase — don't introduce a new pattern for a single fix.

Where a note below is marked **(Assumption)**, confirm or adjust before implementing — I've made a reasonable guess but it may not match intent.

---

## Priority 1 — Critical Bugs

1. **App exits instead of navigating back.** From the "My Trip" screen (reached via the Profile tab), pressing back/exit closes the entire app instead of popping back to the previous screen. Find the navigation stack issue (likely a missing `Navigator.pop` or this route being mounted as a root/replacement route instead of pushed).

2. **UI shifts left on app reopen.** When the app is resumed from background, the layout visibly shifts left. Likely a `SafeArea`/`Directionality`/layout rebuild issue tied to the app lifecycle (`AppLifecycleState.resumed`). Audit any widget that rebuilds on resume.

3. **Filter and sort are broken** in:
   - General list screens (tickets/search results) — audit every screen with filter/sort controls, not just the two below.
   - Audit log (admin/operator side)
   - Search results screen
     Check whether the filter/sort UI is correctly wired to the underlying query/state, or if it's a dead UI control not connected to any handler.

4. **Search isn't live.** Currently requires pressing enter. Add debounced live filtering (e.g., 300–400ms debounce on text change) so results update as the user types, without needing to submit.

5. **Selected seats don't display for newly created cities/routes/buses.** After adding a new city, route, and bus through the admin/operator dashboard, the seat selection screen for that bus doesn't render selected seats. Likely a missing seat-layout association/sync when a bus is newly created, or a stale cache issue (see the related cache-invalidation bug already known on the dashboard side — check if it's the same root cause).

---

## Priority 2 — Search & Booking Flow

1. **From/To city input — autocomplete + dropdown.**
   On the search tab, both "From" and "To" fields should:
   - Filter a dropdown live as the user types any part of the city name.
   - Also allow picking directly from the dropdown shown below the search bar without typing anything.
     Apply identically to both fields.

2. **Boarding point / dropping point overhaul.**
   - Each city should have 2–3 real bus stops (currently likely just one generic point per city). Example structure for Mumbai-area stops: "Virwani Bus Stop — Malad", "Omkareshwar Temple Bus Stop — Borivali (East/West)".
   - Dropdown display format: **stop name first, then area/locality** — e.g. "Virwani Bus Stop, Malad" / "Omkareshwar Temple Bus Stop, Borivali (East)".
   - **(Assumption)** If a passenger doesn't manually pick a boarding/dropping point, default to the bus's overall start/end point for that route.
   - Add an **"Add Bus Stop"** action in both the Admin dashboard and Operator dashboard. Fields: bus stop name, locality/area (e.g. Malad, Kandivali, Borivali), and city.
   - Seed 2–3 bus stops for every city that currently exists in the system.

3. **Coupons / loyalty points redemption.**
   Add a section in the booking flow **after seat selection, before the payment tab** — where the price is shown — letting the user apply a coupon code or redeem loyalty points, with the price updating live to reflect the discount/redemption.

4. **Price breakdown — show tax transparently.**
   In the price distribution/breakdown view, add a line item for the tax component, labeled clearly, e.g. "GST (18%) — ₹X". **(Assumption)** 18% is the rate to display; pull the real rate from wherever tax config currently lives rather than hardcoding 18% if a config value exists, or add one in env of backend.

---

## Priority 3 — Admin / Operator Dashboard

1. **Add Bus Stop** (see Priority 2.2 above — same feature, just flagging it here since it's dashboard-side work): form with bus stop name, area/locality, and city.

2. **Route creation — require stop selection.**
   When creating a route, in addition to selecting the From city and To city, also require selecting:
   - A **start bus stop** from the From city's stop list
   - An **end bus stop** from the To city's stop list

3. **Change bus name.** Add an edit action allowing the bus's display name to be renamed after creation.

---

## Priority 4 — Account / Profile

1. **Ticket detail view should show passenger details** (name, and whatever other passenger fields are captured at booking) when viewing a ticket.

2. **Change password.** Add a "Change Password" option inside Profile / Edit Profile.

3. **Remove "My Trips" button from the Profile tab.** Note: this likely resolves the Priority-1 exit bug for _that_ entry point, but check whether "My Trips" is also reachable elsewhere (e.g. bottom nav) — if so, verify the back-navigation bug doesn't reappear there.

4. **Loyalty balance history.** Tapping the loyalty balance on the Profile tab should open a history view showing each point-earning event with a timestamp (when it was earned), not just the current total.

5. **Notifications.** Trigger a notification when a ticket is confirmed and when a ticket is deleted/cancelled.

6. **Polish:**
   - Add a back button in the top-left on screens that are missing one, for consistent navigation.
   - Add placeholder text to input fields app-wide where missing — e.g. "John Doe" for name fields, "name@example.com" for email, "Password" for password fields, and similarly for other inputs.

---

## Priority 5 — Backend / Data

1. **Rate limiting.** Increase the per-user rate limit to 950 requests. **(Assumption)** Apply this to whatever time window the current rate-limit config already uses (e.g. per minute/hour) — just confirm the existing window before changing the number so the change has the intended effect.

2. **Seed data expansion.** Add enough data to make the app feel populated:
   - At least 20 buses
   - Enough cities to support those buses' routes
   - Matching routes and schedules for each bus
   - 2–3 bus stops per city (ties into Priority 2.2)

---

## Working Instructions

- Go through Priority 1 first — these are functionality-breaking bugs, not enhancements.
- After each item, do a quick manual sanity check (or write a short test if the codebase has a test setup) before moving to the next.
- Don't refactor unrelated code while fixing a specific bug — keep diffs scoped.
- If a fix requires a schema change (e.g. bus stops, route start/end stops), check whether it needs a Prisma migration on the backend side rather than just a frontend change.
- Flag anything in this list that conflicts with existing architecture instead of forcing it in.
