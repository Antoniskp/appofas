import { Article } from '@/domain/article'
import { ArticleCard } from './ArticleCard'

interface ArticleListProps {
  articles: Article[]
  onEdit?: (article: Article) => void
  onDelete?: (id: string) => void
  emptyTitle?: string
  emptyDescription?: string
}

export function ArticleList({
  articles,
  onEdit,
  onDelete,
  emptyTitle = 'No articles found',
  emptyDescription = 'Create your first article to get started'
}: ArticleListProps) {
  if (articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground mb-2">{emptyTitle}</p>
        <p className="text-sm text-muted-foreground">{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
