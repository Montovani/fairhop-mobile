import { View, Pressable, Text } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Map, Heart, UserCircle } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface NavItem {
  name: string;
  route: string;
  icon: (color: string, size: number) => React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Explore",
    route: "/map",
    icon: (color, size) => <Map color={color} size={size} />,
  },
  {
    name: "Saved",
    route: "/saved",
    icon: (color, size) => <Heart color={color} size={size} />,
  },
  {
    name: "Profile",
    route: "/profile",
    icon: (color, size) => <UserCircle color={color} size={size} />,
  },
];

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine active route - handle both tab routes and fair detail route
  const isActiveRoute = (route: string) => {
    if (pathname.startsWith("/fair/")) {
      // When on fair detail, highlight the explore tab
      return route === "/map";
    }
    return pathname === route || pathname.startsWith(route);
  };

  return (
    <View
      className="border-t border-border px-4 py-3 flex-row justify-around items-center"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderTopColor: "rgba(228, 228, 231, 0.5)",
        shadowColor: "rgba(0, 0, 0, 0.08)",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 1,
        shadowRadius: 16,
        elevation: 0,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = isActiveRoute(item.route);
        const iconColor = isActive
          ? Colors.primary[500]
          : Colors["muted-foreground"];

        return (
          <Pressable
            key={item.route}
            onPress={() => router.push(item.route)}
            className="flex-1 items-center py-2"
            hitSlop={8}
          >
            {item.icon(iconColor, 24)}
            <Text
              className={`text-xs mt-1 ${
                isActive
                  ? "font-semibold text-primary-500"
                  : "text-muted-foreground"
              }`}
            >
              {item.name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
