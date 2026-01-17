import { User, TeamMember } from '@/domain/user'
import { supabase } from '@/services/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

/**
 * Map Supabase user metadata to the app user model.
 * Login falls back in priority order: user_name → preferred_username → name → full_name → email prefix.
 */
const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
  if (!user) return null

  const metadata = user.user_metadata ?? {}
  const loginCandidates = [
    metadata.user_name,
    metadata.preferred_username,
    metadata.name,
    metadata.full_name,
    user.email?.split('@')[0]
  ]
  const login = loginCandidates.find((value) => typeof value === 'string' && value.length > 0) || 'user'

  return {
    id: user.id,
    login,
    email: user.email ?? '',
    avatarUrl: metadata.avatar_url || metadata.avatarUrl || '',
    isOwner: metadata.role === 'owner'
  }
}

export class AuthService {
  /**
   * Build a same-origin redirect URL for OAuth flows, preserving the current route.
   * Falls back to the app base path if the current path is outside the configured base.
   */
  private getRedirectTarget() {
    const { pathname, search, hash, origin } = window.location
    const basePath = import.meta.env.BASE_URL ?? '/'
    let normalizedBase = basePath
    if (normalizedBase !== '/' && normalizedBase.endsWith('/')) {
      normalizedBase = normalizedBase.slice(0, -1)
    }
    const normalizedPath = pathname.startsWith('/') ? pathname : '/'
    const safePath = normalizedPath.startsWith(normalizedBase) ? normalizedPath : normalizedBase
    return `${origin}${safePath}${search}${hash}`
  }
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) {
        return null
      }

      return mapSupabaseUser(data.user)
    } catch (error) {
      return null
    }
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name')

    if (error) {
      throw error
    }

    return (data ?? []) as TeamMember[]
  }

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const newMember: TeamMember = {
      id: uuidv4(),
      ...member
    }

    const { data, error } = await supabase
      .from('team_members')
      .insert(newMember)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as TeamMember
  }

  async signInWithGitHub(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: this.getRedirectTarget()
      }
    })

    if (error) {
      throw error
    }
  }

  async signUpWithEmail(email: string, password: string, fullName: string): Promise<void> {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          // Store both 'name' and 'full_name' for compatibility with mapSupabaseUser
          // which checks both fields when determining the user's login display name
          full_name: fullName,
          name: fullName
        }
      }
    })

    if (error) {
      throw error
    }
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      throw error
    }
  }

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
  }

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(mapSupabaseUser(session?.user ?? null))
    })
  }
}

export const authService = new AuthService()
