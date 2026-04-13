/**
 * Cursor-based pagination utilities for API routes.
 *
 * Usage in a route handler:
 *   const { cursor, take } = parsePaginationParams(searchParams);
 *   const items = await prisma.model.findMany({
 *     ...buildPrismaArgs(cursor, take),
 *     where: { ... },
 *   });
 *   return NextResponse.json(buildPaginatedResponse(items, take));
 */

interface PaginationParams {
  cursor?: string;
  take: number;
}

/**
 * Parse cursor and limit from URL search params.
 *
 * @param searchParams  Request URL search params
 * @param defaultTake   Default page size (default 25)
 * @param maxTake       Maximum page size (default 100)
 */
export function parsePaginationParams(
  searchParams: URLSearchParams,
  defaultTake = 25,
  maxTake = 100
): PaginationParams {
  const cursor = searchParams.get("cursor") ?? undefined;
  const rawTake = parseInt(searchParams.get("limit") ?? "", 10);
  const take = Number.isFinite(rawTake) && rawTake > 0
    ? Math.min(rawTake, maxTake)
    : defaultTake;

  return { cursor, take };
}

/**
 * Build Prisma findMany arguments for cursor-based pagination.
 * Fetches take+1 to determine if there are more results.
 */
export function buildPrismaArgs(cursor?: string, take = 25) {
  return {
    take: take + 1,
    ...(cursor
      ? { cursor: { id: cursor }, skip: 1 }
      : {}),
    orderBy: { createdAt: "desc" as const },
  };
}

interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

/**
 * Build a paginated response from a query result.
 * The query should have fetched take+1 items (via buildPrismaArgs).
 */
export function buildPaginatedResponse<T extends { id: string }>(
  items: T[],
  take: number
): PaginatedResponse<T> {
  const hasMore = items.length > take;
  const data = hasMore ? items.slice(0, take) : items;
  const nextCursor = hasMore ? data[data.length - 1]?.id ?? null : null;

  return { data, nextCursor, hasMore };
}
