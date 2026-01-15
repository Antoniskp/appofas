import { User, TeamMember } from '@/domain/user'

export class AuthService {
  async getCurrentUser(): Promise<User | null> {
    try {
      const userInfo = await window.spark.user()
      if (!userInfo) return null
      
      return {
        id: String(userInfo.id),
        login: userInfo.login,
        email: userInfo.email,
        avatarUrl: userInfo.avatarUrl,
        isOwner: userInfo.isOwner
      }
    } catch (error) {
      return null
    }
  }

  async getTeamMembers(): Promise<TeamMember[]> {
    const members = await window.spark.kv.get<TeamMember[]>('team-members')
    return members || []
  }

  async addTeamMember(member: Omit<TeamMember, 'id'>): Promise<TeamMember> {
    const members = await this.getTeamMembers()
    const newMember: TeamMember = {
      id: `member_${Date.now()}`,
      ...member
    }
    members.push(newMember)
    await window.spark.kv.set('team-members', members)
    return newMember
  }
}

export const authService = new AuthService()
