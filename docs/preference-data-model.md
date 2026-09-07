# Anonymous preference data model

The website keeps behavioral analytics and structured intent data separate. Both use the existing
`hs_visitor` browser UUID, hashed with SHA-256 on the server. Raw visitor IDs, IP addresses, names,
email addresses, phone numbers, and user-agent strings are not stored in the preference tables.

## Tables

- `visitor_preference_profiles` is the pseudonymous root record. `visitor_hash` is unique and is the
  relation key used by the other intent tables.
- `search_contexts` stores one immutable snapshot per meaningful submitted search, including the
  filters and result count.
- `favorite_venues` stores references to canonical venue UUIDs and slugs. It does not duplicate
  venue content. A favorite may point to the search context from which it originated.
- `availability_interests` is append-only intent history for a date or date range and the normalized
  availability result.

`availability_status` is the single database enum: `available`, `unavailable`, `unknown`,
`manual_check`, or `not_supported`.

## Favorite lifecycle

There is exactly one `favorite_venues` row for each `(visitor_hash, venue_id)` pair. Removing a
favorite sets `removed_at`. Saving it again reactivates that row by setting `removed_at` to null and
refreshing `saved_at`, `venue_slug`, and (when applicable) `search_context_id`. Add/remove history
continues to live in analytics events, while the structured table remains an unambiguous current
state suitable for synchronization.

The canonical venue and office databases remain the source of truth. No foreign key is declared to
them because this website's Prisma connection owns only the application tables; UUID validation and
canonical-record resolution belong at the API boundary.

## Future account migration

Anonymous records are rooted in one profile rather than embedded browser IDs. A later account
feature can add an optional account relation to the profile and merge profiles transactionally
without changing canonical venue UUIDs or the search/favorite/availability record shape.
