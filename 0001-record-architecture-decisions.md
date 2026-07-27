# 1. Record architecture decisions

**Status:** Accepted
**Date:** 2026-07-25

## Context

As the project grows past its initial foundation, decisions get made in
PR discussions and chat threads and then become invisible — six months
later, nobody remembers *why* something was built a certain way, and
"just clean it up" PRs accidentally undo intentional trade-offs (see, for
example, the deliberate `RESTRICT` vs. `CASCADE` choices documented per
relation in `DATABASE_DESIGN.md` §6 — those look inconsistent until you
read the reasoning).

## Decision

We will keep a lightweight log of Architecture Decision Records (ADRs) in
`docs/adr/`, one file per decision, numbered sequentially. Each new ADR:

1. Copies this file's format: **Status**, **Date**, **Context**,
   **Decision**, **Consequences**.
2. Gets a short, descriptive filename: `NNNN-kebab-case-title.md`.
3. Is never edited to reverse a decision — if a decision changes, write a
   *new* ADR that supersedes the old one, and mark the old one's Status as
   `Superseded by NNNN`. The log is a history, not a wiki page.

An ADR is warranted for decisions that are **expensive to reverse** or
**not obvious from reading the code** — e.g. choosing Prisma over a raw
query builder, the dual-gateway payment design, the polymorphic
association pattern used for `Booking`/`Review`/`WishlistItem`. Routine
implementation choices (which library for date formatting, component file
naming) don't need one.

## Consequences

- A small amount of friction is added to significant decisions (writing
  one short file).
- Future contributors — including future us — get a searchable "why"
  alongside the "what" already covered by `ARCHITECTURE.md` and
  `DATABASE_DESIGN.md`.
- This only works if it's kept up — an empty or stale `docs/adr/` is worse
  than no convention at all. Revisit this ADR itself if the team stops
  using it.
