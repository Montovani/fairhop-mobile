# FairHop Mobile — Developer Guide

## Framework Stack
- **Expo SDK 54** with Expo Router v6 (file-based routing)
- **React Native 0.81** with TypeScript ~5.9
- **NativeWind v4** (Tailwind CSS for React Native via `className` prop)
- **Axios** for HTTP requests with auto-token refresh
- **React Context** for global state (auth)
- **Lucide React Native** for icons

## Design System

### Color Tokens
All color tokens are defined in `constants/Colors.ts` and Tailwind classes are configured in `tailwind.config.js`. Use semantic token names consistently.

| Token | Value | Tailwind class | Usage |
|---|---|---|---|
| primary.50 | #f0fdf4 | `bg-primary-50` | Badge backgrounds (primary) |
| primary.500 | #22c55e | `bg-primary-500`, `text-primary-500` | Brand green, buttons, active states |
| primary.600 | #16a34a | `active:bg-primary-600` | Button press state |
| primary.700 | #15803d | `text-primary-700` | Badge text (primary), dark accents |
| accent.500 | #f97316 | `text-accent-500` | Star ratings, highlights |
| background | #fafafa | `bg-background` | Screen/page background |
| surface | #ffffff | `bg-surface` | Cards, inputs, modals |
| muted | #f4f4f5 | `bg-muted` | Muted badges, placeholders |
| border | #e4e4e7 | `border-border` | Input borders, card borders, dividers |
| foreground | #09090b | `text-foreground` | Primary body text |
| muted-foreground | #71717a | `text-muted-foreground` | Secondary text, captions, placeholders |

**Using Colors in JavaScript:**
```tsx
import { Colors } from "@/constants/Colors";
<MapPin size={18} color={Colors["muted-foreground"]} />
```

### Typography Conventions
- **Page/Screen titles:** `text-2xl font-bold text-foreground`
- **Section labels:** `text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2`
- **Card titles:** `text-lg font-bold text-foreground`
- **Body text:** `text-base text-foreground`
- **Captions:** `text-sm text-muted-foreground`
- **Error text:** `text-sm text-red-600` (use `text-red-*` for error states)

### Component Conventions
- **Cards:** `rounded-2xl border border-border bg-surface p-4`
- **Input fields:** `rounded-xl border border-border bg-surface px-4 py-3.5`
- **Primary badges:** `rounded-full bg-primary-50 border border-primary-100 px-2.5 py-0.5 text-xs font-medium text-primary-700`
- **Muted badges:** `rounded-full bg-muted border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground`
- **Error banner:** `rounded-lg bg-red-50 px-4 py-3` with `text-sm text-red-600`
- **Buttons:** Always use `Button` component from `components/ui/Button` (primary/outline variants, supports `loading` and `disabled` states)
- **Rounded corners:** `rounded-full` (max, e.g. buttons), `rounded-2xl` (cards), `rounded-xl` (inputs)

### Icons
Import from `lucide-react-native`. Pass `size` (number, typically 16–24px) and `color` (hex string from Colors object).

```tsx
import { MapPin } from "lucide-react-native";
import { Colors } from "@/constants/Colors";

<MapPin size={18} color={Colors["muted-foreground"]} />
```

Common icons used:
- `MapPin`, `Clock`, `Heart`, `Map`, `UserCircle`, `Star`, `AlertCircle`, `ChevronRight`, `X`, `Eye`, `EyeOff`

## Routing & Navigation

### File-Based Routing (Expo Router v6)
- Route path matches file path: `app/(tabs)/map.tsx` → `/map`, `app/fair/[id].tsx` → `/fair/:id`
- `app/_layout.tsx` — Root navigator (Stack) and global providers (SafeAreaProvider, AuthProvider)
- `app/index.tsx` — Entry point with auth guard redirects
- Group layouts like `(tabs)/_layout.tsx` create sub-navigators

