import React from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

/**
 * Reusable Pagination Component
 * Props:
 *   currentPage  - current active page (number)
 *   totalPages   - total number of pages (number)
 *   onPageChange - callback(page) called when user clicks a page
 *   loading      - bool, disables buttons when loading
 *   className    - optional extra class on the wrapper
 */
export default function Pagination({ currentPage, totalPages, onPageChange, loading = false, className = "" }) {
  if (!totalPages || totalPages <= 1) return null;

  // Build page numbers array with ellipsis
  const getPages = () => {
    const pages = [];
    const delta = 2;
    const left = currentPage - delta;
    const right = currentPage + delta;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i <= right)) {
        pages.push(i);
      }
    }

    const withEllipsis = [];
    let prev = null;
    for (const p of pages) {
      if (prev !== null && p - prev > 1) {
        withEllipsis.push("...");
      }
      withEllipsis.push(p);
      prev = p;
    }
    return withEllipsis;
  };

  const pages = getPages();

  const btnBase =
    "flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 select-none";
  const activeBtn = "bg-primary text-white shadow-md";
  const inactiveBtn =
    "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary dark:hover:text-primary";
  const disabledBtn = "opacity-40 cursor-not-allowed";

  return (
    <div className={`flex items-center justify-center gap-1 mt-8 flex-wrap ${className}`}>
      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={loading || currentPage === 1}
        className={`${btnBase} ${inactiveBtn} ${currentPage === 1 || loading ? disabledBtn : ""}`}
        aria-label="Previous page"
      >
        <FiChevronLeft className="w-5 h-5" />
      </button>

      {/* Pages */}
      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`ellipsis-${idx}`} className="flex items-center justify-center w-9 h-9 text-sm text-gray-400 select-none">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            disabled={loading || p === currentPage}
            className={`${btnBase} ${p === currentPage ? activeBtn : inactiveBtn} ${loading ? disabledBtn : ""}`}
            aria-label={`Page ${p}`}
            aria-current={p === currentPage ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={loading || currentPage === totalPages}
        className={`${btnBase} ${inactiveBtn} ${currentPage === totalPages || loading ? disabledBtn : ""}`}
        aria-label="Next page"
      >
        <FiChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
