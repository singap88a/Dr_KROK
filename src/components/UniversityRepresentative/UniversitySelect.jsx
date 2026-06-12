import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaBuilding, FaSearch, FaChevronDown, FaTimes } from "react-icons/fa";

export default function UniversitySelect({
  t,
  request,
  selectedId,
  onChange,
  initialUniversityName
}) {
  const [universities, setUniversities] = useState([]);
  const [uniPage, setUniPage] = useState(1);
  const [uniTotalPages, setUniTotalPages] = useState(1);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
  const uniDropdownRef = useRef(null);

  // Fetch universities
  const fetchUniversities = useCallback(async (page = 1, append = false, search = "") => {
    try {
      setUniLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const data = await request(`universities?page=${page}&per_page=15${searchParam}`, { useCache: true });
      if (data && data.success) {
        const newUnis = data.data || [];
        setUniversities(prev => append ? [...prev, ...newUnis] : newUnis);
        if (data.pagination) {
          setUniTotalPages(data.pagination.total_pages || 1);
          setUniPage(data.pagination.current_page || page);
        } else {
          setUniTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setUniLoading(false);
    }
  }, [request]);

  useEffect(() => {
    fetchUniversities(1, false);

    const handleClickOutside = (e) => {
      if (uniDropdownRef.current && !uniDropdownRef.current.contains(e.target)) {
        setUniDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [fetchUniversities]);

  const handleUniversitySearch = (e) => {
    const value = e.target.value;
    setUniSearch(value);
    fetchUniversities(1, false, value);
  };

  // Find label to display
  const getSelectedLabel = () => {
    if (!selectedId) return t("profile.select_university", "Select University");
    const found = universities.find(u => String(u.id) === String(selectedId));
    if (found) return found.name;
    return initialUniversityName || "Selected University";
  };

  return (
    <div className="space-y-1.5">
      <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
        <FaBuilding className="text-text-muted text-xs" />
        {t("universityRepresentative.fields.university", "University")} <span className="text-red-500">*</span>
      </label>
      <div className="relative" ref={uniDropdownRef}>
        <button
          type="button"
          onClick={() => setUniDropdownOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-4 py-2.5 border rounded-xl bg-background border-border text-sm text-left focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
        >
          <span className={selectedId ? "text-text" : "text-text-muted"}>
            {getSelectedLabel()}
          </span>
          <FaChevronDown className={`text-xs text-text-muted transition-transform duration-300 ${uniDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {uniDropdownOpen && (
          <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-xl shadow-2xl max-h-64 flex flex-col overflow-hidden animate-fadeIn">
            <div className="flex items-center gap-2 p-2 border-b border-border bg-background">
              <FaSearch className="text-xs text-text-muted shrink-0 ml-1" />
              <input
                type="text"
                placeholder={t("universityRepresentative.fields.searchUniversity", "Search university...")}
                value={uniSearch}
                onChange={handleUniversitySearch}
                className="w-full px-2 py-1 text-sm bg-transparent focus:outline-none"
              />
              {uniSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setUniSearch("");
                    fetchUniversities(1, false, "");
                  }}
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <FaTimes className="text-xs text-text-secondary" />
                </button>
              )}
            </div>

            <ul className="overflow-y-auto flex-1 divide-y divide-border">
              {universities.length === 0 ? (
                <li className="px-4 py-3 text-xs text-text-muted italic">
                  {uniLoading ? "Loading universities..." : "No universities found."}
                </li>
              ) : (
                universities.map(uni => (
                  <li key={uni.id}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(uni.id);
                        setUniDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition hover:bg-primary/5 ${
                        String(selectedId) === String(uni.id)
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-text-secondary"
                      }`}
                    >
                      {uni.name}
                    </button>
                  </li>
                ))
              )}
            </ul>

            {uniPage < uniTotalPages && (
              <button
                type="button"
                onClick={() => fetchUniversities(uniPage + 1, true, uniSearch)}
                className="w-full text-center py-2 text-xs font-bold bg-background text-primary border-t border-border hover:bg-primary/5 transition shrink-0"
              >
                {uniLoading ? "Loading..." : "Load More Universities"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
