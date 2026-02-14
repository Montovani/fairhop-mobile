import { Marker } from "react-native-maps";
import { View } from "react-native";
import { MapPin } from "lucide-react-native";
import type { Fair } from "@/types";

interface FairMarkerProps {
  fair: Fair;
  onPress: (fair: Fair) => void;
}

export function FairMarker({ fair, onPress }: FairMarkerProps) {
  const [longitude, latitude] = fair.location.coordinates;

  return (
    <Marker
      coordinate={{ latitude, longitude }}
      onPress={() => onPress(fair)}
      tracksViewChanges={false}
    >
      <View className="items-center">
        <View className="rounded-full bg-primary-500 p-2">
          <MapPin size={20} color="#ffffff" />
        </View>
        <View
          style={{
            width: 0,
            height: 0,
            borderLeftWidth: 6,
            borderRightWidth: 6,
            borderTopWidth: 8,
            borderLeftColor: "transparent",
            borderRightColor: "transparent",
            borderTopColor: "#22c55e",
            marginTop: -1,
          }}
        />
      </View>
    </Marker>
  );
}
