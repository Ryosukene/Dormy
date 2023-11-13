// Import supabase from your initialization file or relevant path
import { Database } from "@/lib/schema";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

// Define and export the function
export const getGroupIdsByUserId = async (
  userId: string
): Promise<string[]> => {
  const supabase = useSupabaseClient<Database>();
  const { data, error } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching group ids:", error);
    return [];
  }

  // Filter out any null values to ensure all elements are strings
  return data
    .map((entry) => entry.group_id)
    .filter((id): id is string => id !== null);
};
