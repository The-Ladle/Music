import { eq } from "drizzle-orm";

import type { Track } from "@/db/schema";
import { playlists, tracks } from "@/db/schema";
import { getPlaylist, getTracks } from "@/db/queries";
import { formatAsTrackIdList } from "@/db/utils/formatters";
import { sortTracks } from "@/db/utils/sorting";

import { SpecialPlaylists } from "./constants";
import type { TrackListSource } from "./types";

import { shuffleArray } from "@/utils/object";

/** @description See if 2 `TrackListSource` are the "same". */
export function areTrackReferencesEqual(
  source1: TrackListSource | undefined,
  source2: TrackListSource,
) {
  if (!source1) return false;
  const keys = Object.keys(source1) as Array<keyof TrackListSource>;
  return keys.every((key) => source1[key] === source2[key]);
}

/** @description Get the list of track ids in a given track list. */
export async function getTrackList({ type, id }: TrackListSource) {
  let sortedTracks: Track[] = [];

  if (type === "album") {
    const _tracks = await getTracks([eq(tracks.albumId, id)]);
    sortedTracks = sortTracks({ type: "album", tracks: _tracks });
  } else if (type === "artist") {
    const _tracks = await getTracks([eq(tracks.artistName, id)]);
    sortedTracks = sortTracks({ type: "artist", tracks: _tracks });
  } else {
    if (id === SpecialPlaylists.tracks) {
      const _tracks = await getTracks();
      sortedTracks = sortTracks({ type: "track", tracks: _tracks });
    } else if (id === SpecialPlaylists.favorites) {
      const _tracks = await getTracks([eq(tracks.isFavorite, true)]);
      sortedTracks = sortTracks({ type: "track", tracks: _tracks });
    } else {
      const _playlist = await getPlaylist([eq(playlists.name, id)]);
      sortedTracks = sortTracks({ type: "playlist", tracks: _playlist.tracks });
    }
  }

  return formatAsTrackIdList(sortedTracks);
}

/** @description Return information about a refreshed track list when change occurs. */
export async function refreshTrackListData({
  listSource,
  shuffle = false,
  startingTrack = undefined,
}: {
  listSource: TrackListSource;
  shuffle?: boolean;
  startingTrack?: string | undefined;
}) {
  let newTrackList = await getTrackList(listSource);
  if (newTrackList.length === 0) return { listIndex: 0, trackList: [] };
  if (shuffle) newTrackList = shuffleArray(newTrackList);

  let newListIndex = 0;
  if (startingTrack) {
    if (shuffle) {
      newTrackList = [
        startingTrack,
        ...newTrackList.filter((id) => id !== startingTrack),
      ];
    } else {
      newListIndex = newTrackList.findIndex((id) => id === startingTrack);
    }
  }

  return { listIndex: newListIndex, trackList: newTrackList };
}