# Travelling with Manisha — Database Design

**Status:** Official database specification
**Source of truth:** `prisma/schema.prisma` (PostgreSQL, via Prisma ORM)
**Scope:** This document describes the schema as designed and reviewed for a
100,000+ user production target. It is descriptive of `schema.prisma` — if
the two ever disagree, the schema file is correct and this document is
stale and should be updated to match.

---

## 1–3. Models, Purpose, and Relationships

Models are grouped by domain. For each: purpose, key fields, and how it
relates to the rest of the graph.

### 1.1 Identity

**`User`** — Every account on the platform: Traveler, Homestay Owner,
Admin, and Super Admin, distinguished by the `role` enum. Auth credentials
live in Supabase Auth; `User.supabaseId` links to `auth.users.id`. One
table for all roles keeps every downstream foreign key (bookings, reviews,
wishlists…) pointing at a single, simple target instead of four.

- **Has one** `OwnerProfile` (owner-specific fields)
- **Has many** `Homestay` (as owner), `HomestayStaff`, `TourPackage` (as
  creator), `Blog` (as author), `Booking`, `Review`, `WishlistItem`,
  `Notification`, `Coupon` (as creator), `CouponUsage`, `Refund` (as
  requester and, separately, as processor), `AuditLog` (as actor)

**`OwnerProfile`** — 1:1 extension of `User` holding fields only relevant
to Homestay Owners (business name, registration number, payout method).
Split out rather than adding nullable columns to every `User` row.

**`HomestayStaff`** — Many-to-many join between `User` and `Homestay` with
a role (`OWNER` / `MANAGER` / `STAFF`), enabling a homestay to be run by a
team rather than a single person. `invitedById` records which user added
them, with a real, enforced FK (`onDelete: SetNull`, added in a follow-up
migration — see `MIGRATION_NOTES.md` §9) so the inviter's account can
later be removed without being blocked by, or cascading into, staff rows
they invited. `Homestay.ownerId` remains the
authoritative billing/legal owner for the common single-owner case; this
table is additive for co-management.

### 1.2 Catalog

**`Destination`** — A place travelers browse by (city/region/country).
**Has many** `Homestay`, `TourPackage`, `DestinationTranslation`.

**`Homestay`** — A bookable property. Belongs to one `Destination` and one
owning `User`; may have additional `HomestayStaff`. **Has many** `Room`,
`Booking`, `Review`, `WishlistItem` (via join), `Coupon` (scoped
promotions), `HomestayTranslation`.

**`Room`** — A room *type* within a homestay (e.g. "Deluxe Double"), not a
single physical room — `totalUnits` tracks how many identical units exist.
**Belongs to** `Homestay`. **Has many** `Booking`, `AvailabilityCalendar`.

**`AvailabilityCalendar`** — One row per `(room, date)`, tracking
`availableUnits` and an optional per-date `priceOverride`. The system of
record for both search ("is this room free?") and overbooking prevention.

**`TourPackage`** — A multi-day guided tour. Belongs to one `Destination`;
created/maintained by an admin `User`. **Has many** `Itinerary` (day-by-day
plan), `Booking`, `Review`, `WishlistItem`, `Coupon`,
`TourPackageTranslation`.

**`Itinerary`** — One row per day of a `TourPackage` (`dayNumber` unique
per package): title, description, activities, meals, location.

### 1.3 Transactions

**`Booking`** — The central transactional record. Serves *both* homestay
stays and tour package bookings via a `type` discriminator
(`BookingType`); `homestayId`/`roomId` populate for `HOMESTAY` bookings,
`tourPackageId` for `TOUR_PACKAGE` bookings. **Belongs to** `User`,
optionally `Homestay`/`Room`/`TourPackage`, optionally `Coupon`. **Has
many** `Payment`, `Refund`; **has one** `Review`, `CouponUsage`.

**`Payment`** — One attempt to pay for a `Booking` via Stripe or Razorpay
(`gateway`). A booking can have multiple payments (failed retry, deposit +
balance). **Has many** `Refund`.

**`Refund`** — A refund against a specific `Payment` (and, denormalized,
its `Booking`), tracking who requested it and who processed it separately.

### 1.4 Engagement