### Navigation API
```tsx
import { useRouter } from "expo-router";
const router = useRouter();

// Navigate to a route
router.push("/fair/123");
router.back();

// Get route parameters
import { useLocalSearchParams } from "expo-router";
const { id } = useLocalSearchParams<{ id: string }>();

// Set dynamic header title
import { useNavigation } from "@react-navigation/native";
const navigation = useNavigation();
navigation.setOptions({ title: "Fair Name" });
```

## Authentication & State

### Auth Context
```tsx
import { useAuth } from "@/contexts/AuthContext";

const { user, isAuthenticated, isLoading, login, logout, refreshUser } = useAuth();

// user: { _id, name, email, savedFairs: string[], ... } | null
// isAuthenticated: boolean
```

**Protecting UI:**
```tsx
{isAuthenticated && <WriteReviewForm />}
{!isAuthenticated && <Text>Log in to leave a review</Text>}
```

**Saved Fairs:**
```tsx
const isSaved = user?.savedFairs.includes(fairId) ?? false;
```

### Global State
Only authentication state is global via Context. All other state (fairs, reviews, etc.) is component-local using `useState` + `useEffect`.

## Data Fetching

### Pattern: `useState` + `useEffect` (No React Query)
```tsx
const [data, setData] = useState<DataType | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await someService.getData();
      setData(result);
    } catch (err) {
      setError("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }
  load();
}, [dependency]);
```

### Services API
All services are axios-based and automatically attach Bearer auth tokens:

**Fair Service** (`services/fair.service.ts`):
```ts
fairService.getAll(params?: FairQueryParams): Promise<Fair[]>
fairService.getById(id: string): Promise<Fair>
```

**Review Service** (`services/review.service.ts`):
```ts
reviewService.getByFair(fairId: string): Promise<Review[]>
reviewService.create(data: CreateReviewRequest): Promise<Review>
reviewService.update(id: string, data: UpdateReviewRequest): Promise<Review>
reviewService.remove(id: string): Promise<void>
```

**User Service** (`services/user.service.ts`):
```ts
userService.getMe(): Promise<User>
userService.updateMe(data): Promise<User>
userService.deleteMe(): Promise<void>
userService.getSavedFairs(params?): Promise<Fair[]>
userService.saveFair(fairId): Promise<void>
userService.unsaveFair(fairId): Promise<void>
```

**Auth Service** (`services/auth.service.ts`):
```ts
authService.signup(data): Promise<{ message: string }>
authService.login(data): Promise<{ accessToken, refreshToken }>
authService.refresh(refreshToken): Promise<{ accessToken, refreshToken }>
authService.logout(refreshToken): Promise<void>
authService.verify(): Promise<JwtPayload>
```

## File Organization

```
app/                           # Expo Router screens (default exports)
  _layout.tsx                  # Root Stack + SafeArea + AuthProvider
  index.tsx                    # Auth guard & redirect
  +not-found.tsx               # 404 screen
  (auth)/
    _layout.tsx                # Auth Stack (fade animation)
    login.tsx                  # Login screen
    signup.tsx                 # Signup screen
  (tabs)/
    _layout.tsx                # Tab navigator (3 tabs)
    map.tsx                    # Map / explore screen
    saved.tsx                  # Saved fairs screen
    profile.tsx                # User profile screen
  fair/
    [id].tsx                   # Fair detail screen

components/
  ui/                          # Reusable primitives (always named exports)
    Button.tsx                 # Primary/outline button variants
    Input.tsx                  # Text input with error support
    StarRating.tsx             # 5-star read-only display
    Badge.tsx                  # Category/product pill badges
  map/                         # Map-specific components
    MapContainer.tsx           # Main map (native)
    MapContainer.web.tsx       # Web version (Google Maps JS)
    FairMarker.tsx             # Custom map pin marker
  fair/                        # Fair detail screen components
    ReviewCard.tsx             # Single review display
    WriteReviewForm.tsx        # Star picker + comment form

services/                      # API clients (axios-based)
  api.ts                       # Axios instance with interceptors
  auth.service.ts
  fair.service.ts
  review.service.ts
  user.service.ts
  token.service.ts             # Secure token persistence

contexts/
  AuthContext.tsx              # Global auth state + login/logout

hooks/
  useFairsInRegion.ts          # Fetch fairs on map region change
  useLocation.ts               # Request device GPS

types/
  index.ts                     # All shared TypeScript interfaces

constants/
  Colors.ts                    # Color token definitions

assets/
  fonts/                       # Custom fonts
  images/                      # Image assets

global.css                     # Tailwind directives
tailwind.config.js             # Tailwind + NativeWind config
babel.config.js                # Babel config (jsxImportSource)
```

