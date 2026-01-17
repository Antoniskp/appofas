export enum ArticleVisibility {
  PUBLIC = 'public',
  PRIVATE = 'private'
}

export interface Article {
  id: string
  title: string
  subtitle: string
  summary: string
  content: string
  authorName: string
  section: string
  location: string
  tags: string[]
  coverImageUrl?: string
  visibility: ArticleVisibility
  isNews: boolean
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  createdBy: string
}

export interface CreateArticleInput {
  title: string
  subtitle: string
  summary: string
  content: string
  authorName: string
  section: string
  location: string
  tags: string[]
  coverImageUrl?: string
  visibility: ArticleVisibility
  isNews: boolean
  publishedAt?: string | null
}

export interface UpdateArticleInput extends Partial<CreateArticleInput> {
  id: string
}
