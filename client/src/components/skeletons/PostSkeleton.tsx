/**
 * Skeleton loading component for PostCard
 */

export function PostSkeleton() {
  return (
    <div className="bg-card rounded-2xl p-6 space-y-4 border border-border/50 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 bg-muted rounded-full" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-24" />
          <div className="h-3 bg-muted rounded w-16" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded w-full" />
          <div className="h-4 bg-muted rounded w-2/3" />
        </div>
      </div>

      {/* Media */}
      <div className="aspect-video bg-muted rounded-xl" />

      {/* Actions */}
      <div className="flex items-center gap-6 pt-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-8" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-8" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-muted rounded" />
          <div className="h-4 bg-muted rounded w-8" />
        </div>
      </div>
    </div>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <PostSkeleton key={index} />
      ))}
    </div>
  );
}