## Component Patterns

### Button Component Usage
```tsx
import { Button } from "@/components/ui/Button";

<Button onPress={handleSubmit} variant="primary" loading={isLoading} disabled={!canSubmit}>
  Submit
</Button>
```

### Badge Component Usage
```tsx
import { Badge } from "@/components/ui/Badge";

<Badge label="Organic" variant="primary" />
<Badge label="Vegetables" variant="muted" />
```

### Star Rating Display
```tsx
import { StarRating } from "@/components/ui/StarRating";

<StarRating rating={4.5} size={18} />  {/* Shows 4-5 filled stars */}
```

### Review Card
```tsx
import { ReviewCard } from "@/components/fair/ReviewCard";

<ReviewCard review={reviewObject} />
```

### Write Review Form
```tsx
import { WriteReviewForm } from "@/components/fair/WriteReviewForm";

<WriteReviewForm
  fairId="63f1234..."
  onSubmitted={(newReview) => {
    setReviews(prev => [newReview, ...prev]);
  }}
/>
```

## Styling Techniques

### NativeWind Classes
NativeWind allows Tailwind utilities directly in `className` prop:

**Layout:**
```tsx
<View className="flex-1 flex-row items-center justify-between gap-4">
```

**Spacing:**
```tsx
<View className="px-4 py-3 mt-2 mb-4 gap-2">
```

**Colors:**
```tsx
<View className="bg-surface border border-border rounded-2xl">
<Text className="text-foreground text-base font-semibold">
```

**Responsive (limited in RN):**
Most responsive utilities don't apply. Design for single viewport.

### Image & Media
```tsx
<Image
  source={{ uri: "https://..." }}
  className="h-44 w-56 rounded-xl"
  resizeMode="cover"
/>
```

### ScrollView with Content Padding
To create a "bleed" effect on horizontal scroll:
```tsx
<ScrollView
  horizontal
  className="-mx-4"                          {/* Break out of parent padding */}
  contentContainerClassName="px-4 gap-2"    {/* Restore padding inside scroll */}
>
  {items.map(item => <Item key={item.id} />)}
</ScrollView>
```

## Error Handling

### Network / API Errors
Catch with try/catch, extract message from Axios error response:
```tsx
catch (err) {
  const axiosError = err as AxiosError<{ message?: string }>;
  setError(axiosError.response?.data?.message ?? "Something went wrong");
}
```

### Display to User
Show in a red banner:
```tsx
{error && (
  <View className="rounded-lg bg-red-50 px-4 py-3">
    <Text className="text-sm text-red-600">{error}</Text>
  </View>
)}
```

## Testing

Run the app in development:
```bash
npx expo start
```

On the same terminal:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Press `w` for Web

## Key Implementation Notes

1. **Optimistic UI:** For actions like save/unsave, update the UI immediately, revert on error.
2. **Dynamic Headers:** Use `useNavigation().setOptions({ title: name })` inside useEffect after data loads.
3. **Type Safety:** Always use named interfaces from `types/index.ts`. Use `typeof` guards for union types (e.g., `review.owner`).
4. **Conditional Rendering:** Use short-circuit && for single conditions, ternary for two branches.
5. **Keys in Lists:** Always provide unique `key` prop when mapping.
6. **Image Sizing:** Always set explicit `width` and `height` on `Image` components (percentage works too).
7. **ScrollView Content Padding:** Use `contentContainerClassName` instead of `contentContainerStyle` for NativeWind consistency.
8. **Review Owner:** API returns `Review.owner` as either a string (ID) or object `{ _id, name }`. Always check `typeof owner === "object"`.
