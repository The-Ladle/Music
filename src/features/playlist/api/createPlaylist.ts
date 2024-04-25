import { useMutation, useQueryClient } from "@tanstack/react-query";

import { db } from "@/db";
import { playlists } from "@/db/schema";

import { SpecialPlaylists } from "@/features/playback/utils/trackList";
import { playlistKeys } from "./queryKeys";

async function createPlaylist(playlistName: string) {
  const sanitizedName = playlistName.trim();
  if (sanitizedName.length === 0 || sanitizedName.length > 30) {
    throw new Error("Playlist name must be between 1-30 character.");
  }

  const reservedNames = new Set<string>(Object.values(SpecialPlaylists));
  if (reservedNames.has(sanitizedName)) {
    throw new Error("That playlist name is reserved.");
  }

  await db
    .insert(playlists)
    .values({ name: sanitizedName })
    .onConflictDoNothing();
}

/** @description Creates a new playlist entry. */
export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistName: string) => createPlaylist(playlistName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
    },
  });
}
