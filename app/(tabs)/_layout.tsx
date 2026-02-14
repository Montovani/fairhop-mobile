import { Tabs } from "expo-router";
import { Map, Heart, UserCircle } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary[500],
        tabBarInactiveTintColor: Colors["muted-foreground"],
        tabBarStyle: {
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          borderTopColor: "rgba(228, 228, 231, 0.5)",
          borderTopWidth: 1,
          elevation: 0,
          shadowColor: "rgba(0, 0, 0, 0.08)",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 1,
          shadowRadius: 16,
          paddingBottom: 4,
        },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.foreground,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Explore",
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <UserCircle color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="fair/[id]"
        options={{
          title: "",
          headerShown: true,
          tabBarStyle: { display: "none" },
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
