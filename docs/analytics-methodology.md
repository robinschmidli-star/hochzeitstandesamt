# Analytics revision 3

Prepared 19 October 2026; live-source reconciliation and isolated end-to-end verification completed 20 October 2026. **Not deployed to production.** The effective date must be the verified
production deployment time, not this preparation date. Compare new instrumentation
only from the first complete Swiss calendar week after that deployment. Historical
event counts can still be compared with identical event definitions and exclusions.

## Definitions and event inventory

Every event has a server timestamp, SHA-256 browser identifier, UUID session, pathname
without query/fragment, market `CH`, and an allowlisted properties object. CH is not
visitor country. Browser identifiers are neither people nor couples. Repeat actions
increase actions, never distinct browser counts. Groups overlap.

Revision-3 common properties: measurement version, page language (not browser language),
viewport class, session entry-source category, allowlisted campaign code, session scope
and entry pathname. On entity pages: canonical entity ID/type/canton; venue actions
also carry the canonical venue ID. No recipient, telephone number, destination URL,
free search text, verification token or raw referrer is retained.

| Event | Trigger/location | Automatic? / repetition | Properties after sanitization | Report/dashboard use |
| --- | --- | --- | --- | --- |
| `page_view` | `Analytics`, navigation | Automatic; one per observed navigation; effect replay suppressed | Common fields | Actions, browsers, pages/browser, entry/device/language/campaign groups, home share, top pages |
| `search_started` | Search form submission, all-results CTA, deliberate suggestion selection | Deliberate; each submission may repeat | Random search ID, resolved search properties when a result page follows | Deliberate search actions/browsers; revision-3 ordered journey only |
| `search_filter_changed` | Search form field changes or filter links | Deliberate; each change may repeat | Allowlisted filter names; resolved result properties for navigation | Separate action/browser metric |
| `search_pagination` | Results pagination link | Deliberate; each navigation may repeat | Result properties | Separate metric; never counted as a new search |
| `search_results_viewed` | `SearchResultsExperience` rendered result section | Automatic, including default homepage results | Result count, known search canton/radius, filter names, exact resolved place ID/coordinates | Separate automatic displays and zero-result information; never proves search intent |
| `search_completed` | Historical `Analytics` URL effect | Historical automatic/intent unknown; persistent fingerprint previously suppressed legitimate repeats | Historical fields remain in DB; no new emission | Explicitly historical metric; not a journey entry |
| `venue_opened` | `TrackOnMount` on `/trauort/[slug]` | Automatic; repeated real navigation counts; replay/remount suppressed | Canonical venue/office IDs, venue label/canton | Venue actions/browsers, top venues, viewed canton, journey venue stage |
| `location_view` | `TrackOnMount` on `/zivilstandsamt/[slug]` | Automatic; same navigation rules | Canonical office identity/canton | Office actions/browsers; never venue views |
| `favorite_added`, `favorite_removed` | `FavoriteButton` | Deliberate; each toggle | Canonical venue ID | Separate action/browser metrics; not a required journey stage |
| `availability_clicked` | `AvailabilityCheck` button | Deliberate; can repeat | Canonical venue/office IDs; chosen date is dropped | Usage metric; not a booking |
| `official_link_clicked` | Historical explicit `AvailabilityCheck` handler | Deliberate; could repeat | Venue ID/language; historical meaning unknown | Legacy metric, never assumed qualified contact |
| `external_link_clicked` | Delegated document listener; explicit availability link handler | Deliberate; each click; explicit handler has `data-analytics-ignore` to prevent double counting | Channel (`phone`, `email`, `website`, `booking`), purpose (`contact`, `booking`, `website`, `source`, `unknown`), stable source entity | Separate channel/purpose actions and browsers. Only phone/email contact and explicit booking links qualify for the journey |
| `lead_started`, `shortlist_save_started` | `SearchLeadCapture` submit before request | Deliberate; retries may repeat | Canton/language plus common fields; personal form fields dropped | Tracking only, not stored leads; shortlist event retained by API |
| `lead_submitted`, `lead_created` | `SearchLeadCapture`, after successful lead API response | Deliberate; repeat successful saves may repeat | Same sanitized context | Separate tracking; these two event names are not added together as enquiries |
| `vendor_profile_opened` | Existing UNICO profile mount | Automatic, same replay rules | Existing profile slug as stable vendor identity, TG | Provider profile actions/browsers |
| `vendor_impression`, `vendor_website_clicked`, `vendor_contact_started`, `sponsored_impression`, `sponsored_click`, `gallery_used` | Accepted event names; no current emitting call site found | Not verified as instrumented | Allowlisted properties only | Absent data means not recorded; generic provider link clicks use `external_link_clicked` |

Database `WebsiteLead` counts are separate successful stored rows, including checklist,
vendor-request and saved-search types. `new` is not qualification. Duplicate IDs/status
exist but there is no universal, verified test/spam flag or browser/session foreign key.
Do not retroactively assign leads to browser journeys. Counts currently include stored
duplicates/tests if present and state that limitation explicitly.

## Sessions, attribution and journeys

