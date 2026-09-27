import { eq, sql } from "drizzle-orm";
import { db, meals, mealItems, foods } from "@vita/db";
import Link from "next/link";
import { LogoutButton } from "./logout-button";
import { MealLogger } from "./meal-logger";

// Depende de la sesión y del estado en vivo de la base de datos: nunca
// debe prerenderizarse de forma estática.
export const dynamic = "force-dynamic";

async function checkDatabase(): Promise<boolean> {
  try {
    await db.execute(sql`select 1`);
    return true;
  } catch {
    return false;
  }
}

async function getTodaysMeals() {
  const today = new Date().toISOString().slice(0, 10);
  return db
    .select({
      mealId: meals.id,
      mealType: meals.mealType,
      grams: mealItems.grams,
      foodName: foods.name,
      kcal: foods.kcal,
      proteinG: foods.proteinG,
    })
    .from(meals)
    .innerJoin(mealItems, eq(mealItems.mealId, meals.id))
    .innerJoin(foods, eq(foods.id, mealItems.foodId))
    .where(sql`${meals.ts}::date = ${today}::date`)
    .orderBy(meals.ts);
}

export default async function HoyPage() {
  const [dbOk, todaysMeals] = await Promise.all([
    checkDatabase(),
    getTodaysMeals(),
  ]);
  const today = new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const totals = todaysMeals.reduce(
    (acc, item) => {
      const factor = Number(item.grams) / 100;
      acc.kcal += Number(item.kcal) * factor;
      acc.proteinG += Number(item.proteinG) * factor;
      return acc;
    },
    { kcal: 0, proteinG: 0 },
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold capitalize">{today}</h1>
          <p className="text-sm text-neutral-400">
            VITA ·{" "}
            <Link href="/fitdays" className="underline">
              Importar Fitdays
            </Link>{" "}
            ·{" "}
            <Link href="/suplementos" className="underline">
              Suplementos
            </Link>{" "}
            ·{" "}
            <Link href="/integraciones" className="underline">
              Integraciones
            </Link>
          </p>
        </div>
        <LogoutButton />
      </header>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">
          Estado de la infraestructura
        </h2>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              dbOk ? "bg-emerald-500" : "bg-red-500"
            }`}
          />
          <span>
            Base de datos: {dbOk ? "conectada" : "sin conexión"}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
        <h2 className="mb-2 text-sm font-medium text-neutral-300">
          Comidas de hoy
        </h2>
        <p className="mb-3 text-sm text-neutral-400">
          {Math.round(totals.kcal)} kcal · {Math.round(totals.proteinG)} g
          proteína · objetivo 2100–2200 kcal / 180 g
        </p>
        {todaysMeals.length === 0 ? (
          <p className="text-sm text-neutral-500">
            Todavía no has registrado nada hoy.
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {todaysMeals.map((item, i) => (
              <li key={i} className="flex justify-between text-neutral-300">
                <span>
                  {item.foodName}{" "}
                  <span className="text-neutral-500">
                    ({item.grams} g, {item.mealType})
                  </span>
                </span>
                <span className="text-neutral-500">
                  {Math.round((Number(item.kcal) * Number(item.grams)) / 100)}{" "}
                  kcal
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <MealLogger />

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 text-sm text-neutral-400">
        <p>
          Esta es la pantalla &ldquo;Hoy&rdquo; provisional de la Fase 3. Su
          diseño definitivo lo decidirán los agentes en la Fase 4, a partir
          de <code>docs/metricas.md</code> y <code>docs/cruces.md</code>.
        </p>
      </section>
    </main>
  );
}
