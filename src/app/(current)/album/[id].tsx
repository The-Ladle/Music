import Ionicons from "@expo/vector-icons/Ionicons";
import { Link, useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { Pressable, Text, View } from "react-native";

import { useAlbum } from "@/features/album/api/getAlbum";
import { useToggleFavorite } from "@/features/album/api/toggleFavorite";

import Colors from "@/constants/Colors";
import { MediaList, MediaListHeader } from "@/components/media/MediaList";
import { ActionButton } from "@/components/ui/ActionButton";
import { TrackDuration } from "@/features/track/components/TrackDuration";

/** @description Screen for `/album/[id]` route. */
export default function CurrentAlbumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const { isPending, error, data } = useAlbum(id);
  const toggleMutation = useToggleFavorite(id);

  useEffect(() => {
    if (data?.isFavorite === undefined) return;
    // Add optimistic UI updates.
    const isToggled = toggleMutation.isPending
      ? !data.isFavorite
      : data.isFavorite;

    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => toggleMutation.mutate(data.isFavorite)}>
          <Ionicons
            name={isToggled ? "heart" : "heart-outline"}
            size={24}
            color={Colors.foreground50}
          />
        </Pressable>
      ),
    });
  }, [navigation, data?.isFavorite, toggleMutation]);

  if (isPending) return <View className="w-full flex-1 px-4" />;
  else if (!!error || !data) {
    return (
      <View className="w-full flex-1 px-4">
        <Text className="mx-auto text-center font-geistMono text-base text-accent50">
          Error: Album not found
        </Text>
      </View>
    );
  }

  return (
    <View className="w-full flex-1 px-4">
      <MediaListHeader
        imgSrc={data.coverSrc}
        title={data.name}
        subtitleComponent={
          <Link
            href={`/artist/${encodeURIComponent(data.artistName)}`}
            numberOfLines={1}
            className="font-geistMonoLight text-xs text-accent50"
          >
            {data.artistName}
          </Link>
        }
        metadata={data.metadata}
      />
      <MediaList
        data={data.tracks}
        renderItem={({ item: { name, track, duration } }) => (
          <ActionButton
            onPress={() => console.log(`Now playing: ${name}`)}
            textContent={[
              name,
              track > 0 ? `Track ${`${track}`.padStart(2, "0")}` : "Track",
            ]}
            asideContent={<TrackDuration duration={duration} />}
            iconOnPress={() => console.log("View Track Options")}
          />
        )}
      />
    </View>
  );
}