Revision 3 uses a new storage key/UUID rather than reinterpreting old sessions. A session
expires after 30 minutes without observed activity. Trusted pointer, key, scroll and touch
activity extends an active session (throttled to 15 seconds). Web Locks serialize
same-origin tab updates; browsers without Web Locks explicitly use per-tab sessions.
Browser/device clock changes can affect the inactivity boundary. Entry source, campaign
and entry path are preserved for the session. Navigation remains functional when storage,
tracking, or the network fails. Client delivery is best effort, not guaranteed ingestion.

Source categories are derived from referrer hostname without retaining it. Historical
missing source is unknown, never backfilled as direct. New empty browser referrer is
reported as observed direct, which cannot prove the actual acquisition channel.
`NEXT_PUBLIC_ANALYTICS_CAMPAIGN_CODES` optionally allows exact public campaign codes
(comma-separated lowercase letters/digits/underscore/hyphen, max 60). Other UTM values
are classified unknown; raw source/medium/campaign values are never stored. No precise
visitor country is available.

Journey: revision-3 deliberate search → strictly later venue view → strictly later
qualified contact for the **same venue**, in the same browser **and** session. Each
stage is a distinct-browser subset of its predecessor. Sources/general websites and
unknown link meanings do not qualify. Favourites are optional. Direct venue entries
are derived from recorded session-entry paths, not from the first event remaining
inside a reporting window. Incomplete historical journeys show not fully measurable.
Even a qualifying click proves neither contact, enquiry quality nor booking.

## Regional demand

Search targets and viewed entity locations are separate from visitor location. Exact
known place/postcode matching uses the existing `switzerland-postal-codes` package;
free strings are discarded. Same-named postcodes within one canton use the mean of
their known coordinates, with a deterministic postal place key; ambiguous names
across cantons remain unknown. Coordinates represent search targets, not homes.

Winterthur pilot: Haversine distance ≤25 km from 47.499 N, 8.724 E, across canton borders.
This is a transparent approximate planning centre, not an official administrative
boundary. Historical audit uses exact known name/postcode/name+postcode terms and
requires every matching postal place to lie within the circle. Nonmatches include
both outside targets and unknown/unresolvable strings; never call them all outside.

## Quality and operational limits

Client and API exclude explicit internal/admin cookies, administrative/verification/API
paths, preview/local hosts, non-production Vercel environments and known automation
user agents. UUID validation and server-side property/path sanitization also apply to
direct API submissions. They do not authenticate humans or prevent forged requests.
Use `?hsa_internal=1` to exclude your browser; `?hsa_internal=0` clears that marker.
The switch is removed from the visible URL. Browser automation/local tests are excluded.

The analytics rate limit is a best-effort per-instance IP+browser bucket, 120 events/minute;
it avoids sharing one small quota across every person behind the same IP, and avoids
durable rate-limit writes for analytics. Rejected events have no persisted counter.
Unknown historical quality cannot be resolved without UA/request-log evidence.

Both rolling dashboard periods and the completed-week email call shared calculations.
The dashboard embeds the identical completed-week renderer. All dynamic report labels
are HTML escaped. Unknown source/device shares are visible; small lists are descriptive.
Previous zero gives `neu`/`–`; absent instrumentation shows not recorded. A period with
no events does not prove zero actual visits. Mixed pre/post rollout weeks remain partial.

Weekly bounds are independently converted Monday midnights in Europe/Zurich, covering
167/168/169-hour weeks and ISO year rollover. Two Monday UTC schedules (05:00/06:00)
plus local 07-hour guard cover both time changes. The existing recipient and authenticated
manual/backfill/dry-run/error handling are retained; dry-run does not need email keys.

The existing weekly Resend idempotency key is retained. It protects retries for 24 hours,
not forever; changed payloads can conflict and manual re-sends after expiry can duplicate.
There is no new durable delivery ledger/migration. Vercel execution is not an exact
07:00 delivery guarantee. These are release considerations, not claimed solved features.

References: [Resend idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys),
[Vercel cron precision](https://vercel.com/docs/cron-jobs/usage-and-pricing).

## Release gate

The live deployment was reconciled on 20 October against its Git checkout, confirmed
by the Vercel clone/build log. The current main changes were merged without conflicts;
newer venue records and permission-gated photos are retained. The former uploaded-source
archive no longer describes the current live deployment. A later deployment must be
rechecked before production release.

The isolated PostgreSQL/browser/API/dashboard/report flow now passes, including real
storage, shared browser/session across tabs, separate direct entry, source versus booking
links, a stored synthetic lead, identical dashboard/report HTML, and a hard mail-send
block. See analytics-e2e.md for the reproducible fixture. The optional local test mode
requires both explicit flags, loopback access, a dedicated loopback test database name,
and a nonproduction runtime. Test events are server-marked and excluded from default
business metrics. Dry-run HTML preview requires the same cron authentication and uses
private/no-store caching. No website production connection or production schema changed.

Production release still requires explicit deployment approval. No production release
or report email send was performed. The existing 24-hour mail idempotency limitation
remains as documented above.
