import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "primary" | "muted";
}

export function Badge({ label, variant = "muted" }: BadgeProps) {
  const container =
    variant === "primary"
      ? "bg-primary-50 border border-primary-100"
      : "bg-muted border border-border";
  const text =
    variant === "primary"
      ? "text-primary-700"
      : "text-muted-foreground";

  return (
    <View className={`rounded-full px-2.5 py-0.5 ${container}`}>
      <Text className={`text-xs font-medium ${text}`}>{label}</Text>
    </View>
  );
}
