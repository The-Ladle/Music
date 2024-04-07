import { View } from "react-native";

import TextStack from "@/components/ui/TextStack";
import MediaImage from "./MediaImage";

type Props = Omit<React.ComponentProps<typeof MediaImage>, "className"> & {
  title?: string;
  subTitle?: string;
  extra?: string;
};

/** @description Displays an Album, Artist, Playlist, or Song card. */
export default function MediaCard({ type, imgSize, imgSrc, ...text }: Props) {
  return (
    <View style={{ maxWidth: imgSize }} className="w-full">
      <MediaImage {...{ type, imgSize, imgSrc }} />
      <TextStack
        content={[
          text.title ?? "Nothing",
          text.subTitle ?? "Nothing",
          text.extra,
        ]}
        wrapperClassName="mt-0.5 px-1"
      />
    </View>
  );
}