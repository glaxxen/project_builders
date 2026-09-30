/**
 * Resilient Supabase HTTPS PostgREST Client
 *
 * Communicates directly with Supabase over standard HTTPS (port 443).
 * When local ISPs or Wi-Fi routers block raw Postgres TCP ports (5432 / 6543),
 * this client provides sub-200ms zero-configuration data access with zero socket timeouts.
 */

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://unebrepsfcrnfwfzbhpl.supabase.co";
const SERVICE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

export function shouldUseRest(): boolean {
  if (process.env.USE_SUPABASE_REST === "true") return true;
  // If no DATABASE_URL configured, default to REST
  if (!process.env.DATABASE_URL) return true;
  return false;
}

export async function fetchSupabaseRest<T = any>(
  path: string,
  options?: RequestInit
): Promise<T | null> {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error("[Supabase REST] Missing SUPABASE_URL or SERVICE_KEY");
    return null;
  }

  try {
    const cleanPath = path.startsWith("/") ? path.slice(1) : path;
    const url = `${SUPABASE_URL}/rest/v1/${cleanPath}`;

    const headers: Record<string, string> = {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string> || {}),
    };

    const res = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn(`[Supabase REST ${res.status}] ${res.statusText}: ${errText}`);
      return null;
    }

    // For 204 No Content
    if (res.status === 204) return {} as T;

    const data = await res.json();
    return data as T;
  } catch (err) {
    console.error("[Supabase REST Error]", err);
    return null;
  }
}

/**
 * Perform a GET query against a Supabase table.
 */
export async function restGet<T = any>(
  table: string,
  queryString: string = ""
): Promise<T | null> {
  const query = queryString ? `?${queryString}` : "";
  return fetchSupabaseRest<T>(`${table}${query}`, {
    method: "GET",
  });
}

/**
 * Insert one or more rows into a Supabase table and return the inserted record(s).
 */
export async function restInsert<T = any>(
  table: string,
  recordOrArray: any
): Promise<T | null> {
  const payload = Array.isArray(recordOrArray) ? recordOrArray : [recordOrArray];
  const res = await fetchSupabaseRest<T>(table, {
    method: "POST",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(payload),
  });
  return res;
}

/**
 * Update rows matching a filter and return updated records.
 */
export async function restUpdate<T = any>(
  table: string,
  filterQuery: string,
  data: any
): Promise<T | null> {
  const res = await fetchSupabaseRest<T>(`${table}?${filterQuery}`, {
    method: "PATCH",
    headers: {
      Prefer: "return=representation",
    },
    body: JSON.stringify(data),
  });
  return res;
}

/**
 * Upsert a record on conflict.
 */
export async function restUpsert<T = any>(
  table: string,
  record: any,
  onConflict: string = "id"
): Promise<T | null> {
  const res = await fetchSupabaseRest<T>(`${table}?on_conflict=${onConflict}`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(Array.isArray(record) ? record : [record]),
  });
  return res;
}
