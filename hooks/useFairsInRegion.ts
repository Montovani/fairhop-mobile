import { useState, useCallback, useRef, useMemo } from "react";
import type { Region } from "react-native-maps";
import { fairService } from "@/services/fair.service";
import type { Fair } from "@/types";

const MIN_MOVE_THRESHOLD = 0.005; // ~500m — skip fetch if map barely moved

export interface MapFilters {
  minRating: number | null;
  openToday: boolean;
  categories: string[];
  products: string[];
  nearMe: boolean;
  matchMode: "any" | "all";
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function useFairsInRegion(filters?: MapFilters) {
  const [fairsMap, setFairsMap] = useState<Map<string, Fair>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();
  const lastRegion = useRef<Region | null>(null);

  const onRegionChangeComplete = useCallback((region: Region) => {
    // Skip if the map barely moved
    if (lastRegion.current) {
      const latDiff = Math.abs(region.latitude - lastRegion.current.latitude);
      const lngDiff = Math.abs(region.longitude - lastRegion.current.longitude);
      const zoomDiff = Math.abs(
        region.latitudeDelta - lastRegion.current.latitudeDelta,
      );

      if (
        latDiff < MIN_MOVE_THRESHOLD &&
        lngDiff < MIN_MOVE_THRESHOLD &&
        zoomDiff < MIN_MOVE_THRESHOLD
      ) {
        return;
      }
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      lastRegion.current = region;
      setIsLoading(true);
      setError(null);

      const maxDistance = Math.round((region.latitudeDelta * 111320) / 2);

      try {
        const data = await fairService.getAll({
          lng: region.longitude,
          lat: region.latitude,
          maxDistance,
        });
        setFairsMap((prev) => {
          const next = new Map(prev);
          data.forEach((fair) => next.set(fair._id, fair));
          return next;
        });
      } catch {
        setError("Could not load fairs");
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  // Apply filters to fairs
  const filteredFairs = useMemo(() => {
    let result = Array.from(fairsMap.values());

    if (!filters) return result;

    // Filter by minimum rating
    if (filters.minRating !== null) {
      result = result.filter((fair) => fair.averageRating >= filters.minRating);
    }

    // Filter by open today
    if (filters.openToday) {
      const todayIndex = new Date().getDay();
      const todayName = DAY_NAMES[todayIndex];
      result = result.filter((fair) =>
        fair.schedule.some((s) => s.dayOfWeek === todayName),
      );
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      if (filters.matchMode === "all") {
        // ALL: fair must have all selected categories
        result = result.filter((fair) =>
          filters.categories.every((cat) => fair.category.includes(cat)),
        );
      } else {
        // ANY: fair must have at least one selected category
        result = result.filter((fair) =>
          filters.categories.some((cat) => fair.category.includes(cat)),
        );
      }
    }

    // Filter by products
    if (filters.products.length > 0) {
      if (filters.matchMode === "all") {
        // ALL: fair must have all selected products
        result = result.filter((fair) =>
          filters.products.every((prod) => fair.products.includes(prod)),
        );
      } else {
        // ANY: fair must have at least one selected product
        result = result.filter((fair) =>
          filters.products.some((prod) => fair.products.includes(prod)),
        );
      }
    }

    // Near me would require location data - for now it's just a placeholder
    // In a full implementation, this would filter by distance from user location

    return result;
  }, [fairsMap, filters]);

  return {
    fairs: filteredFairs,
    allFairs: Array.from(fairsMap.values()),
    isLoading,
    error,
    onRegionChangeComplete,
  };
}
