import { NextResponse } from "next/server";
import { buildNameSearchSuggestions, nameMatchRank } from "@/lib/name-search";

const suggestions = buildNameSearchSuggestions();

export function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.trim().slice(0, 120) ?? "";
  if (query.length < 2) return NextResponse.json({ suggestions: [] });

  const matches = suggestions
    .map((suggestion) => ({
      suggestion,
      rank: nameMatchRank(suggestion.name, query, [suggestion.searchText])
    }))
    .filter((entry): entry is { suggestion: (typeof suggestions)[number]; rank: number } => entry.rank !== null)
    .sort((left, right) =>
      left.rank - right.rank || left.suggestion.name.localeCompare(right.suggestion.name, "de-CH")
    )
    .slice(0, 8)
    .map(({ suggestion }) => suggestion);

  return NextResponse.json(
    { suggestions: matches },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600" } }
  );
}
