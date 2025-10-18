"use client";

export default function NavigationControls({
  currentIndex,
  totalRows,
  onPrevious,
  onNext,
}) {
  return (
    <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-b-xl">
      <button
        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        onClick={onPrevious}
        disabled={currentIndex === 0}
      >
        <span>←</span>
        Previous
      </button>

      <div className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
        <span className="text-lg font-bold text-gray-800 dark:text-white">
          {currentIndex + 1} / {totalRows}
        </span>
      </div>

      <button
        className="px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
        onClick={onNext}
        disabled={currentIndex === totalRows - 1}
      >
        Next
        <span>→</span>
      </button>
    </div>
  );
}