**`Review`** — Polymorphic over `Homestay`/`TourPackage` (`targetType` +
two nullable FKs — see §5). Optionally linked 1:1 to the `Booking` it
verifies, guaranteeing at most one review per completed stay/tour.

**`WishlistItem`** — Polymorphic join between `User` and
`Homestay`/`TourPackage` for saved listings.

**`Coupon`** — A discount code, optionally scoped to one `Homestay` or
`TourPackage` (or `ALL`). **Has many** `Booking` (redemptions),
`CouponUsage`.

**`CouponUsage`** — One row per redemption (1:1 with the `Booking` that
used it), separate from `Coupon.timesUsed` so per-user limits can be
enforced by count and the aggregate can be audited/recomputed.

**`Notification`** — In-app/user-facing notification, loosely pointing
(no FK) at the entity that triggered it.

**`Blog`** — Editorial content authored by a `User` (admin/marketing).
**Has many** `BlogTranslation`.

**`*Translation` models** (`DestinationTranslation`, `HomestayTranslation`,
`TourPackageTranslation`, `BlogTranslation`) — Locale-specific overrides of
translatable fields, one row per `(parent, locale)`. Absence of a row for a
locale falls back to the base model's fields (treated as the source
locale). See §14.

**`AuditLog`** — Generic, append-only record of sensitive/administrative
actions (approvals, refund decisions, role changes). See §9.

---

## 4. Important Indexes

Indexes are chosen for the query patterns each model actually serves, not
applied blanket-style. Highlights:

| Model | Index | Serves |
|---|---|---|
| `Booking` | `(roomId, startDate, endDate)` | Availability-overlap check — the single hottest query in the schema |
| `Booking` | `(userId, status)`, `(homestayId, status)`, `(tourPackageId, status)` | "My bookings", owner dashboards, filtered by status |
| `Booking` | `(createdAt)` | Revenue/volume reporting by date range |
| `Homestay` / `TourPackage` | `(destinationId, status, deletedAt)` | Public search/listing by destination, published + not deleted |
| `AvailabilityCalendar` | `@@unique(roomId, date)` | One row per room/day; also the natural lookup index |
| `AvailabilityCalendar` | `(date, status)` | Ops/admin views across all rooms on a given date |
| `Review` | `(homestayId, isApproved)`, `(tourPackageId, isApproved)` | Public review listings excluding unmoderated content |
| `Payment` | `(bookingId)`, `(status)`, `(createdAt)` | Booking payment history, reconciliation, reporting |
| `Coupon` | `(isActive, validFrom, validUntil)` | Validating a code at checkout |
| `Notification` | `(userId, isRead, createdAt)` | Unread-first notification feed |
| `WishlistItem` | `(homestayId)`, `(tourPackageId)` standalone | "Most wishlisted" analytics, independent of any one user |
| `AuditLog` | `(entityType, entityId)`, `(actorId)`, `(createdAt)` | "History of this record" / "actions by this admin" / time-range audit export |

Every foreign key column is indexed, either explicitly via `@@index` or
implicitly as the leftmost column of a `@@unique`/`@@id` constraint — this
was a specific gap closed during the architecture review (originally
missing on `Booking.couponId`, `Refund.requestedById`,
`Coupon.createdById/homestayId/tourPackageId`, and standalone
`WishlistItem.homestayId/tourPackageId`).

**Deferred to migration (not expressible in Prisma schema syntax):**
- A GIN index on `Blog.tags` for array-containment search.
- A `CHECK` constraint enforcing exactly one of `homestayId`/`tourPackageId`
  is set on `Booking`, `Review`, `WishlistItem`, `Coupon` (see §5).
- A `CHECK` constraint enforcing `Payment.refundedAmount <= Payment.amount`.
- A `CHECK` constraint enforcing `Review.rating BETWEEN 1 AND 5`.

---

## 5. Business Rules

- **Polymorphic associations** (`Booking`→Homestay/TourPackage,
  `Review`→Homestay/TourPackage, `WishlistItem`→Homestay/TourPackage,
  `Coupon`→Homestay/TourPackage) are modeled as two nullable foreign keys
  plus a discriminator enum, rather than a single generic `targetId`
  column — this preserves real, DB-enforced referential integrity (a
  generic `targetId` would not). Prisma's schema language cannot express
  an "exactly one of these two columns is non-null" constraint, so this
  **must** be added as a raw SQL `CHECK` constraint in the first
  migration; until then it is enforced only at the application layer.
