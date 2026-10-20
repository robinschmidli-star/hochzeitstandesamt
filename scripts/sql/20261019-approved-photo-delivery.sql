-- Run only on the public replica (neondb), not the separate Prisma website database.
-- Public media are derived only from reviewed, active assets with granted rights.
-- Keep original uploads and permission evidence out of the public source repository.
CREATE VIEW web_public_photo_files AS
SELECT DISTINCT pl.id, pl.metadata->>'webp_base64' AS content_base64,
       pl.metadata->>'sha256' AS sha256
FROM photo_leads pl
JOIN photo_permissions pp ON pp.photo_lead_id=pl.id
JOIN venue_photos vp ON vp.photo_lead_id=pl.id
JOIN web_public_venues v ON v.id::text=vp.target_canonical_id
WHERE pl.status='approved' AND pp.status='allowed' AND vp.active
  AND pl.metadata->>'publication_approved'='true'
  AND pl.metadata->>'mime_type'='image/webp'
  AND pl.metadata->>'webp_base64' IS NOT NULL
  AND COALESCE(v.profile->>'published','true') <> 'false';

CREATE VIEW web_public_media AS
SELECT 'wedding_venue'::text AS entity_type,
       vp.target_canonical_id::uuid AS entity_id,
       vp.image_url, vp.alt_text AS image_alt,
       vp.sort_order=0 AS is_primary, vp.sort_order,
       NOT pp.attribution_required AS public_display_without_credit_approved,
       pp.status AS permission_status
FROM venue_photos vp
JOIN photo_leads pl ON pl.id=vp.photo_lead_id
JOIN photo_permissions pp ON pp.photo_lead_id=pl.id
JOIN web_public_venues v ON v.id::text=vp.target_canonical_id
WHERE vp.active AND pl.status='approved' AND pp.status='allowed'
  AND pl.metadata->>'publication_approved'='true'
  AND COALESCE(v.profile->>'published','true') <> 'false';

GRANT SELECT ON web_public_photo_files, web_public_media
TO website_public_reader, website_reader, website_public_publisher;
