import { useState, useCallback, useRef } from "react";
import type { Region } from "react-native-maps";
import { fairService } from "@/services/fair.service";
import type { Fair } from "@/types";

const MIN_MOVE_THRESHOLD = 0.005; // ~500m — skip fetch if map barely moved

export function useFairsInRegion() {
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

  const fairs = Array.from(fairsMap.values());

  return { fairs, isLoading, error, onRegionChangeComplete };
}
