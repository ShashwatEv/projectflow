export default function TaskSkeleton() {
  return (
    <div className="space-y-2.5 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((key) => (
        <div
          key={key}
          className="bg-white dark:bg-[#161b22] border border-gray-200/80 dark:border-gray-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-xs"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="h-3.5 bg-gray-200 dark:bg-gray-700/60 rounded-md w-3/5" />
              <div className="h-2.5 bg-gray-100 dark:bg-gray-800/80 rounded-md w-2/5" />
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-12 h-5 rounded-full bg-gray-100 dark:bg-gray-800" />
            <div className="w-16 h-6 rounded-lg bg-gray-100 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}