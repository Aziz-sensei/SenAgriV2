import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Role } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { User } from '@supabase/supabase-js';

interface UserContextType {
  user: User | null;
  role: Role;
  loading: boolean;
  setRole: (role: Role) => Promise<void>;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRoleState] = useState<Role>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, pass: string) => {
    console.log('UserContext: Login attempt for', email);
    
    // Admin special check
    if (role === 'admin') {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'bass123@gmail.com';
      const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'passer123';
      
      if (email === adminEmail && pass === adminPass) {
        console.log('UserContext: Admin mock login successful');
        const mockAdminUser = {
          id: 'admin-id',
          email: adminEmail,
          app_metadata: {},
          user_metadata: {},
          aud: 'authenticated',
          created_at: new Date().toISOString()
        } as User;
        setUser(mockAdminUser);
        return;
      } else {
        throw new Error("Identifiants administrateur invalides.");
      }
    }

    if (!isSupabaseConfigured()) {
      throw new Error("Supabase n'est pas configuré. Veuillez vérifier vos variables d'environnement (VITE_SUPABASE_URL, etc.).");
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    setUser(data.user);

    // After login, fetch the role FROM the database (the role set at signup)
    // Do NOT overwrite with locally selected role — the DB role is the source of truth
    if (data.user) {
      const profile = await fetchProfile(data.user.id);
      if (profile) {
        console.log('UserContext: Role loaded from DB after login:', profile.role);
        localStorage.setItem('senagri_role', profile.role);
      }
    }
  };

  useEffect(() => {
    // 1. Get initial session
    const initAuth = async (retries = 3) => {
      try {
        // Always try to load the role from localStorage as a fallback/initial state
        const savedRole = localStorage.getItem('senagri_role') as Role;
        if (savedRole) setRoleState(savedRole);

        if (!isSupabaseConfigured()) {
          setLoading(false);
          return;
        }

        console.log(`UserContext: Initializing auth (Attempt ${4 - retries}/3)...`);

        // Add a longer timeout to prevent infinite loading if Supabase hangs
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Auth timeout')), 60000)
        );

        const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
        const session = result?.data?.session;
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err.message);
        
        if (retries > 1) {
          const delay = (4 - retries) * 2000; // Exponential backoff: 2s, 4s
          console.log(`UserContext: Retrying auth in ${delay/1000} seconds... (${retries - 1} retries left)`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          return initAuth(retries - 1);
        }

        // Fallback to local storage on error
        const savedRole = localStorage.getItem('senagri_role') as Role;
        if (savedRole) setRoleState(savedRole);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 2. Listen for auth changes (only if configured)
    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        try {
          setUser(session?.user ?? null);
          if (session?.user) {
            const profile = await fetchProfile(session.user.id);
            
            if (profile) {
              // User has a profile in DB → use the DB role (source of truth)
              console.log('UserContext: Using DB role:', profile.role);
              setRoleState(profile.role as Role);
              localStorage.setItem('senagri_role', profile.role);
            } else {
              // NEW user (just signed up, no profile yet or trigger hasn't run)
              // Save the locally selected role to DB
              const selectedRole = role || (localStorage.getItem('senagri_role') as Role);
              if (selectedRole) {
                console.log('UserContext: New user, saving selected role to DB:', selectedRole);
                await supabase.from('profiles').upsert({ id: session.user.id, role: selectedRole });
                setRoleState(selectedRole);
              }
            }
          } else {
            // Not logged in — keep the locally selected role for role selection page
          }
        } catch (err) {
          console.error('Auth change error:', err);
        } finally {
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setRoleState(data.role as Role);
        return data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  const handleSetRole = async (newRole: Role) => {
    console.log('UserContext: Setting role to', newRole);
    
    // 1. Update local state immediately (for role selection page before login)
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem('senagri_role', newRole);
    } else {
      localStorage.removeItem('senagri_role');
      // If clearing role (e.g. going back), also clear user
      // so they go back to role selection
      setUser(null);
    }

    // 2. Only sync with Supabase if user is logged in AND explicitly changing role
    // This should NOT happen during normal flow — role is set at signup only
    // But we keep it for admin override if needed
  };

  const logout = async () => {
    console.log('UserContext: Aggressive logout initiated');
    
    // 1. Clear local state and storage IMMEDIATELY
    setRoleState(null);
    setUser(null);
    localStorage.removeItem('senagri_role');
    localStorage.removeItem('senagri_cart'); // Clear cart too on logout
    localStorage.removeItem('sb-guhhfjtbybhjolnnwijy-auth-token'); // Clear supabase token manually if needed
    
    console.log('UserContext: Local state and storage cleared');

    // 2. Then try to sign out from Supabase in the background
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
        console.log('UserContext: Supabase signout complete');
      }
    } catch (err) {
      console.error('UserContext: Supabase signout error (ignored):', err);
    }
  };

  return (
    <UserContext.Provider value={{ user, role, loading, setRole: handleSetRole, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};