- **One review per booking**: `Review.bookingId` is unique and nullable —
  a review either verifies a specific completed booking (at most one) or
  is unlinked (e.g. legacy/imported reviews).
- **One coupon redemption per booking**: `CouponUsage.bookingId` is
  unique — a booking can apply at most one coupon.
- **One itinerary entry per day**: `Itinerary` has a unique
  `(tourPackageId, dayNumber)` constraint.
- **One availability row per room per day**: `AvailabilityCalendar` has a
  unique `(roomId, date)` constraint; `availableUnits` must never exceed
  `Room.totalUnits` (app-layer invariant).
- **Rating bounds**: `Review.rating` is constrained to 1–5 at the
  application layer (schema stores it as `SMALLINT`; DB-level `CHECK`
  recommended as a second line of defense).
- **Coupon usage limits**: `usageLimit` (global) and `usageLimitPerUser`
  are enforced by counting `CouponUsage` rows at redemption time, inside
  the same transaction that creates the `Booking`.

---

## 6. Cascade Strategy

Cascade behavior is deliberately **not uniform** — it follows one rule:
*"Would deleting the parent silently destroy something we're legally or
financially obligated to keep, or something another user relies on?"*

| Relationship | Behavior | Why |
|---|---|---|
| `Booking.user/homestay/room/tourPackage/coupon` → parent | **Restrict** | A booking is a financial/legal record; its parents can never be hard-deleted while it exists. Forces soft delete instead. |
| `Payment.booking`, `Refund.payment/booking/requestedBy` | **Restrict** | Same reasoning — payment and refund history must be immutable and always resolvable to its booking/user. |
| `Review.user` | **Restrict** | Reviews are public content other users rely on and that feed into a listing's aggregate rating; deleting a user must not silently delete their reviews. See GDPR handling in §11 — accounts are anonymized, not hard-deleted. |
| `Review.homestay/tourPackage` | **Cascade** | If the listing itself is hard-deleted, its reviews have no reason to exist independently. |
| `Homestay.owner`, `Destination` references from `Homestay`/`TourPackage`, `Blog.author`, `TourPackage.createdBy`, `Coupon.createdBy` | **Restrict** | Prevents deleting a user/destination out from under live listings/content. |
| `Room` → `Homestay`, `AvailabilityCalendar` → `Room`, `HomestayStaff` → `Homestay`/`User`, `*Translation` → parent, `Itinerary` → `TourPackage` | **Cascade** | Purely dependent, non-financial child data — no reason to survive an intentional hard delete of the parent. |
| `WishlistItem`, `Notification`, `CouponUsage.coupon/booking` | **Cascade** | Personal/ephemeral data; safe to lose alongside the parent. |
| `CouponUsage.user` | **Restrict** | Preserves the redemption audit trail even if cascades elsewhere are relaxed later. |
| `Refund.processedBy`, `AuditLog.actor`, `HomestayStaff.invitedBy` | **SetNull** | The refund/audit/staff record itself must survive even if the *actioning admin's* (or inviter's) account is later removed — only the attribution is lost, not the record. |
| `Notification.relatedEntityId` | **No FK at all** | Intentional — the referenced entity type varies per notification, and a notification should remain readable even after its source row is gone. |

**General principle:** every model that touches money (`Booking`,
`Payment`, `Refund`, `CouponUsage`) or public trust (`Review`) restricts
deletion of anything it depends on. Everything else cascades or nulls out.

---

## 7. Soft Delete Strategy

Soft delete (`deletedAt DateTime?`) is applied **selectively**, not
uniformly, based on whether a row needs to remain queryable for history,
compliance, or referential reasons after a user-facing "delete":

**Has `deletedAt`:** `User`, `Homestay`, `Room`, `TourPackage`, `Blog`,
`Booking`, `Review`, `Coupon`, `Destination`.

**Does NOT have `deletedAt`** (by design):
- `Payment`, `Refund` — immutable financial records; they are never
  "deleted", only transitioned through `status`. Deleting a payment
  record would itself be a compliance problem.
- `AvailabilityCalendar`, `Itinerary`, `CouponUsage` — pure operational/
  join data with no independent lifecycle; safe to hard-delete or simply
  overwritten.
