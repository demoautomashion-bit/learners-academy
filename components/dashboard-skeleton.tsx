import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full md:w-64 rounded-md" />
          <Skeleton className="h-5 w-full md:w-96 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-none shadow-sm ring-1 ring-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
              <Skeleton className="h-4 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-2">
              <Skeleton className="h-8 w-16 rounded" />
              <Skeleton className="h-3 w-32 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Areas Skeleton */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-xl border border-primary/5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-40 rounded" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-full rounded" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm ring-1 ring-border">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48 rounded" />
              <Skeleton className="h-4 w-64 rounded" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>
                  <Skeleton className="h-2 w-full rounded" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function AssessmentSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48 rounded-md" />
          <Skeleton className="h-5 w-64 rounded-md" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
      <div className="grid gap-6">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-none shadow-sm ring-1 ring-border bg-card">
              <CardHeader className="pb-3 space-y-2">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-40 rounded" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <Skeleton className="h-12 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
