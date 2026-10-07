/**
 * ============================================================================
 * DEMO AUTHENTICATION MODULE - NOT FOR PRODUCTION USE
 * ============================================================================
 * 
 * This is a client-side mock authentication system for demonstration purposes.
 * In a real application, replace this with a proper authentication provider:
 * - NextAuth.js (Auth.js)
 * - Supabase Auth
 * - Firebase Auth
 * - Clerk
 * - Auth0
 * 
 * SECURITY NOTES:
 * - No real authentication or encryption
 * - Never stores passwords (even in this demo)
 * - User data stored in localStorage (not secure)
 * - No session management or token refresh
 * - No backend validation
 * 
 * For production, implement:
 * - Secure HTTP-only cookie sessions
 * - CSRF protection
 * - Password hashing (bcrypt/argon2)
 * - JWT tokens with proper expiry
 * - OAuth/SSO integration
 * - Rate limiting
 * - MFA support
 * ============================================================================
 */

const STORAGE_KEY = "recore_user";
const REMEMBER_KEY = "recore_remember_me";
const DEMO_DELAY = 800; // Simulated network latency

export interface User {
  name: string;
  email: string;
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Validate email format using a basic regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength (minimum 8 characters)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/**
 * Mock login function - accepts any valid email format + 8+ char password
 */
export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY));

  const { email, password, rememberMe } = credentials;

  // Basic validation
  if (!email || !password) {
    return {
      success: false,
      error: "Email and password are required",
    };
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      error: "Please enter a valid email address",
    };
  }

  if (!isValidPassword(password)) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    };
  }

  // Extract name from email (before @) for demo purposes
  const name = email.split("@")[0].replace(/[._-]/g, " ");
  const capitalizedName = name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const user: User = {
    name: capitalizedName,
    email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(capitalizedName)}&background=3b82f6&color=fff`,
  };

  // Store user based on rememberMe flag
  if (typeof window !== "undefined") {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, "true");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }

  return {
    success: true,
    user,
  };
}

/**
 * Mock signup function - creates a user with the provided name
 */
export async function signup(credentials: SignupCredentials): Promise<AuthResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY));

  const { name, email, password, confirmPassword, rememberMe } = credentials;

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return {
      success: false,
      error: "All fields are required",
    };
  }

  if (!isValidEmail(email)) {
    return {
      success: false,
      error: "Please enter a valid email address",
    };
  }

  if (!isValidPassword(password)) {
    return {
      success: false,
      error: "Password must be at least 8 characters",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "Passwords do not match",
    };
  }

  const user: User = {
    name,
    email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`,
  };

  // Store user based on rememberMe
  if (typeof window !== "undefined") {
    if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, "true");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(REMEMBER_KEY);
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
  }

  return {
    success: true,
    user,
  };
}

/**
 * Demo user login - instant login for judges/testing
 */
export async function loginAsDemo(): Promise<AuthResponse> {
  const user: User = {
    name: "Alex Rivera",
    email: "demo@recore.ai",
    avatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=3b82f6&color=fff",
  };

  if (typeof window !== "undefined") {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  // Small delay for UX
  await new Promise((resolve) => setTimeout(resolve, 200));

  return {
    success: true,
    user,
  };
}

/**
 * Get the currently logged-in user from storage
 */
export function getCurrentUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // 1. Check active session storage first
    const sessionUser = sessionStorage.getItem(STORAGE_KEY);
    if (sessionUser) {
      return JSON.parse(sessionUser) as User;
    }

    // 2. Check local storage only if rememberMe was set
    const isRemembered = localStorage.getItem(REMEMBER_KEY) === "true";
    if (isRemembered) {
      const localUser = localStorage.getItem(STORAGE_KEY);
      if (localUser) {
        return JSON.parse(localUser) as User;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Log out the current user
 */
export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(REMEMBER_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
