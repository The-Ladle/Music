import { useAtomValue } from "jotai";

import { currentTrackDataAtom } from "@/features/playback/api/playing";
import { modalConfigAtom } from "./store";

import { TrackModal } from "./modals/TrackModal";
import { UpcomingListModal } from "./modals/UpcomingListModal";

/** @description Wraps all the Bottom Sheet modals used. */
export function AppModals() {
  const currModal = useAtomValue(modalConfigAtom);
  const trackData = useAtomValue(currentTrackDataAtom);

  if (!currModal) return null;

  switch (currModal.type) {
    case "current-track":
      if (!trackData) return null;
      return <TrackModal trackId={trackData.id} origin="current-track" />;
    case "track":
      return <TrackModal trackId={currModal.ref} origin={currModal.origin} />;
    case "upcoming-list":
      return <UpcomingListModal />;
    default:
      throw new Error("Modal type not implemented yet.");
  }
}
