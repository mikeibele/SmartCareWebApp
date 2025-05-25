// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Doctor } from '../lib/supabase';
import { getDoctorProfile } from '../lib/auth';

type User = {
  id: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  doctorProfile: Doctor | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: DoctorInputData) => Promise<void>;
  signOut: () => Promise<void>;
};

type DoctorInputData = {
  full_name: string;
  specialty: string;
  license_number: string;
  phone: string;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the current session and user on initial load
  useEffect(() => {
    async function getInitialSession() {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const u = data.session.user;
          setUser({ id: u.id, email: u.email || '' });

          const doctorData = await getDoctorProfile(u.id);
          setDoctorProfile(doctorData);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        setLoading(false);
      }
    }

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const u = session.user;
          setUser({ id: u.id, email: u.email || '' });

          const doctorData = await getDoctorProfile(u.id);
          setDoctorProfile(doctorData);
        } else {
          setUser(null);
          setDoctorProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign In with Supabase Auth
  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const u = data.user;
      if (u) {
        setUser({ id: u.id, email: u.email || '' });

        const doctorData = await getDoctorProfile(u.id);
        setDoctorProfile(doctorData);
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Sign Up with Supabase Auth and insert into doctors table
  async function signUp(email: string, password: string, userData: DoctorInputData) {
    try {
      setLoading(true);

      // Step 1: Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
          },
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User registration failed.');

      const newUser = authData.user;

      // Step 2: Insert into doctors table
      const { error: insertError } = await supabase.from('doctors').insert([
        {
          user_id: newUser.id,
          full_name: userData.full_name,
          email,
          specialty: userData.specialty,
          license_number: userData.license_number,
          phone: userData.phone,
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error('Error inserting into doctors table:', insertError);
        throw new Error('Failed to save doctor data. Please contact support.');
      }

      // Step 3 (Optional): Set local state (could defer to auth state change listener)
      setUser({ id: newUser.id, email: newUser.email || '' });
      const doctorData = await getDoctorProfile(newUser.id);
      setDoctorProfile(doctorData);

    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  // Sign Out
  async function signOut() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setDoctorProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    doctorProfile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
