import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { and, eq } from "drizzle-orm";
import { useCallback } from "react";

import { db } from "@/db";
import { playlists, tracksToPlaylists } from "@/db/schema";
import { getPlaylist, getTracksToPlaylists } from "@/db/queries";
import { favoriteKeys } from "@/api/favorites/_queryKeys";
import { playlistKeys } from "@/api/playlists/_queryKeys";
import { trackKeys } from "../_queryKeys";

import type { ExtractFnReturnType, Prettify } from "@/utils/types";

type BaseFnArgs = { trackId: string };

// ---------------------------------------------------------------------
//                            GET Methods
// ---------------------------------------------------------------------
type GETFnData = ExtractFnReturnType<typeof getTracksToPlaylists>;

type UseTrackInPlaylistsOptions<TData = GETFnData> = Prettify<
  BaseFnArgs & {
    config?: {
      select?: (data: GETFnData) => TData;
    };
  }
>;

/** @description Returns all playlists this track is a part of. */
export const useTrackInPlaylists = <TData = GETFnData>({
  trackId,
  config,
}: UseTrackInPlaylistsOptions<TData>) =>
  useQuery({
    queryKey: trackKeys.detailWithRelation(trackId),
    queryFn: () =>
      getTracksToPlaylists([eq(tracksToPlaylists.trackId, trackId)]),
    gcTime: 0,
    ...config,
  });

/** @description Returns if the track is in a given playlist. */
export const useIsTrackInPlaylist = (trackId: string, playlistName: string) =>
  useTrackInPlaylists({
    trackId,
    config: {
      select: useCallback(
        (data: GETFnData) => {
          const playlistNameSet = new Set(data.map(({ name }) => name));
          return playlistNameSet.has(playlistName);
        },
        [playlistName],
      ),
    },
  });

// ---------------------------------------------------------------------
//                            PUT Methods
// ---------------------------------------------------------------------
type PUTFnArgs = Prettify<BaseFnArgs & { playlistNames: string[] }>;

export async function putTrackInPlaylists({
  trackId,
  playlistNames,
}: PUTFnArgs) {
  await db
    .delete(tracksToPlaylists)
    .where(eq(tracksToPlaylists.trackId, trackId));

  const newEntries = playlistNames.map((name) => {
    return { playlistName: name, trackId };
  });
  if (newEntries.length > 0) {
    await db.insert(tracksToPlaylists).values(newEntries);
  }
}

/** @description Put track in the specified playlists. */
export function usePutTrackInPlaylists(trackId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (playlistNames: string[]) =>
      putTrackInPlaylists({ trackId, playlistNames }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: trackKeys.detailWithRelation(trackId),
      });
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------
//                            DELETE Methods
// ---------------------------------------------------------------------
type DELETEFnArgs = Prettify<BaseFnArgs & { playlistName: string }>;

export async function deleteTrackFromPlaylist({
  trackId,
  playlistName,
}: DELETEFnArgs) {
  const removedRelation = await getPlaylist([eq(playlists.name, playlistName)]);
  await db
    .delete(tracksToPlaylists)
    .where(
      and(
        eq(tracksToPlaylists.trackId, trackId),
        eq(tracksToPlaylists.playlistName, playlistName),
      ),
    );

  return removedRelation.isFavorite;
}

/** @description Delete track from specified playlist. */
export function useDeleteTrackFromPlaylist(
  trackId: string,
  playlistName: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteTrackFromPlaylist({ trackId, playlistName }),
    onSuccess: (wasFavorited: boolean) => {
      queryClient.invalidateQueries({
        queryKey: trackKeys.detailWithRelation(trackId),
      });
      queryClient.invalidateQueries({ queryKey: playlistKeys.all });
      // Refresh favorites list if playlist was favorited.
      if (wasFavorited) {
        queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
      }
    },
  });
}