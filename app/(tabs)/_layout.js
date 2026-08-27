import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { VideoPlayerProvider } from "@/components/video-player-context";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 10 : Math.max(insets.bottom, 8);

  return (
    <VideoPlayerProvider>
      <Tabs screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#FF7A30",
        tabBarInactiveTintColor: "#6D7B8F",
        tabBarStyle: {
          backgroundColor: "rgba(255,255,255,0.94)",
          borderTopColor: "#DCE5F1",
          borderTopWidth: 1,
          height: 58 + bottomPadding,
          paddingBottom: bottomPadding,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
      }}>
        <Tabs.Screen name="index" options={{ title: "Watch", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="play-circle-filled" size={24} /> }} />
        <Tabs.Screen name="library" options={{ title: "Library", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="video-library" size={24} /> }} />
        <Tabs.Screen name="favorites" options={{ title: "Favorites", tabBarIcon: ({ color }) => <MaterialIcons color={color} name="favorite" size={23} /> }} />
      </Tabs>
    </VideoPlayerProvider>
  );
}
