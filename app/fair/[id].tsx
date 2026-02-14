import { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import {
  MapPin,
  Clock,
  Heart,
  AlertCircle,
} from "lucide-react-native";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { ReviewCard } from "@/components/fair/ReviewCard";
import { WriteReviewForm } from "@/components/fair/WriteReviewForm";
import { Colors } from "@/constants/Colors";
import { fairService } from "@/services/fair.service";
import { reviewService } from "@/services/review.service";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import type { Fair, Review } from "@/types";

export default function FairDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user, isAuthenticated } = useAuth();

  const [fair, setFair] = useState<Fair | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingToggle, setSavingToggle] = useState(false);

  // Fetch fair and reviews
  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const [fairData, reviewsData] = await Promise.all([
          fairService.getById(id),
          reviewService.getByFair(id),
        ]);
        setFair(fairData);
        setReviews(reviewsData);
        // Set dynamic header title
        navigation.setOptions({ title: fairData.name });
      } catch (err) {
        setError("Could not load this fair. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, navigation]);

  // Sync saved state from auth user
  useEffect(() => {
    if (user && fair) {
      setIsSaved(user.savedFairs.includes(fair._id));
    }
  }, [user, fair]);

  // Get current user's review if it exists
  const userReview = user ? reviews.find((r) => {
    const ownerId = typeof r.owner === "object" ? r.owner._id : r.owner;
    return ownerId === user._id;
  }) : null;

  const handleSaveToggle = async () => {
    if (!isAuthenticated || !fair || savingToggle) return;
    setSavingToggle(true);
    const willBeSaved = !isSaved;
    setIsSaved(willBeSaved); // optimistic
    try {
      if (willBeSaved) {
        await userService.saveFair(fair._id);
      } else {
        await userService.unsaveFair(fair._id);
      }
    } catch {
      setIsSaved(!willBeSaved); // revert on error
    } finally {
      setSavingToggle(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    try {
      await reviewService.remove(userReview._id);
      setReviews((prev) => prev.filter((r) => r._id !== userReview._id));
    } catch (err) {
      console.error("Failed to delete review:", err);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-background"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-12"
    >
      {/* Loading State */}
      {isLoading && (
        <View className="flex-1 items-center justify-center py-32">
          <ActivityIndicator size="large" color={Colors.primary[500]} />
          <Text className="mt-4 text-sm text-muted-foreground">
            Loading fair...
          </Text>
        </View>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <View className="mx-4 mt-16 rounded-2xl border border-red-200 bg-red-50 px-6 py-8 items-center gap-3">
          <AlertCircle size={36} color="#ef4444" />
          <Text className="text-center text-base font-semibold text-red-700">
            Something went wrong
          </Text>
          <Text className="text-center text-sm text-red-600">{error}</Text>
        </View>
      )}

      {/* Main Content */}
      {fair && !isLoading && (
        <>
          {/* Hero Image */}
          <View className="relative h-72 bg-muted">
            {fair.mainPhoto ? (
              <Image
                source={{ uri: fair.mainPhoto }}
                className="h-full w-full"
                resizeMode="cover"
              />
            ) : (
              <View className="h-full w-full items-center justify-center bg-muted">
                <MapPin size={48} color={Colors["muted-foreground"]} />
              </View>
            )}
            {/* Save/Heart button */}
            <Pressable
              onPress={handleSaveToggle}
              disabled={savingToggle || !isAuthenticated}
              className={`absolute right-4 top-12 rounded-full bg-black/30 p-2 ${
                (!isAuthenticated || savingToggle) ? "opacity-60" : ""
              }`}
              hitSlop={8}
            >
              <Heart
                size={24}
                color={isSaved ? Colors.accent[500] : "#ffffff"}
                fill={isSaved ? Colors.accent[500] : "transparent"}
              />
            </Pressable>
          </View>

          {/* Content */}
          <View className="px-4 pt-4 gap-6">
            {/* Name + Rating */}
            <View>
              <Text className="text-2xl font-bold text-foreground">
                {fair.name}
              </Text>
              <View className="mt-2 flex-row items-center gap-2">
                <StarRating rating={fair.averageRating} size={18} />
                <Text className="text-base font-semibold text-foreground">
                  {fair.averageRating.toFixed(1)}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  ({fair.reviewCount}{" "}
                  {fair.reviewCount === 1 ? "review" : "reviews"})
                </Text>
              </View>
            </View>

            {/* Categories */}
            {fair.category.length > 0 && (
              <View>
                <Text className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {fair.category.map((cat) => (
                    <Badge key={cat} label={cat} variant="primary" />
                  ))}
                </View>
              </View>
            )}

            {/* Products */}
            {fair.products.length > 0 && (
              <View>
                <Text className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Products
                </Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {fair.products.map((p) => (
                    <Badge key={p} label={p} variant="muted" />
                  ))}
                </View>
              </View>
            )}

            {/* Address */}
            {fair.address && (
              <View className="flex-row items-start gap-2">
                <MapPin
                  size={18}
                  color={Colors["muted-foreground"]}
                  className="mt-0.5"
                />
                <Text className="flex-1 text-base text-foreground">
                  {fair.address}
                </Text>
              </View>
            )}

            {/* Description */}
            {fair.description && (
              <View>
                <Text className="mb-1.5 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  About
                </Text>
                <Text className="text-base leading-6 text-foreground">
                  {fair.description}
                </Text>
              </View>
            )}

            {/* Schedule */}
            {fair.schedule.length > 0 && (
              <View>
                <Text className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Schedule
                </Text>
                <View className="rounded-2xl border border-border bg-surface overflow-hidden">
                  {fair.schedule.map((s, i) => (
                    <View
                      key={i}
                      className={`flex-row items-center justify-between px-4 py-3 ${
                        i < fair.schedule.length - 1
                          ? "border-b border-border"
                          : ""
                      }`}
                    >
                      <View className="flex-row items-center gap-2">
                        <Clock
                          size={16}
                          color={Colors.primary[500]}
                        />
                        <Text className="text-base font-medium text-foreground">
                          {s.dayOfWeek}
                          {s.frequency === "monthly" && s.weekOfMonth
                            ? ` (week ${s.weekOfMonth})`
                            : ""}
                        </Text>
                      </View>
                      <Text className="text-sm text-muted-foreground">
                        {s.openTime}–{s.closeTime}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Photo Gallery */}
            {fair.photos.length > 0 && (
              <View>
                <Text className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Photos
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="-mx-4"
                  contentContainerClassName="px-4 gap-2"
                >
                  {fair.photos.map((uri, i) => (
                    <Image
                      key={i}
                      source={{ uri }}
                      className="h-44 w-56 rounded-xl"
                      resizeMode="cover"
                    />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Reviews Section */}
            <View>
              <Text className="mb-3 text-lg font-bold text-foreground">
                Reviews ({reviews.length})
              </Text>

              {/* User's Own Review (with Edit/Delete) */}
              {isAuthenticated && userReview && (
                <View className="mb-4 rounded-2xl border-2 border-primary-200 bg-primary-50 p-4 gap-3">
                  <Text className="text-sm font-semibold text-primary-700">
                    Your Review
                  </Text>
                  <ReviewCard review={userReview} />
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleDeleteReview}
                      className="flex-1 rounded-lg border border-red-300 bg-red-50 py-2.5 items-center"
                    >
                      <Text className="text-sm font-medium text-red-600">Delete</Text>
                    </Pressable>
                  </View>
                </View>
              )}

              {/* Other Reviews */}
              {reviews.length === 0 ? (
                <View className="rounded-2xl border border-border bg-surface px-4 py-8 items-center">
                  <Text className="text-muted-foreground text-sm">
                    No reviews yet. Be the first!
                  </Text>
                </View>
              ) : (
                <View className="gap-3">
                  {reviews
                    .filter((r) => {
                      if (!isAuthenticated || !user) return true;
                      const ownerId = typeof r.owner === "object" ? r.owner._id : r.owner;
                      return ownerId !== user._id;
                    })
                    .map((review) => (
                      <ReviewCard key={review._id} review={review} />
                    ))}
                </View>
              )}
            </View>

            {/* Write Review Form - Only if user hasn't reviewed yet */}
            {isAuthenticated && !userReview && (
              <WriteReviewForm
                fairId={id}
                onSubmitted={(newReview) => {
                  setReviews((prev) => [newReview, ...prev]);
                }}
              />
            )}

            {/* Message if user already reviewed */}
            {isAuthenticated && userReview && (
              <View className="rounded-2xl border border-primary-200 bg-primary-50 px-4 py-4">
                <Text className="text-sm text-primary-700 text-center">
                  You can only have one review per fair. Delete your review to post a new one.
                </Text>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
