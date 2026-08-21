import { supabase } from "./supabase";

export async function getGames() {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Error fetching games:",
      error
    );

    throw error;
  }

  return data;
}