import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { Link } from "expo-router";
import { AxiosError } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { ApiError } from "@/types";

export default function SignupScreen() {
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 8;

  const handleSignup = async () => {
    if (!canSubmit) return;

    setError("");
    setLoading(true);

    try {
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerClassName="flex-1 justify-center px-6 py-12"
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View className="mb-10 items-center">
          <Text className="text-4xl font-bold text-primary-500">FairHop</Text>
          <Text className="mt-2 text-base text-muted-foreground">
            Create your account
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <Input
            label="Name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="next"
          />

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />

          <View className="gap-1.5">
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
            <Text className="text-xs text-muted-foreground">
              Min. 8 characters with uppercase, lowercase, number & special
              character
            </Text>
          </View>

          {error !== "" && (
            <View className="rounded-lg bg-red-50 px-4 py-3">
              <Text className="text-sm text-red-600">{error}</Text>
            </View>
          )}

          <Button
            onPress={handleSignup}
            loading={loading}
            disabled={!canSubmit}
          >
            Create account
          </Button>
        </View>

        {/* Footer link */}
        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm text-muted-foreground">
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-sm font-semibold text-primary-500">
                Log in
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
