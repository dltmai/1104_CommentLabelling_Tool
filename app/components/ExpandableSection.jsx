"use client";

export default function ExpandableSection({
  title,
  children,
  isExpanded,
  onToggle,
}) {
  return (
    <div className="mb-6">
      <div
        className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        onClick={onToggle}
      >
        <span className="font-semibold text-gray-800 dark:text-white">
          {title}
        </span>
        <span className="text-gray-600 dark:text-gray-300 text-xl">
          {isExpanded ? "▼" : "▶"}
        </span>
      </div>
      {/* Render children only when expanded so content isn't clipped by max-height */}
      {isExpanded && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
          {children}
        </div>
      )}
    </div>
  );
}
