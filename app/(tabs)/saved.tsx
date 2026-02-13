import { View, Text } from "react-native";

export default function SavedScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-foreground">
        Saved Markets
      </Text>
      <Text className="mt-2 text-muted-foreground">
        Your favorite markets will appear here
      </Text>
    </View>
  );
}
