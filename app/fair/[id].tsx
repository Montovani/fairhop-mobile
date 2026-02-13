import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function FairDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-foreground">
        Fair Detail
      </Text>
      <Text className="mt-2 text-muted-foreground">Fair ID: {id}</Text>
    </View>
  );
}
