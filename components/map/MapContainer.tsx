import { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import { router } from "expo-router";
import { Star, Clock, ChevronRight, X } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

import { useLocation } from "@/hooks/useLocation";
import { useFairsInRegion } from "@/hooks/useFairsInRegion";
import { FairMarker } from "@/components/map/FairMarker";
import { Colors } from "@/constants/Colors";
import type { Fair } from "@/types";

const AMSTERDAM_REGION = {
  latitude: 52.3676,
  longitude: 4.9041,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function MapContainer() {
  const { location, isLoading: locationLoading } = useLocation();
  const { fairs, isLoading: fairsLoading, error, onRegionChangeComplete } =
    useFairsInRegion();

  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);
  const mapRef = useRef<MapView>(null);

  const translateY = useSharedValue(300);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const handleMarkerPress = useCallback(
    (fair: Fair) => {
      setSelectedFair(fair);
      translateY.value = withTiming(0, { duration: 250 });
    },
    [translateY],
  );

  const handleDismissCard = useCallback(() => {
    translateY.value = withTiming(300, { duration: 200 });
    setTimeout(() => setSelectedFair(null), 200);
  }, [translateY]);

  const handleNavigateToFair = useCallback(() => {
    if (selectedFair) {
      router.push(`/fair/${selectedFair._id}`);
    }
  }, [selectedFair]);

  const handleMapPress = useCallback(() => {
    if (selectedFair) handleDismissCard();
  }, [selectedFair, handleDismissCard]);

  // MVP: always center on Amsterdam regardless of user location
  const initialRegion = AMSTERDAM_REGION;

  if (locationLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text className="mt-4 text-muted-foreground">
          Getting your location...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        onRegionChangeComplete={onRegionChangeComplete}
        onPress={handleMapPress}
      >
        {fairs.map((fair) => (
          <FairMarker
            key={fair._id}
            fair={fair}
            onPress={handleMarkerPress}
          />
        ))}
      </MapView>


      {error && (
        <View className="absolute left-4 right-4 top-14 rounded-lg bg-red-50 px-4 py-3">
          <Text className="text-center text-sm text-red-600">{error}</Text>
        </View>
      )}

      {selectedFair && (
        <Animated.View
          style={animatedStyle}
          className="absolute bottom-6 left-4 right-4"
        >
          <Pressable
            onPress={handleNavigateToFair}
            className="overflow-hidden rounded-2xl bg-surface shadow-lg"
          >
            <Pressable
              onPress={handleDismissCard}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/20 p-1"
            >
              <X size={16} color="#ffffff" />
            </Pressable>

            {selectedFair.mainPhoto && (
              <Image
                source={{ uri: selectedFair.mainPhoto }}
                className="h-32 w-full"
                resizeMode="cover"
              />
            )}

            <View className="p-4">
              <Text className="text-lg font-bold text-foreground">
                {selectedFair.name}
              </Text>

              <View className="mt-1 flex-row items-center">
                <Star
                  size={14}
                  color={Colors.accent[500]}
                  fill={Colors.accent[500]}
                />
                <Text className="ml-1 text-sm text-foreground">
                  {selectedFair.averageRating.toFixed(1)}
                </Text>
                <Text className="ml-1 text-sm text-muted-foreground">
                  ({selectedFair.reviewCount})
                </Text>
              </View>

              {selectedFair.category.length > 0 && (
                <View className="mt-2 flex-row flex-wrap gap-1">
                  {selectedFair.category.slice(0, 3).map((cat) => (
                    <View
                      key={cat}
                      className="rounded-full bg-primary-50 px-2 py-0.5"
                    >
                      <Text className="text-xs text-primary-700">{cat}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedFair.schedule.length > 0 && (
                <View className="mt-2 flex-row items-center">
                  <Clock size={14} color={Colors["muted-foreground"]} />
                  <Text className="ml-1 text-sm text-muted-foreground">
                    {selectedFair.schedule[0].dayOfWeek}{" "}
                    {selectedFair.schedule[0].openTime}–
                    {selectedFair.schedule[0].closeTime}
                  </Text>
                </View>
              )}

              <View className="mt-3 flex-row items-center justify-end">
                <Text className="text-sm font-medium text-primary-500">
                  View details
                </Text>
                <ChevronRight size={16} color={Colors.primary[500]} />
              </View>
            </View>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
