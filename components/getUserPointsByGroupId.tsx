import { SupabaseClient } from "@supabase/supabase-js";

export const getUserPointsByGroupId = async (
  supabase: SupabaseClient,
  groupId: string
): Promise<{ userId: string; points: number }[]> => {
  const { data, error } = await supabase
    .from("group_members")
    .select(
      `
            user_id,
            users (
                points
            )
        `
    )
    .eq("group_id", groupId);

  if (error) {
    console.error("Error fetching user points by group id:", error);
    throw error; // エラーがあれば投げる
  }

  if (!data) {
    // データがnullの場合は空の配列を返す
    return [];
  }

  // 'data' is an array of objects with 'user_id' and nested 'users' object containing 'points'
  // We need to map it to an array of objects containing 'userId' and 'points'
  const pointsData = data.map((entry) => {
    const points =
      entry.users && entry.users.length > 0 ? entry.users[0].points : 0;

    return {
      userId: entry.user_id,
      points: points,
    };
  });

  return pointsData;
};
