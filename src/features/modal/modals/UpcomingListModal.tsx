import Ionicons from "@expo/vector-icons/Ionicons";
import { BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { useAtomValue, useSetAtom } from "jotai";
import { Text } from "react-native";

import { trackListsDataAtom } from "@/features/playback/api/configs";
import { removeTrackAtQueueIdxAtom } from "@/features/playback/api/playing";

import Colors from "@/constants/Colors";
import { MediaImage } from "@/components/media/MediaImage";
import { ActionButton } from "@/components/ui/ActionButton";
import { TextLine } from "@/components/ui/Text";
import { ModalBase } from "../components/ModalBase";

/** @description Modal used for seeing upcoming tracks. */
export function UpcomingListModal() {
  const listData = useAtomValue(trackListsDataAtom);
  const removeTrackAtQueueIdx = useSetAtom(removeTrackAtQueueIdxAtom);

  return (
    <ModalBase>
      <BottomSheetSectionList
        sections={listData ?? []}
        keyExtractor={({ id }, index) => `${id}${index}`}
        renderItem={({ item, section: { title }, index }) => {
          const isQueue = title === "Next in Queue";
          return (
            <ActionButton
              onPress={isQueue ? () => removeTrackAtQueueIdx(index) : undefined}
              textContent={[item.name, item.artistName]}
              image={
                <MediaImage
                  type="track"
                  imgSize={48}
                  imgSrc={item.coverSrc}
                  className="shrink-0 rounded-sm"
                />
              }
              icon={
                isQueue ? (
                  <Ionicons
                    name="remove-circle-outline"
                    size={24}
                    color={Colors.accent50}
                  />
                ) : (
                  <></>
                )
              }
            />
          );
        }}
        renderSectionHeader={({ section: { title } }) => (
          <TextLine className="mb-2 font-ndot57 text-title text-foreground50">
            {title}
          </TextLine>
        )}
        renderSectionFooter={({ section }) => {
          if (section.data.length > 0) return null;
          return (
            <Text className="mb-2 font-geistMono text-base text-foreground100">
              No Tracks Found
            </Text>
          );
        }}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-4 pt-0"
      />
    </ModalBase>
  );
}
