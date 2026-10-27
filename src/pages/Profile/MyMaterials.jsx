import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { 
  FaBook, 
  FaFolder, 
  FaFolderOpen,
  FaSearch, 
  FaChevronRight, 
  FaExclamationTriangle,
  FaArrowLeft
} from "react-icons/fa";

// Modular Subcomponents
import MaterialImageModal from "../../components/Profile/materials/MaterialImageModal";
import MaterialsLevelView from "../../components/Profile/materials/MaterialsLevelView";

export default function MyMaterials({ user, setActiveTab, setForceEdit }) {
  const { t, i18n } = useTranslation();
  const { getMyMaterials } = useApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  
  // Navigation States: 'subjects' (Level 1), 'folders' (Level 2), 'materials' (Level 3)
  const [level, setLevel] = useState("subjects"); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const isUa = i18n.language === "ua";

  // Check if required info (year and specialization) is complete
  const hasRequiredInfo =
    user?.college_year &&
    user.college_year.trim() !== "" &&
    (user?.specialization?.id || user?.specialization_id);

  useEffect(() => {
    if (!hasRequiredInfo) {
      setLoading(false);
      return;
    }

    const fetchMaterials = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getMyMaterials();
        if (res && res.success) {
          setSubjects(res.data || []);
        } else {
          setError(res?.message || "Failed to fetch materials.");
        }
      } catch (err) {
        console.error("Failed to load profile materials:", err);
        setError("Network error occurred while loading materials.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [hasRequiredInfo, getMyMaterials]);

  // Multilingual translations
  const texts = {
    title: t("profile.materials.title", isUa ? "Мої навчальні матеріали" : "My Study Materials"),
    subtitle: t(
      "profile.materials.subtitle",
      isUa
        ? "Переглядайте всі навчальні матеріали для вашого курсу."
        : "Browse all study materials customized for your academic year."
    ),
    warningTitle: t(
      "profile.materials.warningTitle",
      isUa ? "Потрібен академічний рік та спеціалізація" : "Academic Year and Specialization Required"
    ),
    warningDesc: t(
      "profile.materials.warningDesc",
      isUa
        ? "Щоб переглянути навчальні матеріали, спочатку вкажіть ваш академічний рік та спеціалізацію у профілі."
        : "To view your customized study materials, please set your academic year and specialization in your profile first."
    ),
    completeButton: t("profile.materials.completeButton", isUa ? "Оновити профіль зараз" : "Update Profile Now"),
    searchPlaceholder: t(
      "profile.materials.searchPlaceholder",
      isUa ? "Пошук предметів або папок..." : "Search subjects or folders..."
    ),
    emptyMaterials: t(
      "profile.materials.emptyMaterials",
      isUa ? "Немає доступних матеріалів у цьому розділі." : "No materials available in this section."
    ),
    viewMaterial: t("profile.materials.viewMaterial", isUa ? "Переглянути матеріал" : "View Material"),
    foldersCount: t("profile.materials.foldersCount", isUa ? "папок" : "folders"),
    filesCount: t("profile.materials.filesCount", isUa ? "файлів" : "files"),
    breadcrumbRoot: t("profile.materials.breadcrumbRoot", isUa ? "Навчальні матеріали" : "Study Materials"),
    goBack: t("profile.materials.goBack", isUa ? "Назад" : "Back"),
  };

  const handleSubjectSelect = (sub) => {
    setSelectedSubject(sub);
    setLevel("folders");
    setSearchQuery("");
  };

  const handleFolderSelect = (folder) => {
    setSelectedFolder(folder);
    setLevel("materials");
    setSearchQuery("");
  };

  const resetToSubjects = () => {
    setLevel("subjects");
    setSelectedSubject(null);
    setSelectedFolder(null);
    setSearchQuery("");
  };

  const resetToFolders = () => {
    setLevel("folders");
    setSelectedFolder(null);
    setSearchQuery("");
  };

  // Warning screen if required information is missing
  if (!hasRequiredInfo) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-surface rounded-3xl border border-border shadow-sm max-w-2xl mx-auto my-12 animate-fadeIn">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl mb-4">
          <FaExclamationTriangle />
        </div>
        <h3 className="text-xl font-bold text-text mb-2">{texts.warningTitle}</h3>
        <p className="text-text-muted text-sm leading-relaxed mb-6">{texts.warningDesc}</p>
        <button
          onClick={() => {
            if (setForceEdit) setForceEdit(true);
            if (setActiveTab) setActiveTab("profile");
          }}
          className="px-6 py-3 bg-primary hover:bg-secondary text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
        >
          {texts.completeButton}
        </button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-text-muted">{t("common.loading", "Loading...")}</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-8 text-center bg-red-500/10 border border-red-500/20 rounded-3xl my-6">
        <p className="text-red-600 dark:text-red-400 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  // Current items calculation
  let currentItems = [];
  if (level === "subjects") {
    currentItems = subjects;
  } else if (level === "folders") {
    currentItems = selectedSubject?.files || [];
  } else if (level === "materials") {
    currentItems = selectedFolder?.contents || [];
  }

  // Filter items by search
  const filteredItems = currentItems.filter((item) => {
    if (!searchQuery.trim()) return true;
    const nameMatch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || descMatch;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h2 className="text-2xl font-black text-text flex items-center gap-2">
            {texts.title}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {user.college_year}
            </span>
          </h2>
          <p className="text-sm text-text-muted mt-1">{texts.subtitle}</p>
        </div>

        {level !== "subjects" && (
          <button 
            onClick={level === "materials" ? resetToFolders : resetToSubjects}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-text bg-accent/40 rounded-xl hover:bg-accent border border-border/20 transition-all active:scale-95 self-start md:self-auto"
          >
            <FaArrowLeft />
            {texts.goBack}
          </button>
        )}
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-text-muted bg-surface/50 border border-border/50 p-3 rounded-2xl">
        <span 
          onClick={resetToSubjects}
          className={`cursor-pointer hover:text-primary transition-colors flex items-center gap-1 ${
            level === "subjects" ? "text-primary font-bold" : ""
          }`}
        >
          <FaBook className="text-xs" />
          {texts.breadcrumbRoot}
        </span>

        {selectedSubject && (
          <>
            <FaChevronRight className="text-[9px] mx-1 shrink-0" />
            <span 
              onClick={resetToFolders}
              className={`cursor-pointer hover:text-primary transition-colors flex items-center gap-1 ${
                level === "folders" ? "text-primary font-bold" : ""
              }`}
            >
              <FaFolder className="text-xs text-yellow-500" />
              {selectedSubject.name}
            </span>
          </>
        )}

        {selectedFolder && (
          <>
            <FaChevronRight className="text-[9px] mx-1 shrink-0" />
            <span className="text-primary font-bold flex items-center gap-1 max-w-[150px] truncate">
              <FaFolderOpen className="text-xs text-yellow-500 shrink-0" />
              {selectedFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Search Input */}
      {currentItems.length > 0 && (
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-xs" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={texts.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-surface/80 border border-border rounded-2xl text-xs text-text placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Materials / Folders / Subjects View */}
      <MaterialsLevelView
        level={level}
        filteredItems={filteredItems}
        texts={texts}
        isUa={isUa}
        handleSubjectSelect={handleSubjectSelect}
        handleFolderSelect={handleFolderSelect}
        setSelectedImage={setSelectedImage}
      />

      {/* Image Zoom Modal */}
      <MaterialImageModal
        selectedImage={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
