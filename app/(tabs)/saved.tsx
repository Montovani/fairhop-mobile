import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Heart, MapPin, AlertCircle } from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { Colors } from "@/constants/Colors";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Fair } from "@/types";

export default function SavedScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [fairs, setFairs] = useState<Fair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedFairs();
  }, []);

  const loadSavedFairs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userService.getSavedFairs();
      setFairs(data);
    } catch (err) {
      setError("Could not load saved fairs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFair = async (fairId: string) => {
    setRemovingId(fairId);
    try {
      await userService.unsaveFair(fairId);
      setFairs((prev) => prev.filter((f) => f._id !== fairId));
    } catch (err) {
      console.error("Failed to remove fair:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-6"
    >
      {/* Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Saved Fairs</Text>
      </View>

      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center py-16">
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text className="mt-4 text-sm text-muted-foreground">
            Loading saved fairs...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View className="mx-4 mt-8 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 items-center gap-3">
          <AlertCircle size={36} color="#ef4444" />
          <Text className="text-center text-base font-semibold text-red-700">
            Something went wrong
          </Text>
          <Text className="text-center text-sm text-red-600">{error}</Text>
        </View>
      )}

      {/* Empty State */}
      {fairs.length === 0 && !isLoading && !error && (
        <View className="mx-4 mt-16 rounded-2xl border border-border bg-surface px-4 py-12 items-center">
          <Heart size={48} color={Colors["muted-foreground"]} />
          <Text className="mt-4 text-center text-base font-semibold text-foreground">
            No saved fairs yet
          </Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Tap the heart icon on a fair to save it here
          </Text>
        </View>
      )}

      {/* List of Saved Fairs */}
      {fairs.length > 0 && !isLoading && (
        <View className="px-4 pt-4 gap-3">
          {fairs.map((fair) => (
            <Pressable
              key={fair._id}
              onPress={() => router.push(`/fair/${fair._id}`)}
              className="rounded-2xl border border-border bg-surface overflow-hidden active:opacity-70"
            >
              <View className="flex-row">
                {/* Image */}
                <View className="h-36 w-32 bg-muted">
                  {fair.mainPhoto ? (
                    <Image
                      source={{ uri: fair.mainPhoto }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="h-full w-full items-center justify-center bg-muted">
                      <MapPin size={28} color={Colors["muted-foreground"]} />
                    </View>
                  )}
                </View>

                {/* Content */}
                <View className="flex-1 p-3 justify-between">
                  {/* Name & Rating */}
                  <View>
                    <Text className="text-base font-bold text-foreground pr-2">
                      {fair.name}
                    </Text>
                    <View className="mt-1.5 flex-row items-center gap-1.5">
                      <StarRating rating={fair.averageRating} size={14} />
                      <Text className="text-sm font-semibold text-foreground">
                        {fair.averageRating.toFixed(1)}
                      </Text>
                      <Text className="text-xs text-muted-foreground">
                        ({fair.reviewCount})
                      </Text>
                    </View>
                  </View>

                  {/* Categories */}
                  {fair.category.length > 0 && (
                    <View className="mt-2 flex-row flex-wrap gap-1">
                      {fair.category.slice(0, 2).map((cat) => (
                        <Badge key={cat} label={cat} variant="primary" />
                      ))}
                    </View>
                  )}

                  {/* Remove Button */}
                  <Pressable
                    onPress={() => handleRemoveFair(fair._id)}
                    disabled={removingId === fair._id}
                    className="mt-2 flex-row items-center justify-center gap-1 rounded-lg bg-red-50 py-1.5 px-2"
                  >
                    {removingId === fair._id ? (
                      <ActivityIndicator size="small" color={Colors["muted-foreground"]} />
                    ) : (
                      <>
                        <Heart size={14} color="#ef4444" fill="#ef4444" />
                        <Text className="text-xs font-medium text-red-600">Remove</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
