import { useEffect, useRef, useState, useCallback } from "react";
import { View, Text, Pressable, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/Colors";
import { fairService } from "@/services/fair.service";
import type { Fair } from "@/types";

const AMSTERDAM = { lat: 52.3676, lng: 4.9041 };
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "";

function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
}

export function MapContainer() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [fairs, setFairs] = useState<Fair[]>([]);
  const [selectedFair, setSelectedFair] = useState<Fair | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const lastCenter = useRef<{ lat: number; lng: number } | null>(null);

  const fetchFairs = useCallback(async (map: google.maps.Map) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const center = map.getCenter();
    if (!center) return;

    // Skip if map barely moved (~500m threshold)
    if (lastCenter.current) {
      const latDiff = Math.abs(center.lat() - lastCenter.current.lat);
      const lngDiff = Math.abs(center.lng() - lastCenter.current.lng);
      if (latDiff < 0.005 && lngDiff < 0.005) return;
    }

    debounceRef.current = setTimeout(async () => {
      const bounds = map.getBounds();
      const c = map.getCenter();
      if (!bounds || !c) return;

      lastCenter.current = { lat: c.lat(), lng: c.lng() };

      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const latSpan = ne.lat() - sw.lat();
      const maxDistance = Math.round((latSpan * 111320) / 2);

      try {
        const data = await fairService.getAll({
          lng: c.lng(),
          lat: c.lat(),
          maxDistance,
        });
        setFairs(data);
        setError(null);
      } catch {
        setError("Could not load fairs");
      }
    }, 500);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        await loadGoogleMapsScript();
        if (cancelled || !mapContainerRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: AMSTERDAM,
          zoom: 13,
          mapId: "fairhop-web-map",
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        mapRef.current = map;

        map.addListener("idle", () => fetchFairs(map));

        setIsLoading(false);
      } catch {
        if (!cancelled) {
          setError("Failed to load Google Maps");
          setIsLoading(false);
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
    };
  }, [fetchFairs]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => (m.map = null));
    markersRef.current = [];

    fairs.forEach((fair) => {
      const [lng, lat] = fair.location.coordinates;

      const pinElement = document.createElement("div");
      pinElement.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
        ">
          <div style="
            background: #22c55e;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #22c55e;
            margin-top: -1px;
          "></div>
        </div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content: pinElement,
        title: fair.name,
      });

      marker.addListener("click", () => setSelectedFair(fair));
      markersRef.current.push(marker);
    });
  }, [fairs]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={{ marginTop: 16, color: Colors["muted-foreground"] }}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <div ref={mapContainerRef} style={{ flex: 1, width: "100%", height: "100%" }} />

      {error && (
        <View style={{
          position: "absolute", top: 56, left: 16, right: 16,
          backgroundColor: "#fef2f2", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12,
        }}>
          <Text style={{ textAlign: "center", fontSize: 14, color: "#dc2626" }}>{error}</Text>
        </View>
      )}

      {selectedFair && (
        <View style={{
          position: "absolute", bottom: 24, left: 16, right: 16,
        }}>
          <Pressable
            onPress={() => router.push(`/fair/${selectedFair._id}`)}
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 16,
              overflow: "hidden",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            <Pressable
              onPress={() => setSelectedFair(null)}
              style={{
                position: "absolute", right: 12, top: 12, zIndex: 10,
                backgroundColor: "rgba(0,0,0,0.2)", borderRadius: 12, padding: 4,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "bold" }}>✕</Text>
            </Pressable>

            {selectedFair.mainPhoto && (
              <Image
                source={{ uri: selectedFair.mainPhoto }}
                style={{ width: "100%", height: 128 }}
                resizeMode="cover"
              />
            )}

            <View style={{ padding: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", color: Colors.foreground }}>
                {selectedFair.name}
              </Text>

              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                <Text style={{ color: Colors.accent[500], fontSize: 14 }}>★</Text>
                <Text style={{ marginLeft: 4, fontSize: 14, color: Colors.foreground }}>
                  {selectedFair.averageRating.toFixed(1)}
                </Text>
                <Text style={{ marginLeft: 4, fontSize: 14, color: Colors["muted-foreground"] }}>
                  ({selectedFair.reviewCount})
                </Text>
              </View>

              {selectedFair.category.length > 0 && (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {selectedFair.category.slice(0, 3).map((cat) => (
                    <View
                      key={cat}
                      style={{
                        backgroundColor: Colors.primary[50],
                        borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: Colors.primary[700] }}>{cat}</Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedFair.schedule.length > 0 && (
                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 8 }}>
                  <Text style={{ fontSize: 14, color: Colors["muted-foreground"] }}>
                    🕐 {selectedFair.schedule[0].dayOfWeek}{" "}
                    {selectedFair.schedule[0].openTime}–{selectedFair.schedule[0].closeTime}
                  </Text>
                </View>
              )}

              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "500", color: Colors.primary[500] }}>
                  View details →
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
      )}
    </View>
  );
}
