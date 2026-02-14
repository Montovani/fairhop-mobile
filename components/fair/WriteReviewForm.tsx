import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator } from "react-native";
import { Star } from "lucide-react-native";
import { AxiosError } from "axios";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import { reviewService } from "@/services/review.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Review } from "@/types";

interface WriteReviewFormProps {
  fairId: string;
  onSubmitted: (review: Review) => void;
}

interface ApiError {
  message?: string;
}

export function WriteReviewForm({ fairId, onSubmitted }: WriteReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = rating > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setLoading(true);
    try {
      const review = await reviewService.create({
        fair: fairId,
        rate: rating,
        comment: comment.trim(),
      });
      // Populate owner with current user object so it displays name immediately
      const reviewWithOwner: Review = {
        ...review,
        owner: user ? { _id: user._id, name: user.name } : review.owner,
      };
      setSubmitted(true);
      onSubmitted(reviewWithOwner);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ?? "Failed to submit review."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-6 items-center gap-2">
        <Text className="text-base font-semibold text-primary-700">
          Thanks for your review!
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl border border-border bg-surface p-4 gap-4">
      <Text className="text-lg font-bold text-foreground">Write a Review</Text>

      {/* Star picker */}
      <View>
        <Text className="mb-2 text-sm font-medium text-foreground">Your rating</Text>
        <View className="flex-row gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable key={star} onPress={() => setRating(star)} hitSlop={4}>
              <Star
                size={32}
                color={Colors.accent[500]}
                fill={star <= rating ? Colors.accent[500] : "transparent"}
              />
            </Pressable>
          ))}
        </View>
        {rating === 0 && (
          <Text className="mt-1 text-xs text-muted-foreground">
            Tap a star to rate
          </Text>
        )}
      </View>

      {/* Comment input */}
      <View className="gap-1.5">
        <Text className="text-sm font-medium text-foreground">Comment (optional)</Text>
        <TextInput
          className="rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground"
          placeholder="Share your experience..."
          placeholderTextColor={Colors["muted-foreground"]}
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 96 }}
        />
      </View>

      {/* Error */}
      {error && (
        <View className="rounded-lg bg-red-50 px-4 py-3">
          <Text className="text-sm text-red-600">{error}</Text>
        </View>
      )}

      <Button onPress={handleSubmit} loading={loading} disabled={!canSubmit}>
        Submit Review
      </Button>
    </View>
  );
}
