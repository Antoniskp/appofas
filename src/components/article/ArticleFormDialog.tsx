import { useEffect, useMemo, useState } from 'react'
import { Article, ArticleVisibility, CreateArticleInput } from '@/domain/article'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface ArticleFormDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CreateArticleInput) => void
  article?: Article | null
  canTagNews?: boolean
  defaultAuthor?: string
}

const parseTags = (value: string): string[] =>
  value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

const toDateTimeInput = (value?: string | null) => {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 16)
}

export function ArticleFormDialog({
  open,
  onClose,
  onSubmit,
  article,
  canTagNews = false,
  defaultAuthor = ''
}: ArticleFormDialogProps) {
  const initialAuthor = useMemo(() => article?.authorName || defaultAuthor, [article, defaultAuthor])
  const [formData, setFormData] = useState<CreateArticleInput>({
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    authorName: initialAuthor,
    section: '',
    location: '',
    tags: [],
    coverImageUrl: '',
    visibility: ArticleVisibility.PRIVATE,
    isNews: false,
    publishedAt: undefined
  })
  const [tagsInput, setTagsInput] = useState('')

  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        subtitle: article.subtitle,
        summary: article.summary,
        content: article.content,
        authorName: article.authorName,
        section: article.section,
        location: article.location,
        tags: article.tags,
        coverImageUrl: article.coverImageUrl ?? '',
        visibility: article.visibility,
        isNews: article.isNews,
        publishedAt: article.publishedAt ?? undefined
      })
      setTagsInput(article.tags.join(', '))
    } else {
      setFormData({
        title: '',
        subtitle: '',
        summary: '',
        content: '',
        authorName: initialAuthor,
        section: '',
        location: '',
        tags: [],
        coverImageUrl: '',
        visibility: ArticleVisibility.PRIVATE,
        isNews: false,
        publishedAt: undefined
      })
      setTagsInput('')
    }
  }, [article, initialAuthor, open])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    const normalizedTags = parseTags(tagsInput)

    onSubmit({
      ...formData,
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      summary: formData.summary.trim(),
      content: formData.content.trim(),
      authorName: formData.authorName.trim(),
      section: formData.section.trim(),
      location: formData.location.trim(),
      coverImageUrl: formData.coverImageUrl?.trim() || undefined,
      tags: normalizedTags,
      visibility: formData.isNews ? ArticleVisibility.PUBLIC : formData.visibility
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[720px] overflow-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {article ? 'Edit Article' : 'Create New Article'}
          </DialogTitle>
          <DialogDescription>
            {article
              ? 'Update the article details and keep your newsroom up to date.'
              : 'Publish a story with professional newsroom fields and visibility controls.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Headline *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
              placeholder="Enter the main headline"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subheadline</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(event) => setFormData({ ...formData, subtitle: event.target.value })}
              placeholder="Add a supporting headline"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Lead Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(event) => setFormData({ ...formData, summary: event.target.value })}
              placeholder="Summarize the story in a few sentences"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Article Body</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(event) => setFormData({ ...formData, content: event.target.value })}
              placeholder="Write the full article content"
              rows={8}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="authorName">Byline</Label>
              <Input
                id="authorName"
                value={formData.authorName}
                onChange={(event) => setFormData({ ...formData, authorName: event.target.value })}
                placeholder="Reporter name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input
                id="section"
                value={formData.section}
                onChange={(event) => setFormData({ ...formData, section: event.target.value })}
                placeholder="Politics, Culture, Sports"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Dateline</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Keywords</Label>
              <Input
                id="tags"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="Comma-separated tags"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverImageUrl">Cover Image URL</Label>
            <Input
              id="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={(event) => setFormData({ ...formData, coverImageUrl: event.target.value })}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibility</Label>
              <Select
                value={formData.visibility}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    visibility: value as ArticleVisibility,
                    isNews: formData.isNews && value === ArticleVisibility.PUBLIC
                  })
                }
              >
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ArticleVisibility.PUBLIC}>Public</SelectItem>
                  <SelectItem value={ArticleVisibility.PRIVATE} disabled={formData.isNews}>
                    Private
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="publishedAt">Publish Date</Label>
              <Input
                id="publishedAt"
                type="datetime-local"
                value={toDateTimeInput(formData.publishedAt)}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    publishedAt: event.target.value ? new Date(event.target.value).toISOString() : undefined
                  })
                }
              />
            </div>
          </div>

          {canTagNews && (
            <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Tag as news</p>
                <p className="text-xs text-muted-foreground">
                  Editor-only articles tagged as news are visible in the public news section.
                </p>
              </div>
              <Switch
                checked={formData.isNews}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isNews: checked,
                    visibility: checked ? ArticleVisibility.PUBLIC : formData.visibility
                  })
                }
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              {article ? 'Update Article' : 'Publish Article'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
