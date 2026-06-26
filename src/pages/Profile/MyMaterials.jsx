import React, { useState, useEffect } from "react";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaBook, 
  FaFolder, 
  FaFolderOpen,
  FaFileAlt, 
  FaSearch, 
  FaChevronRight, 
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaBookReader,
  FaArrowLeft
} from "react-icons/fa";

export default function MyMaterials({ user, setActiveTab, setForceEdit }) {
  const { t, i18n } = useTranslation();
  const { getMyMaterials } = useApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjects, setSubjects] = useState([]);
  
  // Navigation States: 
  // 'subjects' (Level 1), 'folders' (Level 2), 'materials' (Level 3)
  const [level, setLevel] = useState("subjects"); 
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const isUa = i18n.language === "ua";

  // Check if required info (year and specialization) is complete
  const hasRequiredInfo = user?.college_year && user.college_year.trim() !== "" && (user?.specialization?.id || user?.specialization_id);

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
    subtitle: t("profile.materials.subtitle", isUa ? "Переглядайте всі навчальні матеріали для вашого курсу." : "Browse all study materials customized for your academic year."),
    warningTitle: t("profile.materials.warningTitle", isUa ? "Потрібен академічний рік та спеціалізація" : "Academic Year and Specialization Required"),
    warningDesc: t("profile.materials.warningDesc", isUa ? "Щоб переглянути навчальні матеріали, спочатку вкажіть ваш академічний рік та спеціалізацію у профілі." : "To view your customized study materials, please set your academic year and specialization in your profile first."),
    completeButton: t("profile.materials.completeButton", isUa ? "Оновити профіль зараз" : "Update Profile Now"),
    searchPlaceholder: t("profile.materials.searchPlaceholder", isUa ? "Пошук предметів або папок..." : "Search subjects or folders..."),
    subjectCardLabel: t("profile.materials.subjectCardLabel", isUa ? "Папка" : "Folder"),
    emptyMaterials: t("profile.materials.emptyMaterials", isUa ? "Немає доступних матеріалів у цьому розділі." : "No materials available in this section."),
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

  // Warning screen if required info is missing
  if (!hasRequiredInfo) {
    return (
      <div className="pt-10 flex flex-col items-center justify-center min-h-[450px] p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md p-8 border-2 border-dashed border-primary/30 rounded-3xl bg-surface/50 backdrop-blur shadow-xl flex flex-col items-center"
        >
          <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6 shadow-inner animate-pulse">
            <FaExclamationTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-text mb-3">
            {texts.warningTitle}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed mb-8">
            {texts.warningDesc}
          </p>
          <button
            onClick={() => {
              setForceEdit(true);
              setActiveTab("profile");
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-white rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/35 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 cursor-pointer"
          >
            <FaBookReader className="text-lg" />
            {texts.completeButton}
          </button>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-text-secondary">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 p-6 text-center">
        <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-2xl mb-4 border border-red-100 dark:border-red-900/30">
          <FaExclamationTriangle className="w-8 h-8 mx-auto mb-2" />
          <p className="font-semibold">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-secondary transition-all"
        >
          {t("common.retry")}
        </button>
      </div>
    );
  }

  // Filter logic based on level
  const getFilteredItems = () => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) {
      if (level === "subjects") return subjects;
      if (level === "folders") return selectedSubject?.files || [];
      if (level === "materials") return selectedFolder?.contents || [];
    }

    if (level === "subjects") {
      return subjects.filter((s) => s.name?.toLowerCase().includes(q));
    }
    if (level === "folders") {
      return (selectedSubject?.files || []).filter((f) => f.name?.toLowerCase().includes(q));
    }
    if (level === "materials") {
      return (selectedFolder?.contents || []).filter((m) => 
        (m.description || "").toLowerCase().includes(q)
      );
    }
    return [];
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="pt-10 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <h2 className="text-2xl font-black text-text flex items-center gap-2">
            {texts.title}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {user.college_year}
            </span>
          </h2>
          <p className="text-sm text-text-muted mt-1">{texts.subtitle}</p>
        </div>

        {/* Dynamic Back button for quick navigation */}
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
          className={`cursor-pointer hover:text-primary transition-colors flex items-center gap-1 ${level === 'subjects' ? 'text-primary font-bold' : ''}`}
        >
          <FaBook className="text-xs" />
          {texts.breadcrumbRoot}
        </span>

        {selectedSubject && (
          <>
            <FaChevronRight className="text-[9px] mx-1 shrink-0" />
            <span 
              onClick={resetToFolders}
              className={`cursor-pointer hover:text-primary transition-colors flex items-center gap-1 ${level === 'folders' ? 'text-primary font-bold' : ''}`}
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



      {/* Level Transition Animation Layout */}
      <div className="min-h-[250px]">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted bg-surface/30 rounded-3xl border border-dashed border-border/80">
            <FaFileAlt className="w-12 h-12 mb-3 text-primary/30" />
            <p className="font-semibold text-sm">{texts.emptyMaterials}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {level === "subjects" && (
              <motion.div 
                key="subjects"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredItems.map((sub) => (
                  <motion.div
                    key={sub.id}
                    onClick={() => handleSubjectSelect(sub)}
                    whileHover={{ y: -5, boxShadow: "0 15px 30px -10px rgba(var(--primary-rgb), 0.15)" }}
                    className="relative overflow-hidden cursor-pointer p-6 border rounded-3xl bg-surface/90 border-border shadow hover:border-primary/50 transition-all duration-300 group"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-primary/10 text-primary rounded-2xl shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                        <FaBook className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-text group-hover:text-primary transition-colors leading-tight">
                          {sub.name}
                        </h4>
                        <p className="text-xs font-semibold text-text-muted flex items-center gap-1.5 pt-2">
                          <FaFolder className="text-yellow-500" />
                          {sub.files?.length || 0} {texts.foldersCount}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {level === "folders" && (
              <motion.div 
                key="folders"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredItems.map((folder) => (
                  <motion.div
                    key={folder.id}
                    onClick={() => handleFolderSelect(folder)}
                    whileHover={{ y: -5, scale: 1.01 }}
                    className="cursor-pointer p-6 border rounded-3xl bg-surface/90 border-border shadow hover:border-primary/50 hover:shadow-lg transition-all duration-300 group flex justify-between items-center"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-2xl shrink-0 group-hover:bg-yellow-500 group-hover:text-white transition-all duration-300">
                        <FaFolder className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-text group-hover:text-primary transition-colors leading-tight">
                          {folder.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                          <FaFileAlt className="text-primary/70" />
                          {folder.contents?.length || 0} {texts.filesCount}
                        </p>
                      </div>
                    </div>
                    <FaChevronRight className="text-text-muted text-xs group-hover:translate-x-1 transition-transform" />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {level === "materials" && (
              <motion.div 
                key="materials"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                {filteredItems.map((mat) => (
                  <motion.div
                    key={mat.id}
                    whileHover={{ y: -2 }}
                    className="p-6 border rounded-[32px] bg-surface border-border shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Title/Name */}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                        <span className="inline-flex items-center gap-2 font-bold text-lg text-text">
                          <FaBookReader className="w-5 h-5 text-primary" />
                          {mat.name || texts.viewMaterial}
                        </span>
                      </div>

                      {/* Image above description */}
                      {mat.image && (
                        <div 
                          onClick={() => setSelectedImage(mat.image)}
                          className="w-full max-w-lg h-72 rounded-3xl overflow-hidden border border-border shadow-sm bg-white cursor-pointer relative group/img"
                        >
                          <img 
                            src={mat.image}
                            alt={mat.name || "Material Thumbnail"}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                          <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold gap-2">
                            <span>🔍</span>
                            <span>{isUa ? "Натисніть, щоб збільшити" : "Click to zoom"}</span>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <div className="flex-1 min-w-0 space-y-4">
                        <div 
                          className="text-sm text-text-secondary leading-relaxed max-w-full break-words"
                          dangerouslySetInnerHTML={{ __html: mat.description }}
                        />

                        {mat.link && (
                          <div className="pt-4 border-t border-border/40">
                            <a 
                              href={mat.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-primary rounded-2xl hover:bg-secondary hover:shadow-lg transition-all active:scale-[0.97]"
                            >
                              <FaExternalLinkAlt className="text-xs" />
                              {texts.viewMaterial}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl max-h-[90vh] bg-surface rounded-3xl overflow-hidden border border-border/40 shadow-2xl p-2 cursor-default flex flex-col items-center justify-center"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/80 hover:scale-105 transition-all cursor-pointer z-10"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <img
                src={selectedImage}
                alt="Material Zoomed"
                className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-md"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
