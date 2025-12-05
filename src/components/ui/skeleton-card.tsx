import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const SkeletonCard = () => {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full skeleton-shimmer" />
          <div className="space-y-2 flex-1">
            <div className="h-4 w-3/4 rounded skeleton-shimmer" />
            <div className="h-3 w-1/2 rounded skeleton-shimmer" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-3 w-full rounded skeleton-shimmer" />
        <div className="h-3 w-5/6 rounded skeleton-shimmer" />
        <div className="h-3 w-4/6 rounded skeleton-shimmer" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 rounded-full skeleton-shimmer" />
          <div className="h-6 w-20 rounded-full skeleton-shimmer" />
        </div>
        <div className="h-10 w-full rounded-lg skeleton-shimmer mt-4" />
      </CardContent>
    </Card>
  );
};

export const SkeletonStatCard = () => {
  return (
    <Card className="animate-pulse">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="h-3 w-24 rounded skeleton-shimmer" />
            <div className="h-8 w-20 rounded skeleton-shimmer" />
            <div className="h-3 w-32 rounded skeleton-shimmer" />
          </div>
          <div className="h-8 w-8 rounded skeleton-shimmer" />
        </div>
      </CardContent>
    </Card>
  );
};
