"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { FrequencyType } from "@/lib/types";

export type HabitFormState = { error: string } | null;

function parseFrequencyConfig(frequencyType: FrequencyType, formData: FormData) {
  if (frequencyType === "weekly_n_times") {
    const times = Number(formData.get("weekly_times") ?? 3);
    return { times: Number.isFinite(times) ? Math.min(Math.max(times, 1), 6) : 3 };
  }
  if (frequencyType === "specific_days") {
    const days = formData
      .getAll("specific_days")
      .map((d) => Number(d))
      .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
    return { days };
  }
  return {};
}

export async function createHabit(
  _prevState: HabitFormState,
  formData: FormData,
): Promise<HabitFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ponle un nombre al hábito." };

  const frequencyType = (formData.get("frequency_type") as FrequencyType) || "daily";

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    name,
    emoji: String(formData.get("emoji") ?? "✨") || "✨",
    color: String(formData.get("color") ?? "violet"),
    frequency_type: frequencyType,
    frequency_config: parseFrequencyConfig(frequencyType, formData),
  });

  if (error) return { error: error.message };

  revalidatePath("/app");
  redirect("/app");
}

export async function updateHabit(
  habitId: string,
  _prevState: HabitFormState,
  formData: FormData,
): Promise<HabitFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Ponle un nombre al hábito." };

  const frequencyType = (formData.get("frequency_type") as FrequencyType) || "daily";

  const { error } = await supabase
    .from("habits")
    .update({
      name,
      emoji: String(formData.get("emoji") ?? "✨") || "✨",
      color: String(formData.get("color") ?? "violet"),
      frequency_type: frequencyType,
      frequency_config: parseFrequencyConfig(frequencyType, formData),
    })
    .eq("id", habitId)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/app");
  redirect("/app");
}

export async function archiveHabit(habitId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", habitId)
    .eq("user_id", user.id);

  revalidatePath("/app");
  redirect("/app");
}
