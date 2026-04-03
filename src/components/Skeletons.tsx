export function ProductCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border/60">
      <div className="aspect-square shimmer" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 shimmer rounded" />
        <div className="h-4 shimmer rounded" />
        <div className="h-3 w-20 shimmer rounded" />
        <div className="flex justify-between items-center">
          <div className="h-4 w-16 shimmer rounded" />
          <div className="w-7 h-7 shimmer rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return <div className="w-full h-48 shimmer rounded-2xl" />;
}

export function CategorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="w-14 h-14 shimmer rounded-2xl" />
      <div className="h-3 w-14 shimmer rounded" />
    </div>
  );
}
