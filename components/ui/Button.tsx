import { Pressable, Text, ActivityIndicator } from "react-native";

interface ButtonProps {
  children: string;
  onPress?: () => void;
  variant?: "primary" | "outline";
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  children,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const base = "w-full flex-row items-center justify-center rounded-xl py-4";
  const primary = "bg-primary-500 active:bg-primary-600";
  const outline = "border border-primary-500 bg-transparent active:bg-primary-50";
  const disabledStyle = "opacity-50";

  const containerClass = `${base} ${variant === "primary" ? primary : outline} ${isDisabled ? disabledStyle : ""}`;

  const textPrimary = "text-base font-semibold text-white";
  const textOutline = "text-base font-semibold text-primary-500";
  const textClass = variant === "primary" ? textPrimary : textOutline;

  return (
    <Pressable
      className={containerClass}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" ? "#ffffff" : "#22c55e"}
          size="small"
        />
      ) : (
        <Text className={textClass}>{children}</Text>
      )}
    </Pressable>
  );
}
