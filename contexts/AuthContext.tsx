import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { router } from "expo-router";
import type { User, LoginRequest, SignupRequest } from "@/types";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { tokenService } from "@/services/token.service";
import { setForceLogoutCallback } from "@/services/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const forceLogout = useCallback(async () => {
    await tokenService.clearTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.replace("/(auth)/login");
  }, []);

  // Register force logout with the API interceptor
  useEffect(() => {
    setForceLogoutCallback(forceLogout);
  }, [forceLogout]);

  // Check for existing tokens on mount
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const accessToken = await tokenService.getAccessToken();
        if (!accessToken) {
          setState({ user: null, isLoading: false, isAuthenticated: false });
          return;
        }

        const user = await userService.getMe();
        setState({ user, isLoading: false, isAuthenticated: true });
      } catch {
        await tokenService.clearTokens();
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    };

    bootstrapAuth();
  }, []);

  const login = async (data: LoginRequest) => {
    const tokens = await authService.login(data);
    await tokenService.setTokens(tokens.accessToken, tokens.refreshToken);
    const user = await userService.getMe();
    setState({ user, isLoading: false, isAuthenticated: true });
    router.replace("/(tabs)/map");
  };

  const signup = async (data: SignupRequest) => {
    await authService.signup(data);
    await login({ email: data.email, password: data.password });
  };

  const logout = async () => {
    try {
      const refreshToken = await tokenService.getRefreshToken();
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
    } catch {
      // Ignore logout API errors
    } finally {
      await tokenService.clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
      router.replace("/(auth)/login");
    }
  };

  const refreshUser = async () => {
    const user = await userService.getMe();
    setState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
