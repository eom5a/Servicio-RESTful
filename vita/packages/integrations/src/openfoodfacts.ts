/**
 * Cliente de Open Food Facts (https://openfoodfacts.org). API pública,
 * sin autenticación, pero piden un User-Agent descriptivo.
 *
 * Dos endpoints distintos, con estados muy distintos verificados en
 * septiembre 2026 (ver `knowledge/integraciones/` — regla del documento
 * de arranque: verificar el estado real antes de integrar):
 * - Lookup por código de barras: API v2, estable y bien documentada
 *   (https://openfoodfacts.github.io/openfoodfacts-server/api/).
 * - Búsqueda por texto: el buscador legacy (`/cgi/search.pl`) está en
 *   proceso de sustitución por el nuevo servicio "Search-a-licious"
 *   (search.openfoodfacts.org), así que usamos este último. Su shape de
 *   respuesta exacto (¿`hits` o `products`?) no se pudo verificar en vivo
 *   en este entorno de desarrollo (el proxy de red del sandbox bloquea
 *   ambos dominios de Open Food Facts) — `searchProductsByName` acepta
 *   ambas formas de forma defensiva. Confirmar contra la API real la
 *   primera vez que se use en el servidor.
 */

const USER_AGENT = "VITA-PersonalHealthApp/0.1 (uso personal, un unico usuario)";

type OffNutriments = {
  "energy-kcal_100g"?: number;
  proteins_100g?: number;
  fat_100g?: number;
  carbohydrates_100g?: number;
  fiber_100g?: number;
};

type OffRawProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  nutriments?: OffNutriments;
};

export type OffProduct = {
  barcode: string | null;
  name: string;
  brand: string | null;
  kcalPer100g: number | null;
  proteinPer100g: number | null;
  fatPer100g: number | null;
  carbsPer100g: number | null;
  fiberPer100g: number | null;
};

function mapProduct(raw: OffRawProduct): OffProduct | null {
  if (!raw.product_name) return null;
  const n = raw.nutriments ?? {};
  return {
    barcode: raw.code ?? null,
    name: raw.product_name,
    brand: raw.brands?.split(",")[0]?.trim() || null,
    kcalPer100g: n["energy-kcal_100g"] ?? null,
    proteinPer100g: n.proteins_100g ?? null,
    fatPer100g: n.fat_100g ?? null,
    carbsPer100g: n.carbohydrates_100g ?? null,
    fiberPer100g: n.fiber_100g ?? null,
  };
}

export async function getProductByBarcode(barcode: string): Promise<OffProduct | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=code,product_name,brands,nutriments`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Open Food Facts: error ${res.status} al buscar el código de barras`);
  }
  const data = (await res.json()) as { status: number; product?: OffRawProduct };
  if (data.status !== 1 || !data.product) return null;
  return mapProduct(data.product);
}

export async function searchProductsByName(
  query: string,
  opts: { limit?: number } = {},
): Promise<OffProduct[]> {
  const url = new URL("https://search.openfoodfacts.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("langs", "es,en");
  url.searchParams.set("page_size", String(opts.limit ?? 20));
  url.searchParams.set("fields", "code,product_name,brands,nutriments");

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    throw new Error(`Open Food Facts: error ${res.status} al buscar "${query}"`);
  }
  const data = (await res.json()) as {
    hits?: OffRawProduct[];
    products?: OffRawProduct[];
  };
  const rawResults = data.hits ?? data.products ?? [];
  return rawResults
    .map(mapProduct)
    .filter((p): p is OffProduct => p !== null);
}
