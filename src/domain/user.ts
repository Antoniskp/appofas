export interface User {
  id: string
  login: string
  email: string
  avatarUrl: string
  isOwner: boolean
}

export interface TeamMember {
  id: string
  name: string
  avatar: string
  role: 'owner' | 'admin' | 'member'
}
