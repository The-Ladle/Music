import Ionicons from "@expo/vector-icons/Ionicons";
import { ThemeProvider } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Link, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable } from "react-native";

import { Polyfill } from "@/components/Polyfill";
import { useLoadAssets } from "@/hooks/useLoadAssets";

import "@/assets/global.css";
import Colors from "@/constants/Colors";
import NavigationTheme from "@/constants/Theme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/settings` keeps a back button present.
  initialRouteName: "(home)",
};

// Create TanStack Query client
const queryClient = new QueryClient();

export default function RootLayout() {
  const { isLoaded } = useLoadAssets();
  if (!isLoaded) return null;
  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <QueryClientProvider client={queryClient}>
      <Polyfill />
      <ThemeProvider value={NavigationTheme}>
        <StatusBar style="light" />
        <Stack>
          <Stack.Screen
            name="(home)"
            options={{
              title: "MUSIC",
              headerTitleStyle: { fontFamily: "Ndot57", fontSize: 32 },
              headerRight: () => (
                <Link href="/setting" asChild>
                  <Pressable>
                    {({ pressed }) => (
                      <Ionicons
                        name="settings-outline"
                        size={24}
                        color={Colors.foreground50}
                        style={{ opacity: pressed ? 0.5 : 1 }}
                      />
                    )}
                  </Pressable>
                </Link>
              ),
            }}
          />
          <Stack.Screen name="(current)" options={{ headerShown: false }} />
          <Stack.Screen
            name="current-track"
            options={{ animation: "slide_from_bottom" }}
          />
          <Stack.Screen name="setting" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
