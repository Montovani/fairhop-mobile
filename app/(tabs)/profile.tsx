import { View, Text } from "react-native";

export default function ProfileScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-lg font-semibold text-foreground">Profile</Text>
      <Text className="mt-2 text-muted-foreground">
        Your profile details will appear here
      </Text>
    </View>
  );
}
