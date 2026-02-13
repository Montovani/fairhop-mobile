import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  secureTextEntry,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);

  const isSecure = secureTextEntry && hidden;

  const borderColor = error
    ? "border-red-500"
    : focused
      ? "border-primary-500"
      : "border-border";

  return (
    <View className="w-full gap-1.5">
      {label && (
        <Text className="text-sm font-medium text-foreground">{label}</Text>
      )}

      <View
        className={`flex-row items-center rounded-xl border bg-surface px-4 ${borderColor}`}
      >
        <TextInput
          className="flex-1 py-3.5 text-base text-foreground"
          placeholderTextColor={Colors["muted-foreground"]}
          secureTextEntry={isSecure}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {secureTextEntry && (
          <Pressable onPress={() => setHidden((prev) => !prev)} hitSlop={8}>
            {hidden ? (
              <EyeOff size={20} color={Colors["muted-foreground"]} />
            ) : (
              <Eye size={20} color={Colors["muted-foreground"]} />
            )}
          </Pressable>
        )}
      </View>

      {error && <Text className="text-sm text-red-500">{error}</Text>}
    </View>
  );
}