- `Notification` — ephemeral by nature; hard delete (or a future TTL/
  archival job) is appropriate.
- `WishlistItem` — a preference toggle; hard-deleted the moment a user
  removes an item.
- `OwnerProfile`, `HomestayStaff`, `*Translation`, `AuditLog` — extension/
  join/log tables whose relevance is entirely tied to their (soft- or
  hard-deletable) parent; they don't need independent soft delete.

**Application-layer requirement:** every read path that lists soft-
deletable models must filter `deletedAt: null` — this is not enforced by
the database (Postgres has no native "soft delete" concept) and must be a
consistent convention in the `services/` layer, e.g. a shared Prisma
middleware/extension that injects the filter automatically to prevent a
forgotten `WHERE deletedAt IS NULL` from leaking archived rows.

---

## 8. Security Considerations

- **No plaintext financial secrets.** `OwnerProfile.payoutDetails` is
  flagged in-schema: raw bank account/card numbers must not be stored
  here. Prefer a tokenized reference issued by the payment provider
  (`payoutProviderAccountId` — e.g. a Stripe Connect or Razorpay Route
  account id). If any raw payout data must be retained, it requires
  application-layer (column-level) encryption — Postgres storage/backups
  are not an acceptable trust boundary for bank details on their own.
- **Server-only secrets never reach the client.** This is enforced at the
  application layer per `ARCHITECTURE.md` (no `SUPABASE_SERVICE_ROLE_KEY`,
  gateway secret keys, etc. in `"use client"` files) — the schema itself
  has no client/server distinction, so this remains a code-review
  discipline, not a database guarantee.
- **Fraud signal capture.** `Booking.ipAddress`/`userAgent` are captured
  at creation time to support fraud investigation (e.g. many bookings
  across many accounts from one IP). Explicitly *not* used for
  personalization or any purpose beyond security review.
- **Row-Level Security (RLS).** Because Auth is Supabase-hosted, Postgres
  RLS should be enabled on user-facing tables as defense-in-depth
  alongside application-layer authorization checks in the `services/`
  layer — a compromised or buggy API route should not be a full bypass of
  data access rules. RLS policies are out of scope for `schema.prisma`
  itself and must be added via raw SQL migrations.
- **No cross-role trust assumptions.** `Role` is a single enum column on
  `User` rather than separate tables specifically so that authorization
  checks have one canonical place to read from — but this also means a
  compromised admin account has broad reach by design; sensitive actions
  (refund approval, role changes, listing suspension) are expected to be
  written to `AuditLog` for after-the-fact review (see §9).

---

## 9. Audit Strategy

A single, generic, **append-only** `AuditLog` table captures
sensitive/administrative actions platform-wide — refund approvals, listing
approvals/suspensions, coupon creation, role changes, price overrides —
rather than adding `updatedById`/change-history columns to every
individual model.

- `actorId` **does** have a real, enforced foreign key to `User`, using
  `onDelete: SetNull` rather than `Restrict`: an audit row must remain
  readable even after the actor's `User` row is anonymized or removed, so
  only the attribution is nulled out on deletion, never the audit record
  itself. (An earlier draft of this document, and of the schema's own
  doc-comment, incorrectly described this field as having no FK at all —
  both have been corrected to match the actual, always-enforced relation.)
- `changes` (`Json`) holds a structured before/after diff or action-
  specific payload, keeping the table generic across action types.
- `entityType` + `entityId` let the log be queried either as "history of
  this record" or "everything this admin did", both covered by indexes.
- Complements, but does not replace, the domain-specific audit trails
  already built into individual models: `Refund.requestedById` /
  `processedById`, `Coupon.createdById`, `TourPackage.createdById`,
  `Blog.authorId` all give first-class, indexed, FK-enforced provenance
  for their respective entities. `AuditLog` is for cross-cutting and
  administrative actions that don't belong to one model.

---

## 10. Payment Flow

1. A `Booking` is created with `status = PENDING` and pricing fields
   (`subtotal`, `discountAmount`, `taxAmount`, `totalAmount`) computed and
   frozen at creation time (never recalculated live from current
   Room/TourPackage prices, so historical bookings remain accurate even
   if prices later change).
