export type UserRole = 'owner' | 'editor' | 'member'

export interface User {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
  role: UserRole
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: UserRole | 'admin'
}
