export type FrequencyType = "daily" | "weekly_n_times" | "specific_days";

export type Habit = {
  id: string;
  user_id: string;
  name: string;
  emoji: string | null;
  color: string | null;
  frequency_type: FrequencyType;
  frequency_config: Record<string, unknown>;
  reminder_time: string | null;
  reminder_enabled: boolean;
  archived_at: string | null;
  sort_order: number;
  current_streak: number;
  longest_streak: number;
  last_checkin_date: string | null;
  freezes_available: number;
  freezes_used_this_period: number;
  created_at: string;
};
