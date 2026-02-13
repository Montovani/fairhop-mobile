import { View, Text } from "react-native";

export default function MapScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-foreground">
        Explore Markets
      </Text>
      <Text className="mt-2 text-muted-foreground">
        Map will be displayed here
      </Text>
    </View>
  );
}
