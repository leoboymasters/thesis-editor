import { create } from 'zustand';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => Promise<void>;
  signInWithGoogle: (isSignUp: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  init: () => () => void; // Returns a cleanup function
}

// Helper to clean URL after OAuth - removes fragments and codes to prevent refresh loops
const CACHE_KEY = 'thesis_editor_profile';

const cleanUrl = () => {
  if (typeof window === 'undefined') return;
  
  const { href, pathname, search } = window.location;
  // Only clean if there's a hash (OAuth token) or auth-related search params
  if (href.includes('#') || search.includes('code=') || search.includes('error=')) {
    console.log('[Auth] Cleaning URL fragments/params');
    const url = new URL(href);
    
    // Clear known OAuth/Auth params
    ['code', 'error', 'error_description', 'error_code', 'state'].forEach(p => url.searchParams.delete(p));
    
    // Replace with clean URL (pathname + filtered search, no hash)
    const cleanPath = pathname + url.search;
    window.history.replaceState(null, '', cleanPath);
  }
};

// Track the active sync to prevent race conditions
let activeSyncPromise: Promise<void> | null = null;
let activeSyncUserId: string | null = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,
  
  setUser: async (user) => {
    const currentState = get();
    
    // 1. SILENT GUARD: If user is already set, profile is matched, and we're not loading, do nothing.
    // This prevents the "repetition" in logs during initialization and StrictMode renders.
    if (user && currentState.user?.id === user.id && currentState.profile?.id === user.id && !currentState.loading) {
      return;
    }

    // 2. If no user, clear state and return
    if (!user) {
      activeSyncPromise = null;
      activeSyncUserId = null;
      set({ user: null, profile: null, loading: false });
      return;
    }

    // 2. If already syncing THIS user, just wait for existing promise
    if (activeSyncUserId === user.id && activeSyncPromise) {
      console.log('[Auth] deduplicate: Joining existing sync... (singleton)');
      return activeSyncPromise;
    }

    // 3. ZERO-FETCH / INSTANT LOAD OPTIMIZATION:
    // If we already have this user's profile in state (e.g. from localStorage cache loaded in init),
    // set the user immediately and stop loading. This prevents "falling back" to the auth screen.
    if (currentState.profile?.id === user.id) {
      console.log('[Auth] Instant Load: Using cached profile for', user.email);
      set({ user, loading: false, error: null });
      return;
    }

    // 4. Start a new sync "singleton"
    activeSyncUserId = user.id;
    activeSyncPromise = (async () => {
      console.log('[Auth] sync-start:', user.email, 'UID:', user.id);
      set({ loading: true, error: null });

      try {
        // Helper to fetch profile with timeout
        const fetchWithTimeout = async () => {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .maybeSingle(); 
            if (error) throw error;
            return data;
          } catch (e) {
            return null; 
          }
        };

        // Attempt fetch (with a single retry for robustness - allowing trigger to finish)
        let profileData = await fetchWithTimeout();
        if (!profileData) {
          console.log('[Auth] Profile not found, waiting for trigger...');
          await new Promise(r => setTimeout(r, 1500));
          profileData = await fetchWithTimeout();
        }

        // Final check: if we're still the active sync
        if (activeSyncUserId !== user.id) return;

        // If no profile, we just log it but don't crash the app - 
        // useful if you want to allow "headless" users or handle profile creation client-side later
        if (!profileData) {
           console.warn('[Auth] No profile found even after retry.');
        }

        console.log('[Auth] Profile sync complete.');

        // Commit state
        set({ user, profile: profileData, loading: false, error: null });
        if (profileData) {
            localStorage.setItem(CACHE_KEY, JSON.stringify(profileData));
        }
      } catch (err: any) {
        // Only broadcast error if this is still the active sync
        if (activeSyncUserId === user.id) {
          console.error('[Auth] Fatal sync error:', err);
          set({ loading: false, error: err.message });
        }
      } finally {
        // Only clear if this was our sync
        if (activeSyncUserId === user.id) {
          activeSyncPromise = null;
        }
      }
    })();

    return activeSyncPromise;
  },

  signInWithGoogle: async (isSignUp: boolean) => {
    set({ loading: true, error: null });
    try {
      const redirectTo = import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent', // Always ask for consent for simplicity and better UX on re-auth
          },
          redirectTo,
        },
      });

      if (error) throw error;
      
    } catch (err: any) {
      console.error('[Auth] Google Sign-in error:', err);
      set({ loading: false, error: err.message });
      throw err;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Signout error:', e);
    }
    set({ user: null, profile: null, error: null, loading: false });
    localStorage.removeItem(CACHE_KEY);
    if (typeof window !== 'undefined') {
       window.history.replaceState(null, '', window.location.pathname);
    }
  },
  
  clearError: () => set({ error: null }),

  init: () => {
    console.log('[Auth] Initializing store...');
    
    // 1. Initial Session Recovery
    const initializeAuth = async () => {
      console.log('[Auth] Initializing session recovery...');
      try {
        // Load cached profile immediately
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          try {
            const profile = JSON.parse(cached);
            set({ profile });
          } catch (e) {
            localStorage.removeItem(CACHE_KEY);
          }
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session?.user) {
          await get().setUser(session.user);
        } else {
          console.log('[Auth] No session found during init.');
          set({ profile: null, loading: false });
          localStorage.removeItem(CACHE_KEY);
        }
      } catch (e) {
        console.error('[Auth] Init failed:', e);
        set({ loading: false });
      }
    };

    initializeAuth();

    // 2. Auth State Listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`[Auth] Listener Event: ${event}`);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          await get().setUser(session.user);
        }
        setTimeout(cleanUrl, 0);
      } else if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null, loading: false });
        activeSyncPromise = null;
        activeSyncUserId = null;
      }
      
      if (event === 'INITIAL_SESSION' && session?.user) {
        cleanUrl();
      }
    });

    // 3. Defensive loader closer
    const loaderTimeout = setTimeout(() => {
      if (get().loading) {
        console.log('[Auth] Fallback triggered: closing loader');
        set({ loading: false });
      }
    }, 6000);

    // Return cleanup function
    return () => {
      subscription.unsubscribe();
      clearTimeout(loaderTimeout);
    };
  },
}));