2. A `Payment` row is created with `status = PENDING`, an `idempotencyKey`
   generated client-side (so a double-click/retry on "Pay" cannot create
   two gateway charges for the same attempt), and a `gatewayOrderId` (the
   Stripe Checkout Session id or Razorpay Order id) once the gateway
   session/order is opened.
3. On successful gateway confirmation (webhook), the `Payment` is updated
   to `status = SUCCEEDED`, `paidAt` set, `gatewayPaymentId` recorded,
   and the raw webhook payload stored in `gatewayMetadata` for audit/
   dispute resolution. The parent `Booking.status` transitions to
   `CONFIRMED`.
4. On failure, `Payment.status = FAILED` with `failureReason` recorded;
   the `Booking` remains `PENDING`/`AWAITING_PAYMENT`, and the user may
   retry — creating a **new** `Payment` row (never reusing/overwriting the
   failed one), which is why `Payment` is 1-to-many from `Booking`.
5. Gateway selection (Stripe vs. Razorpay) happens by currency/locale in
   the service layer per `ARCHITECTURE.md`'s `payment.service.ts`
   abstraction; the schema stays gateway-agnostic via the `PaymentGateway`
   enum on each `Payment` row rather than separate tables per gateway.
6. `Payment.refundedAmount` is maintained as a running total by
   `refund.service.ts` whenever a `Refund` is written (same transaction),
   so "is this payment fully refunded?" is a single-column read rather
   than a `SUM()` over `Refund` on every check.

---

## 11. Booking Flow

1. **Availability check.** For `HOMESTAY` bookings, the requested
   `(roomId, startDate, endDate)` range is checked against
   `AvailabilityCalendar` rows for that room.
2. **Transactional hold + create.** Inside a single database transaction:
   - Row-lock the relevant `AvailabilityCalendar` rows
     (`SELECT ... FOR UPDATE`) for the date range.
   - Verify `availableUnits >= requested units` on every date in range.
   - Decrement `availableUnits` accordingly.
   - Insert the `Booking` row (`status = PENDING`).
   This ordering — lock, verify, decrement, insert — is what prevents two
   concurrent requests from both succeeding for the last unit on the same
   date (see the detailed locking strategy documented on
   `AvailabilityCalendar` in the schema, including the optimistic-
   concurrency `version` fallback for lower-contention writes).
3. **Coupon application (optional).** If a coupon code is supplied, it is
   validated (`isActive`, date range, `minBookingAmount`, per-user/global
   usage limits via `CouponUsage` count) and a `CouponUsage` row is
   created atomically with the `Booking`.
4. **Payment.** See §10 — a `Booking` sits in `PENDING`/
   `AWAITING_PAYMENT` until a `Payment` succeeds, at which point it
   becomes `CONFIRMED`.
5. **Cancellation.** Sets `status = CANCELLED`, `cancelledAt`, and
   `cancellationReason`; the corresponding `AvailabilityCalendar` rows
   must be released (`availableUnits` incremented back) by the same
   service call, and any eligible refund is initiated per §12.
6. **Completion.** Once `endDate` has passed for a `CONFIRMED` booking,
   a scheduled job transitions it to `COMPLETED`, which is also the point
   at which the traveler becomes eligible to leave a `Review` (enforced
   via `Review.bookingId`'s uniqueness plus an application check that the
   referenced booking belongs to the reviewing user and is `COMPLETED`).
7. **Tour package bookings** follow the same state machine but skip the
   `AvailabilityCalendar` locking step, instead checking `maxGroupSize`
   against already-confirmed bookings for the same `tourPackageId` +
   `startDate`.

---

## 12. Refund Flow

1. A `Refund` is **requested** (`status = REQUESTED`) — either by the
   traveler (self-service cancellation within policy) or by an admin on
   the traveler's behalf — against a specific `Payment`, with
   `requestedById` recorded.
2. An admin/staff member **approves or rejects** the request
   (`status = APPROVED` / `REJECTED`), recorded via `processedById`
   (nullable until this step) — this is also written to `AuditLog` as an
   administrative action (§9).
3. On approval, the refund is submitted to the original payment gateway
   (Stripe or Razorpay, matching `Payment.gateway`) and moves to
   `PROCESSING`, then `PROCESSED` on gateway confirmation
   (`gatewayRefundId` and `gatewayMetadata` recorded, `processedAt` set)
   or `FAILED` if the gateway rejects it.
