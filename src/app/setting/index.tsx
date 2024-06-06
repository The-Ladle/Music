import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import Markdown from "react-native-markdown-display";

import { useLatestRelease } from "@/features/setting/api/release";

import { APP_VERSION, GITHUB_LINK } from "@/constants/Config";
import { BorderRadius, Colors, FontSize } from "@/constants/Styles";
import { LinkButton } from "@/components/form/Button";
import { AnimatedHeader } from "@/components/navigation/AnimatedHeader";
import {
  Description,
  Section,
  SubMenuLink,
  Title,
} from "@/features/setting/components/UI";

/** @description Screen for `/setting` route. */
export default function SettingScreen() {
  return (
    <AnimatedHeader title="SETTINGS">
      <Section>
        <Title className="mb-2">UPDATES</Title>
        <UpdateChecker />
      </Section>

      <SubMenuLink href="storage" label="STORAGE & STATISTICS" />
      <SubMenuLink href="support" label="SUPPORT & SOURCE" />

      <Section className="flex-row items-center justify-between gap-2">
        <Title>VERSION</Title>
        <Description>{APP_VERSION}</Description>
      </Section>
    </AnimatedHeader>
  );
}

/** @description Indicates whether we're on the latest version of the app. */
function UpdateChecker() {
  const { isPending, error, data } = useLatestRelease();

  if (isPending) return null;

  // We prefer newest stable version over release candidate (ie: `v1.0.0` over `v1.0.0-rc.1`)
  //  - `data.version` should never be a release candidate value.
  if (
    !!error ||
    !data.version ||
    data.version.includes("-rc.") ||
    data.version < APP_VERSION.split("-rc.")[0]
  ) {
    return <Description>Currently on latest version.</Description>;
  }

  return (
    <>
      <Markdown
        style={{
          body: {
            padding: 8,
            backgroundColor: Colors.surface800,
            color: Colors.foreground100,
            fontFamily: "GeistMonoLight",
            fontSize: FontSize.xs,
            borderRadius: BorderRadius.lg,
          },
          heading1: {
            ...markdownStyles.heading,
            marginBottom: 16,
            fontSize: FontSize.lg,
          },
          heading2: {
            ...markdownStyles.heading,
            fontSize: FontSize.lg,
            textDecorationLine: "underline",
          },
          heading3: {
            ...markdownStyles.heading,
            fontSize: FontSize.base,
          },
          heading4: {
            ...markdownStyles.heading,
            fontSize: FontSize.xs,
          },
          heading5: {
            ...markdownStyles.heading,
            fontSize: FontSize.xs,
          },
          heading6: {
            ...markdownStyles.heading,
            fontSize: 10,
          },
          bullet_list: markdownStyles.list,
          ordered_list: markdownStyles.list,
          blockquote: {
            ...markdownStyles.fence,
            marginHorizontal: 0,
            borderColor: Colors.accent500,
          },
          fence: {
            ...markdownStyles.fence,
            borderColor: Colors.surface500,
          },
          code_inline: markdownStyles.code,
          hr: {
            backgroundColor: Colors.surface700,
          },
        }}
        rules={{
          link: (node, children, _parent, styles) => (
            <Text key={node.key} style={styles.link}>
              {children}
            </Text>
          ),
        }}
      >
        {`# ${data.version} is Available\n\n${data.releaseNotes}`}
      </Markdown>
      <View className="mt-4 flex-row gap-2">
        <LinkButton
          as="external"
          href={`${GITHUB_LINK}/releases/latest`}
          theme="neutral-alt"
          Icon={
            <Ionicons
              name="logo-github"
              size={20}
              color={Colors.foreground50}
            />
          }
          content="APK"
        />
      </View>
    </>
  );
}

const markdownStyles = StyleSheet.create({
  heading: {
    marginBottom: 8,
    color: Colors.foreground50,
    fontFamily: "GeistMono",
  },
  list: {
    marginVertical: 8,
  },
  code: {
    backgroundColor: Colors.surface700,
  },
  fence: {
    marginVertical: 8,
    backgroundColor: Colors.surface700,
    borderRadius: BorderRadius.sm,
  },
});