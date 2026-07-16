"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  loginUser,
  refreshToken as refreshTokenRequest,
  registerUser,
  updateMe,
} from "@/lib/api";
import type { AuthUser, LoginPayload, RegisterPayload } from "@/types/catalog";

const ACCESS_KEY = "omega_auth_access";
const REFRESH_KEY = "omega_auth_refresh";

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  /** true, пока идёт первичная проверка токена из localStorage при монтировании */
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateProfile: (payload: Partial<AuthUser>) => Promise<void>;
  /** Достаёт валидный access-токен, обновляя его по refresh-токену при необходимости. */
  getValidAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hydrated = useRef(false);

  // Гидрация токенов из localStorage при монтировании — клиент-онли, см. паттерн CartContext.
  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      try {
        const access = window.localStorage.getItem(ACCESS_KEY);
        const refresh = window.localStorage.getItem(REFRESH_KEY);
        if (!access || !refresh) return;
        try {
          const me = await getMe(access);
          if (cancelled) return;
          setAccessToken(access);
          setRefreshTokenValue(refresh);
          setUser(me);
        } catch {
          // access протух — пробуем обновить по refresh
          try {
            const { access: newAccess } = await refreshTokenRequest(refresh);
            const me = await getMe(newAccess);
            if (cancelled) return;
            window.localStorage.setItem(ACCESS_KEY, newAccess);
            setAccessToken(newAccess);
            setRefreshTokenValue(refresh);
            setUser(me);
          } catch {
            window.localStorage.removeItem(ACCESS_KEY);
            window.localStorage.removeItem(REFRESH_KEY);
          }
        }
      } finally {
        hydrated.current = true;
        if (!cancelled) setIsLoading(false);
      }
    }
    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistTokens = useCallback((access: string, refresh: string) => {
    window.localStorage.setItem(ACCESS_KEY, access);
    window.localStorage.setItem(REFRESH_KEY, refresh);
    setAccessToken(access);
    setRefreshTokenValue(refresh);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const tokens = await loginUser(payload);
      const me = await getMe(tokens.access);
      persistTokens(tokens.access, tokens.refresh);
      setUser(me);
    },
    [persistTokens],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await registerUser(payload);
      await login({ email: payload.email, password: payload.password });
    },
    [login],
  );

  const logout = useCallback(() => {
    window.localStorage.removeItem(ACCESS_KEY);
    window.localStorage.removeItem(REFRESH_KEY);
    setAccessToken(null);
    setRefreshTokenValue(null);
    setUser(null);
  }, []);

  const getValidAccessToken = useCallback(async (): Promise<string | null> => {
    if (!accessToken || !refreshTokenValue) return null;
    try {
      // Пробуем текущий токен на /me/ — дёшево и заодно валидирует его.
      await getMe(accessToken);
      return accessToken;
    } catch {
      try {
        const { access } = await refreshTokenRequest(refreshTokenValue);
        window.localStorage.setItem(ACCESS_KEY, access);
        setAccessToken(access);
        return access;
      } catch {
        logout();
        return null;
      }
    }
  }, [accessToken, refreshTokenValue, logout]);

  const updateProfile = useCallback(
    async (payload: Partial<AuthUser>) => {
      const token = await getValidAccessToken();
      if (!token) throw new Error("Сессия истекла, войдите заново");
      const me = await updateMe(token, payload);
      setUser(me);
    },
    [getValidAccessToken],
  );

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isLoading,
      login,
      register,
      logout,
      updateProfile,
      getValidAccessToken,
    }),
    [user, accessToken, isLoading, login, register, logout, updateProfile, getValidAccessToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth должен использоваться внутри <AuthProvider>");
  return ctx;
}
