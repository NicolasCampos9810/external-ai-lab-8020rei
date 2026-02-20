export default function WeeklyLoading() {
  return (
    <div className="max-w-6xl animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-200 rounded mt-2" />
        </div>
      </div>

      {/* Week selector skeleton */}
      <div className="mb-6">
        <div className="h-10 w-64 bg-gray-200 rounded" />
      </div>

      {/* Material cards skeleton */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                  <div className="h-6 w-24 bg-gray-200 rounded" />
                </div>
                <div className="h-6 w-3/4 bg-gray-200 rounded mb-2" />
                <div className="h-4 w-full bg-gray-200 rounded mb-2" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
              </div>
              <div className="w-14 h-14 bg-gray-200 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
