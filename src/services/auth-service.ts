import { User, TeamMember } from '@/domain/user'
import { supabase } from '@/services/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const mapSupabaseUser = (user: SupabaseUser | null): User | null => {
  if (!user) return null

  const metadata = user.user_metadata ?? {}
  const login = metadata.user_name
    || metadata.preferred_username
    || metadata.name
    || metadata.full_name
    || user.email?.split('@')[0]
    || 'user'

  return {
    id: user.id,
    login,
    email: user.email ?? '',
    avatarUrl: metadata.avatar_url || metadata.avatarUrl || '',
    isOwner: metadata.role === 'owner'
  }
}

export class AuthService {
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
    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `member_${Date.now()}`

    const newMember: TeamMember = {
      id,
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
        redirectTo: window.location.origin
      }
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
