import { z } from "zod";
import { publicCeremonyVenues } from "@/lib/public-venues";
import { swissRegistryOffices } from "@/lib/registry-data";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({ venueIds: z.array(z.string().uuid()).max(20) });

export async function POST(request: Request) {
  try {
    const limited = await rateLimit(request, "preference-venue-resolve", 60, 60_000);
    if (limited) return limited;
    const { venueIds } = schema.parse(await request.json());
    const requested = new Set(venueIds);
    const venues = publicCeremonyVenues.filter((venue) => venue.canonicalId && requested.has(venue.canonicalId)).map((venue) => {
      const office = swissRegistryOffices.find((item) => item.canonicalId === venue.standesamt_id || item.id === venue.standesamt_id || item.slug === venue.standesamt_id);
      const officialUrl = office?.onlineCalendarUrl?.startsWith("https://") ? office.onlineCalendarUrl
        : office?.appointmentBookingUrl?.startsWith("https://") ? office.appointmentBookingUrl
        : venue.venueUrl?.startsWith("https://") ? venue.venueUrl : undefined;
      return {
        canonicalId: venue.canonicalId!, slug: venue.slug, name: venue.traulokal_name,
        town: venue.ort, canton: venue.kanton, officeName: venue.standesamt_name,
        officeId: office?.canonicalId && /^[0-9a-f-]{36}$/i.test(office.canonicalId) ? office.canonicalId : undefined,
        maxGuests: venue.maxCeremonyGuests, saturday: venue.ceremonySaturday,
        outdoor: venue.outdoorCeremonyAvailable, officialUrl,
        hasCalendar: Boolean(office?.onlineCalendarUrl?.startsWith("https://")),
        schedule: { monday: venue.ceremonyMonday, tuesday: venue.ceremonyTuesday, wednesday: venue.ceremonyWednesday, thursday: venue.ceremonyThursday, friday: venue.ceremonyFriday, saturday: venue.ceremonySaturday, sunday: venue.ceremonySunday }
      };
    });
    venues.sort((a, b) => venueIds.indexOf(a.canonicalId) - venueIds.indexOf(b.canonicalId));
    return Response.json({ ok: true, venues }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) return Response.json({ ok: false }, { status: 400 });
    return Response.json({ ok: false }, { status: 500 });
  }
}
