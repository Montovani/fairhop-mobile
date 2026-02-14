import { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
} from "react-native";
import { X } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/Colors";
import type { Fair } from "@/types";

export interface MapFilters {
  minRating: number | null;
  openToday: boolean;
  categories: string[];
  products: string[];
  nearMe: boolean;
  matchMode: "any" | "all";
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: MapFilters) => void;
  fairs: Fair[];
  isLoading: boolean;
}

const RATING_OPTIONS = [
  { label: "All ratings", value: null },
  { label: "3★+", value: 3 },
  { label: "4★+", value: 4 },
  { label: "4.5★+", value: 4.5 },
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function FilterModal({
  visible,
  onClose,
  onApply,
  fairs,
  isLoading,
}: FilterModalProps) {
  const [minRating, setMinRating] = useState<number | null>(null);
  const [openToday, setOpenToday] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [nearMe, setNearMe] = useState(false);
  const [matchMode, setMatchMode] = useState<"any" | "all">("any");

  // Extract unique categories and products from fairs
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    fairs.forEach((fair) => {
      fair.category.forEach((cat) => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [fairs]);

  const availableProducts = useMemo(() => {
    const prods = new Set<string>();
    fairs.forEach((fair) => {
      fair.products.forEach((prod) => prods.add(prod));
    });
    return Array.from(prods).sort();
  }, [fairs]);

  const getTodayDayName = () => {
    const today = new Date();
    return DAY_NAMES[today.getDay()];
  };

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleProductToggle = (product: string) => {
    setSelectedProducts((prev) =>
      prev.includes(product)
        ? prev.filter((p) => p !== product)
        : [...prev, product],
    );
  };

  const handleApply = () => {
    onApply({
      minRating,
      openToday,
      categories: selectedCategories,
      products: selectedProducts,
      nearMe,
      matchMode,
    });
    onClose();
  };

  const handleReset = () => {
    setMinRating(null);
    setOpenToday(false);
    setSelectedCategories([]);
    setSelectedProducts([]);
    setNearMe(false);
    setMatchMode("any");
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50">
        <View className="mt-auto flex-1 max-h-[85%] rounded-t-3xl bg-background">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-border px-4 py-4">
            <Text className="text-xl font-bold text-foreground">Filters</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <X size={24} color={Colors.foreground} />
            </Pressable>
          </View>

          {/* Content */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-4 py-4 pb-6"
          >
            {isLoading && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color={Colors.primary[500]} />
                <Text className="mt-2 text-sm text-muted-foreground">
                  Loading options...
                </Text>
              </View>
            )}

            {!isLoading && (
              <>
                {/* Match Mode Toggle */}
                <View className="mb-6 rounded-lg border border-border bg-surface p-3">
                  <Text className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Match Mode
                  </Text>
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={() => setMatchMode("any")}
                      className={`flex-1 rounded-lg py-2.5 px-3 items-center ${
                        matchMode === "any"
                          ? "bg-primary-500"
                          : "bg-muted border border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          matchMode === "any"
                            ? "text-surface"
                            : "text-foreground"
                        }`}
                      >
                        Match Any
                      </Text>
                      <Text
                        className={`text-xs mt-0.5 ${
                          matchMode === "any"
                            ? "text-surface/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        (OR)
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setMatchMode("all")}
                      className={`flex-1 rounded-lg py-2.5 px-3 items-center ${
                        matchMode === "all"
                          ? "bg-primary-500"
                          : "bg-muted border border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-semibold ${
                          matchMode === "all"
                            ? "text-surface"
                            : "text-foreground"
                        }`}
                      >
                        Match All
                      </Text>
                      <Text
                        className={`text-xs mt-0.5 ${
                          matchMode === "all"
                            ? "text-surface/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        (AND)
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Rating Filter */}
                <View className="mb-6">
                  <Text className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
                    Minimum Rating
                  </Text>
                  <View className="gap-2">
                    {RATING_OPTIONS.map((option) => (
                      <Pressable
                        key={String(option.value)}
                        onPress={() => setMinRating(option.value)}
                        className={`rounded-lg border px-4 py-3 ${
                          minRating === option.value
                            ? "border-primary-500 bg-primary-50"
                            : "border-border bg-surface"
                        }`}
                      >
                        <Text
                          className={`text-base font-medium ${
                            minRating === option.value
                              ? "text-primary-700"
                              : "text-foreground"
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                {/* Open Today Filter */}
                <View className="mb-6">
                  <Text className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
                    Hours
                  </Text>
                  <Pressable
                    onPress={() => setOpenToday(!openToday)}
                    className={`rounded-lg border px-4 py-3 flex-row items-center ${
                      openToday
                        ? "border-primary-500 bg-primary-50"
                        : "border-border bg-surface"
                    }`}
                  >
                    <View
                      className={`h-5 w-5 rounded border-2 mr-3 items-center justify-center ${
                        openToday
                          ? "border-primary-500 bg-primary-500"
                          : "border-border"
                      }`}
                    >
                      {openToday && <Text className="text-white font-bold">✓</Text>}
                    </View>
                    <Text
                      className={`text-base font-medium ${
                        openToday ? "text-primary-700" : "text-foreground"
                      }`}
                    >
                      Open today ({getTodayDayName()})
                    </Text>
                  </Pressable>
                </View>

                {/* Categories */}
                {availableCategories.length > 0 && (
                  <View className="mb-6">
                    <Text className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
                      Categories
                    </Text>
                    <View className="gap-2">
                      {availableCategories.map((cat) => (
                        <Pressable
                          key={cat}
                          onPress={() => handleCategoryToggle(cat)}
                          className={`rounded-lg border px-4 py-3 flex-row items-center ${
                            selectedCategories.includes(cat)
                              ? "border-primary-500 bg-primary-50"
                              : "border-border bg-surface"
                          }`}
                        >
                          <View
                            className={`h-5 w-5 rounded border-2 mr-3 items-center justify-center ${
                              selectedCategories.includes(cat)
                                ? "border-primary-500 bg-primary-500"
                                : "border-border"
                            }`}
                          >
                            {selectedCategories.includes(cat) && (
                              <Text className="text-white font-bold">✓</Text>
                            )}
                          </View>
                          <Text
                            className={`text-base font-medium ${
                              selectedCategories.includes(cat)
                                ? "text-primary-700"
                                : "text-foreground"
                            }`}
                          >
                            {cat}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Products */}
                {availableProducts.length > 0 && (
                  <View className="mb-6">
                    <Text className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
                      Products
                    </Text>
                    <View className="gap-2">
                      {availableProducts.map((prod) => (
                        <Pressable
                          key={prod}
                          onPress={() => handleProductToggle(prod)}
                          className={`rounded-lg border px-4 py-3 flex-row items-center ${
                            selectedProducts.includes(prod)
                              ? "border-primary-500 bg-primary-50"
                              : "border-border bg-surface"
                          }`}
                        >
                          <View
                            className={`h-5 w-5 rounded border-2 mr-3 items-center justify-center ${
                              selectedProducts.includes(prod)
                                ? "border-primary-500 bg-primary-500"
                                : "border-border"
                            }`}
                          >
                            {selectedProducts.includes(prod) && (
                              <Text className="text-white font-bold">✓</Text>
                            )}
                          </View>
                          <Text
                            className={`text-base font-medium ${
                              selectedProducts.includes(prod)
                                ? "text-primary-700"
                                : "text-foreground"
                            }`}
                          >
                            {prod}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}

                {/* Near Me */}
                <View className="mb-6">
                  <Text className="mb-3 text-sm font-semibold text-foreground uppercase tracking-wide">
                    Location
                  </Text>
                  <Pressable
                    onPress={() => setNearMe(!nearMe)}
                    className={`rounded-lg border px-4 py-3 flex-row items-center ${
                      nearMe
                        ? "border-primary-500 bg-primary-50"
                        : "border-border bg-surface"
                    }`}
                  >
                    <View
                      className={`h-5 w-5 rounded border-2 mr-3 items-center justify-center ${
                        nearMe
                          ? "border-primary-500 bg-primary-500"
                          : "border-border"
                      }`}
                    >
                      {nearMe && <Text className="text-white font-bold">✓</Text>}
                    </View>
                    <Text
                      className={`text-base font-medium ${
                        nearMe ? "text-primary-700" : "text-foreground"
                      }`}
                    >
                      Near me
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View className="border-t border-border px-4 py-4 gap-2">
            <Button onPress={handleApply}>Apply Filters</Button>
            <Pressable
              onPress={handleReset}
              className="rounded-lg border border-border bg-surface py-3"
            >
              <Text className="text-center text-base font-medium text-foreground">
                Reset
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
