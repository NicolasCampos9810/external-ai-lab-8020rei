export default function MaterialDetailLoading() {
  return (
    <div className="max-w-4xl animate-pulse">
      {/* Back link skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Material info skeleton */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex gap-2 mb-3">
              <div className="h-6 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-24 bg-gray-200 rounded" />
            </div>
            <div className="h-8 w-3/4 bg-gray-200 rounded mb-3" />
            <div className="h-4 w-full bg-gray-200 rounded mb-2" />
            <div className="h-4 w-2/3 bg-gray-200 rounded mb-4" />
            <div className="h-16 bg-gray-100 rounded-lg" />
          </div>

          {/* Reviews skeleton */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="pb-4 border-b border-border">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                      <div className="h-3 w-48 bg-gray-200 rounded mb-3" />
                      <div className="h-4 w-full bg-gray-200 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Score summary skeleton */}
          <div className="bg-card rounded-xl border border-border p-6 text-center">
            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-2xl mb-3" />
            <div className="h-4 w-24 mx-auto bg-gray-200 rounded mb-4" />
            <div className="flex justify-center gap-6">
              <div className="h-12 w-12 bg-gray-200 rounded" />
              <div className="h-12 w-12 bg-gray-200 rounded" />
              <div className="h-12 w-12 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Vote widget skeleton */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
            <div className="space-y-4">
              <div className="h-8 w-full bg-gray-200 rounded" />
              <div className="h-8 w-full bg-gray-200 rounded" />
              <div className="h-20 w-full bg-gray-200 rounded" />
              <div className="h-10 w-full bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
