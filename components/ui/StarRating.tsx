import { View } from "react-native";
import { Star } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

interface StarRatingProps {
  rating: number;
  size?: number;
}

export function StarRating({ rating, size = 16 }: StarRatingProps) {
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          color={Colors.accent[500]}
          fill={star <= Math.round(rating) ? Colors.accent[500] : "transparent"}
        />
      ))}
    </View>
  );
}
