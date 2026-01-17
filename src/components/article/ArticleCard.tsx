import { Article, ArticleVisibility } from '@/domain/article'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { DotsThree, Pencil, Trash, Newspaper } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface ArticleCardProps {
  article: Article
  onEdit?: (article: Article) => void
  onDelete?: (id: string) => void
}

const VISIBILITY_LABELS: Record<ArticleVisibility, string> = {
  [ArticleVisibility.PUBLIC]: 'Public',
  [ArticleVisibility.PRIVATE]: 'Private'
}

const VISIBILITY_STYLES: Record<ArticleVisibility, string> = {
  [ArticleVisibility.PUBLIC]: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  [ArticleVisibility.PRIVATE]: 'bg-slate-100 text-slate-700 border-slate-200'
}

export function ArticleCard({ article, onEdit, onDelete }: ArticleCardProps) {
  const hasActions = Boolean(onEdit || onDelete)
  const publishedAt = article.publishedAt || article.createdAt

  return (
    <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-200 border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={VISIBILITY_STYLES[article.visibility]}>
              {VISIBILITY_LABELS[article.visibility]}
            </Badge>
            {article.isNews && (
              <Badge className="bg-amber-100 text-amber-800">
                <Newspaper className="mr-1 h-3 w-3" />
                News
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {article.section || 'General'}
            </Badge>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-foreground">{article.title}</h3>
            {article.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">{article.subtitle}</p>
            )}
          </div>

          {article.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span>By {article.authorName || 'Staff'}</span>
            {article.location && <span>{article.location}</span>}
            <span>{format(new Date(publishedAt), 'MMM d, yyyy')}</span>
          </div>
        </div>

        {hasActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <DotsThree className="h-4 w-4" weight="bold" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(article)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(article.id)} className="text-destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {article.coverImageUrl && (
        <div className="overflow-hidden rounded-lg border border-border">
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="h-48 w-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {article.content && (
        <p className="text-sm text-muted-foreground line-clamp-3">{article.content}</p>
      )}

      {article.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
