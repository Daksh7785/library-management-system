import { supabase } from '../lib/supabase';

/**
 * PRODUCTION-GRADE AUTHENTICATION SERVICE
 * Implements real-world authentication flows using Supabase Auth
 */

export const authService = {
  /**
   * SIGNUP (EMAIL)
   * Creates a new user and sends a verification email.
   */
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        // Change to your production URL when deploying
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) throw error;
    
    return data;
  },

  /**
   * LOGIN (EMAIL)
   * Authenticates user and establishes secure session.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * GOOGLE LOGIN
   * Triggers Google OAuth account picker.
   */
  async signInWithProvider(provider: 'google' | 'apple') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });

    if (error) throw error;
    return data;
  },

  /**
  async signInWithDemo(role: string = 'admin') {
    const email = `${role}@demo.academic.com`;
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: 'bypass-password'
    });
    if (error) throw error;
    return {
      id: data.user.id,
      name: data.user.user_metadata.name || `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: data.user.email,
      role: role,
    };
  },

  /**
   * LOGOUT
   * Clears the current session.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * FORGOT PASSWORD
   * Sends a password reset link to the user's email.
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  },

  /**
   * UPDATE PASSWORD
   * Updates the user's password (used after clicking reset link).
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw error;
  },

  /**
   * GET CURRENT SESSION
   * Returns the active session if one exists.
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * GET CURRENT USER
   * Returns the active user if one exists.
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * ON AUTH STATE CHANGE
   * Listen to login/logout/token refresh events.
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
