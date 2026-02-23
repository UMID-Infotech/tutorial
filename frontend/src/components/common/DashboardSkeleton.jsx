//src/components/common/DashboardSkeleton.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-gray-400" />
        <Skeleton className="h-9 w-32 bg-gray-400" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="border-none shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-4 w-24 bg-gray-400" />
              <Skeleton className="h-8 w-16 bg-gray-400" />
              <Skeleton className="h-3 w-32 bg-gray-400" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table Skeleton */}
      <Card className="border-none shadow-2xl">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-40 bg-gray-400" />

          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 bg-gray-400" />
              <Skeleton className="h-4 w-24 bg-gray-400" />
              <Skeleton className="h-8 w-20 bg-gray-400" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
