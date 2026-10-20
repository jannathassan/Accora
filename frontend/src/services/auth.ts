/**
 * Authentication Service for Accora.
 * 
 * Handles user input validation, credential transmission to the FastAPI backend,
 * secure token storage, and session state.
 * Never logs or stores plain-text passwords.
 */

import type { User } from '../types';
import { resolveApiBase } from './api';

export interface AuthSession {
  token: string;
  user: User;
  expires_at?: string;
}

export interface PasswordValidationResult {
  score: number; // 0 to 4
  hasMinLength: boolean;
  hasUpper: boolean;
  hasLower: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  feedback: string[];
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Email address is required.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return 'Please enter a valid business or personal email address.';
  }
  return null;
}

export function validateFullName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Full name is required.';
  if (trimmed.length < 2) return 'Full name must be at least 2 characters.';
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed)) {
    return 'Full name should only contain letters, spaces, hyphens, and apostrophes.';
  }
  return null;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const feedback: string[] = [];
  if (!hasMinLength) feedback.push('At least 8 characters');
  if (!hasUpper) feedback.push('One uppercase letter');
  if (!hasLower) feedback.push('One lowercase letter');
  if (!hasNumber) feedback.push('One numerical digit');
  if (!hasSpecial) feedback.push('One special symbol (e.g. !@#$%^&*)');

  let score = 0;
  if (hasMinLength) score++;
  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;

  return {
    score,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSpecial,
    feedback,
  };
}

const STORAGE_KEY_USER = 'accora_auth_user';
const STORAGE_KEY_TOKEN = 'accora_auth_token';

export function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY_TOKEN);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

export function clearSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_TOKEN);
  } catch {
    // ignore
  }
}

export function setSession(token: string, user: User): void {
  try {
    localStorage.setItem(STORAGE_KEY_TOKEN, token);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  } catch {
    // ignore
  }
}

export interface AuthApiResult {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
  isBackendOffline?: boolean;
}

/**
 * Registers a new user with the SQLite backend.
 * Creates an isolated business workspace.
 */
export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthApiResult> {
  const base = resolveApiBase();
  try {
    const res = await fetch(`${base}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    });

    if (res.status === 404 || res.status === 502) {
      return {
        success: false,
        isBackendOffline: true,
        error:
          'Backend Authentication Service endpoint (/api/v1/auth/signup) is not reachable.',
      };
    }

    if (!res.ok) {
      let errMsg = 'Failed to create account.';
      try {
        const data = await res.json();
        errMsg = data.detail || errMsg;
      } catch {
        // fallback
      }
      return { success: false, error: errMsg };
    }

    const data: AuthSession = await res.json();
    setSession(data.token, data.user);
    return { success: true, user: data.user, token: data.token };
  } catch (err) {
    return {
      success: false,
      isBackendOffline: true,
      error:
        err instanceof Error
          ? `Backend connection error: ${err.message}`
          : 'Unable to reach backend authentication service.',
    };
  }
}

/**
 * Logs in an existing user with the backend API.
 */
export async function loginUser(payload: {
  email: string;
  password: string;
}): Promise<AuthApiResult> {
  const base = resolveApiBase();
  try {
    const res = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: payload.email.trim().toLowerCase(),
        password: payload.password,
      }),
    });

    if (res.status === 404 || res.status === 502) {
      return {
        success: false,
        isBackendOffline: true,
        error:
          'Backend Authentication Service endpoint (/api/v1/auth/login) is not reachable.',
      };
    }

    if (!res.ok) {
      let errMsg = 'Invalid email or password.';
      try {
        const data = await res.json();
        errMsg = data.detail || errMsg;
      } catch {
        // fallback
      }
      return { success: false, error: errMsg };
    }

    const data: AuthSession = await res.json();
    setSession(data.token, data.user);
    return { success: true, user: data.user, token: data.token };
  } catch (err) {
    return {
      success: false,
      isBackendOffline: true,
      error:
        err instanceof Error
          ? `Backend connection error: ${err.message}`
          : 'Unable to reach backend authentication service.',
    };
  }
}

/**
 * Logs in as the pre-configured demo user (Ayesha Khan) with a real SQLite session.
 */
export async function demoLogin(): Promise<AuthApiResult> {
  const base = resolveApiBase();
  try {
    const res = await fetch(`${base}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      let errMsg = 'Demo login failed.';
      try {
        const data = await res.json();
        errMsg = data.detail || errMsg;
      } catch {
        // fallback
      }
      return { success: false, error: errMsg };
    }

    const data: AuthSession = await res.json();
    setSession(data.token, data.user);
    return { success: true, user: data.user, token: data.token };
  } catch (err) {
    return {
      success: false,
      isBackendOffline: true,
      error:
        err instanceof Error
          ? `Backend connection error: ${err.message}`
          : 'Unable to reach backend authentication service.',
    };
  }
}

/**
 * Signs out the user by revoking the session token on the backend and clearing local storage.
 */
export async function logoutUser(): Promise<void> {
  const token = getStoredToken();
  if (token) {
    const base = resolveApiBase();
    try {
      await fetch(`${base}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
      // ignore network errors on logout
    }
  }
  clearSession();
}
