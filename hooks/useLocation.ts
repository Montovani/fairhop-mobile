import { useState, useEffect } from "react";
import * as Location from "expo-location";

const AMSTERDAM = { latitude: 52.3676, longitude: 4.9041 };

interface LocationState {
  location: { latitude: number; longitude: number } | null;
  isLoading: boolean;
  permissionStatus: Location.PermissionStatus | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    isLoading: true,
    permissionStatus: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function getLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (cancelled) return;

      if (status !== Location.PermissionStatus.GRANTED) {
        setState({
          location: null,
          isLoading: false,
          permissionStatus: status,
        });
        return;
      }

      try {
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (cancelled) return;

        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          isLoading: false,
          permissionStatus: status,
        });
      } catch {
        if (cancelled) return;
        setState({
          location: null,
          isLoading: false,
          permissionStatus: status,
        });
      }
    }

    getLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    ...state,
    defaultCenter: AMSTERDAM,
  };
}
