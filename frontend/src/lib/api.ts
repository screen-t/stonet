import { supabase } from './supabase'

export const authApi = {
  me: async (accessToken?: string) => {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error) {
      throw new Error(error.message)
    }
    if (!user) {
      throw new Error('User not found')
    }
    return {
      id: user.id,
      email: user.email || '',
      ...user.user_metadata
    }
  },
  refresh: async (data: { refresh_token: string }) => {
    const { data: authData, error } = await supabase.auth.refreshSession({
      refresh_token: data.refresh_token
    })
    if (error) {
      throw new Error(error.message)
    }
    return {
      session: authData.session,
      user: authData.user
    }
  },
  login: async (data: { email: string; password: string }) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return {
      user: authData.user,
      session: authData.session
    }
  },
  signup: async (data: any) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim(),
          first_name: data.first_name,
          last_name: data.last_name,
          username: data.username
        }
      }
    })
    
    if (error) {
      throw new Error(error.message)
    }
    
    return {
      user: authData.user,
      session: authData.session
    }
  },
  logout: async (data?: { refresh_token?: string }) => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
    return { success: true }
  },
  googleOAuth: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw new Error(error.message)
    return data
  },
  githubOAuth: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw new Error(error.message)
    return data
  },
  linkedinOAuth: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'linkedin',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) throw new Error(error.message)
    return data
  },
  checkUsername: async (username: string) => {
    // Query the profiles table to check if username exists
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is good
      throw new Error('Failed to check username availability')
    }
    
    // If data exists, username is taken. If no data, username is available
    return { 
      available: !data,
      username: username
    }
  },
  forgotPassword: async (data: { email: string }) => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) {
      throw new Error(error.message)
    }
    return { success: true, message: 'Password reset email sent' }
  },
  resetPassword: async (data: { access_token: string; new_password: string }) => {
    const { error } = await supabase.auth.updateUser({
      password: data.new_password
    })
    if (error) {
      throw new Error(error.message)
    }
    return { success: true, message: 'Password updated successfully' }
  },
}
