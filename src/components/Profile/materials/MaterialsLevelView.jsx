import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBook,
  FaFolder,
  FaFileAlt,
  FaChevronRight,
  FaExternalLinkAlt,
  FaBookReader,
} from "react-icons/fa";

export default function MaterialsLevelView({
  level,
  filteredItems,
  texts,
  isUa,
  handleSubjectSelect,
  handleFolderSelect,
  setSelectedImage,
}) {
  if (filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-text-muted bg-surface/30 rounded-3xl border border-dashed border-border/80">
        <FaFileAlt className="w-12 h-12 mb-3 text-primary/30" />
        <p className="font-semibold text-sm">{texts.emptyMaterials}</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {/* Level 1: Subjects */}
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
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-primary/5 group-hover:bg-primary/10 transition-colors" />
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

      {/* Level 2: Folders */}
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

      {/* Level 3: Materials */}
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
                {/* Title */}
                <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                  <span className="inline-flex items-center gap-2 font-bold text-lg text-text">
                    <FaBookReader className="w-5 h-5 text-primary" />
                    {mat.name || texts.viewMaterial}
                  </span>
                </div>

                {/* Thumbnail / Image */}
                {mat.image && (
                  <div
                    onClick={() => setSelectedImage(mat.image)}
                    className="w-full max-w-lg h-72 rounded-3xl overflow-hidden border border-border shadow-sm bg-white cursor-pointer relative group/img"
                  >
                    <img
                      src={mat.image}
                      alt={mat.name || "Material Thumbnail"}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white text-sm font-bold gap-2">
                      <span>🔍</span>
                      <span>{isUa ? "Натисніть, щоб збільшити" : "Click to zoom"}</span>
                    </div>
                  </div>
                )}

                {/* Description & Link */}
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
  );
}