4. On `PROCESSED`, `Payment.refundedAmount` is incremented by
   `Refund.amount` in the same transaction, and `Payment.status` is set
   to `PARTIALLY_REFUNDED` or `REFUNDED` depending on whether
   `refundedAmount` now equals `Payment.amount`.
5. **Integrity invariant:** `Refund.amount` must never cause
   `Payment.refundedAmount` to exceed `Payment.amount` — enforced at the
   application layer today, with a database-level `CHECK` constraint
   recommended as a second line of defense (deferred to the first
   migration, since Prisma's schema language cannot express `CHECK`
   constraints directly).
6. A `Booking` can accumulate multiple `Refund` rows (e.g. a partial
   refund for early checkout, followed by a full cancellation refund),
   which is why `Refund` is 1-to-many from both `Payment` and `Booking`.

---

## 13. Future Scalability Notes

- **`AvailabilityCalendar` growth.** Grows by `rooms × 365` rows/year.
  Generate only a rolling window (e.g. 18 months ahead) rather than
  materializing years up front; consider native Postgres range-
  partitioning by `date` once row counts reach the tens-of-millions
  range.
- **Stronger overbooking guarantee.** The current defense is transactional
  row-locking at the service layer (§11). A future migration can add a
  Postgres `EXCLUDE` constraint (via the `btree_gist` extension) to
  prevent overlapping confirmed bookings for the same room at the
  database level as a second line of defense — not expressible in Prisma
  schema syntax, so it must be raw SQL.
- **Search at scale.** Faceted/full-text search (price range, amenities,
  location, free-text) will outgrow direct Postgres querying well before
  100k users; plan to move listing search to a dedicated index (e.g.
  Typesense/Meilisearch/Elasticsearch) fed by change-data-capture or
  service-layer writes, keeping Postgres as the system of record.
- **Read replicas.** Reporting/analytics queries (revenue by date range,
  admin dashboards) should be pointed at a read replica once they start
  competing with transactional (booking/payment) traffic — the
  `createdAt` indexes added on `Booking`/`Payment` are chosen with this
  read pattern in mind.
- **AI-feature compatibility.** `Review.sentimentScore` is a reserved,
  currently-unused nullable column for a future moderation/insights
  pipeline. If semantic search (e.g. "homestays near a quiet beach with a
  kitchen") is built later, it will most likely require a `pgvector`
  extension and embedding columns on `Homestay`/`TourPackage`/`Blog` —
  intentionally not added now to avoid committing to an embedding
  dimensionality/model before there's a concrete feature to build against.
- **Multi-owner / team accounts.** `HomestayStaff` already supports this
  (§1.1); if teams outgrow per-homestay roles (e.g. an agency managing
  dozens of properties), a future `Organization` model owning many
  `Homestay` rows is the natural next step — not needed at current scale.
- **Multi-currency at scale.** Prices are stored as `Decimal(10,2)` with a
  3-letter `currency` code per row (`Room`, `TourPackage`, `Booking`,
  `Payment`). This supports today's INR/international split; a currency
  with zero decimal places (e.g. JPY) would need either a scale exception
  or a minor-units-integer storage convention if added later.
- **Notification volume.** No soft delete/TTL exists yet on
  `Notification` (§7); at scale this table should get a retention job
  (archive or hard-delete read notifications older than N months) to
  keep it from growing unbounded.

---

## 14. Multi-Language Readiness (supplementary)

Translatable content (`Destination`, `Homestay`, `TourPackage`, `Blog`)
uses a satellite `*Translation` table per model rather than JSON columns
or a generic `Translation` table, so each stays strongly typed and
independently indexable. Convention:

- The base model's own fields (`name`, `description`, `title`, etc.) are
  the **source/default locale**.
- A `*Translation` row exists only where an override has been authored;
  missing locale → fall back to the base model's fields.
- `User.locale` (ISO 639-1, e.g. `"en"`, `"hi"`) indicates which
  translation to prefer when rendering for a given user.
- Uniqueness is enforced per `(parentId, locale)` on every translation
  table, preventing duplicate translations for the same locale.

---

*This document reflects `schema.prisma` as of the review pass described in
this conversation. No further schema changes are expected except in
response to a critical issue discovered during migration or implementation
— any such change should be reflected here in the same session.*
