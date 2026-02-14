import { View, Text } from "react-native";
import { UserCircle } from "lucide-react-native";
import { StarRating } from "@/components/ui/StarRating";
import { Colors } from "@/constants/Colors";
import type { Review } from "@/types";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const ownerName =
    typeof review.owner === "object" ? review.owner.name : "Anonymous";

  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <View className="rounded-2xl border border-border bg-surface p-4 gap-2">
      {/* Header: avatar placeholder + name + date */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <UserCircle size={28} color={Colors["muted-foreground"]} />
          <Text className="text-sm font-semibold text-foreground">{ownerName}</Text>
        </View>
        <Text className="text-xs text-muted-foreground">{formattedDate}</Text>
      </View>
      {/* Stars */}
      <StarRating rating={review.rate} size={14} />
      {/* Comment */}
      {review.comment.trim().length > 0 && (
        <Text className="text-sm leading-5 text-foreground">{review.comment}</Text>
      )}
    </View>
  );
}
