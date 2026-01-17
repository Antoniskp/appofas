import { Article, ArticleVisibility, CreateArticleInput, UpdateArticleInput } from '@/domain/article'
import { supabase } from '@/services/supabase-client'
import { v4 as uuidv4 } from 'uuid'

const ARTICLES_KEY = 'articles'

export class ArticleService {
  async getArticlesForUser(userId: string): Promise<Article[]> {
    const { data, error } = await supabase
      .from(ARTICLES_KEY)
      .select('*')
      .eq('createdBy', userId)
      .order('createdAt', { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []) as Article[]
  }

  async getNewsArticles(): Promise<Article[]> {
    const { data, error } = await supabase
      .from(ARTICLES_KEY)
      .select('*')
      .eq('isNews', true)
      .eq('visibility', ArticleVisibility.PUBLIC)
      .order('publishedAt', { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []) as Article[]
  }

  async createArticle(input: CreateArticleInput, userId: string): Promise<Article> {
    const now = new Date().toISOString()
    const publishAt = input.publishedAt ?? (input.visibility === ArticleVisibility.PUBLIC ? now : null)

    const newArticle: Article = {
      id: this.generateId(),
      ...input,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
      publishedAt: publishAt,
      createdBy: userId
    }

    const { data, error } = await supabase
      .from(ARTICLES_KEY)
      .insert(newArticle)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Article
  }

  async updateArticle(input: UpdateArticleInput): Promise<Article> {
    const updates = Object.fromEntries(
      Object.entries({
        title: input.title,
        subtitle: input.subtitle,
        summary: input.summary,
        content: input.content,
        authorName: input.authorName,
        section: input.section,
        location: input.location,
        tags: input.tags,
        coverImageUrl: input.coverImageUrl,
        visibility: input.visibility,
        isNews: input.isNews,
        publishedAt: input.publishedAt
      }).filter(([, value]) => value !== undefined)
    ) as Partial<Article>

    updates.updatedAt = new Date().toISOString()

    const { data, error } = await supabase
      .from(ARTICLES_KEY)
      .update(updates)
      .eq('id', input.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Article
  }

  async deleteArticle(id: string): Promise<void> {
    const { error } = await supabase
      .from(ARTICLES_KEY)
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  }

  private generateId(): string {
    return uuidv4()
  }
}

export const articleService = new ArticleService()
