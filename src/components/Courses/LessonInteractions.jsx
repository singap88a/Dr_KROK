import React, { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaEdit,
  FaTrash,
  FaUserCircle,
  FaSpinner,
  FaChevronDown,
  FaChevronUp,
  FaLock,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";

export default function LessonInteractions({ lessonId, batchLessonId, isLiveCourse = false, groupId, mode = "full", hasAccess = false }) {
  const { t } = useTranslation();
  const { isLoggedIn } = useUser();
  const {
    getVideoLessonInteractions,
    toggleVideoLessonLike,
    addVideoLessonComment,
    editVideoLessonComment,
    deleteVideoLessonComment,
    getLiveLessonInteractions,
    toggleLiveLessonLike,
    addLiveLessonComment,
    editLiveLessonComment,
    deleteLiveLessonComment,
  } = useApi();

  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  const textareaRef = useRef(null);
  const editRef = useRef(null);

  const canFetch = isLiveCourse ? !!(lessonId && groupId) : !!lessonId;
  const idToUse = isLiveCourse ? `${lessonId}-${groupId}` : lessonId;

  const fetchInteractions = useCallback(async () => {
    if (!canFetch) {
      console.log("🚫 Interaction fetch skipped - missing IDs:", { lessonId, groupId, isLiveCourse });
      return;
    }
    try {
      setLoading(true);
      console.log(`📡 Fetching interactions for ${isLiveCourse ? "Live" : "Video"} lesson:`, { lessonId, groupId });
      
      const data = isLiveCourse
        ? await getLiveLessonInteractions(lessonId, groupId)
        : await getVideoLessonInteractions(lessonId);

      console.log("📥 Interactions data received:", data);

      if (data) {
        setLikesCount(data.likes_count ?? 0);
        setIsLiked(data.is_liked ?? false);
        setComments(data.comments ?? []);
        // Use comments length if comments_count is missing
        setCommentsCount(data.comments_count ?? data.comments?.length ?? data.pagination?.total ?? 0);
      }
    } catch (err) {
      console.error("❌ Error fetching interactions:", err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, batchLessonId, groupId, isLiveCourse, canFetch, getVideoLessonInteractions, getLiveLessonInteractions]);

  useEffect(() => {
    if (isLoggedIn) fetchInteractions();
  }, [idToUse, isLoggedIn, fetchInteractions]);

  useEffect(() => {
    if (editingId && editRef.current) editRef.current.focus();
  }, [editingId]);

  const handleLike = async () => {
    if (!isLoggedIn || likeLoading || !hasAccess) return;
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((c) => (wasLiked ? Math.max(0, c - 1) : c + 1));
    setLikeLoading(true);
    try {
      isLiveCourse ? await toggleLiveLessonLike(batchLessonId) : await toggleVideoLessonLike(lessonId);
    } catch (err) {
      setIsLiked(wasLiked);
      setLikesCount((c) => (wasLiked ? c + 1 : Math.max(0, c - 1)));
    } finally {
      setLikeLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    const trimmed = newComment.trim();
    if (!trimmed || !isLoggedIn || addingComment || !hasAccess) return;
    setAddingComment(true);
    try {
      await (isLiveCourse ? addLiveLessonComment(batchLessonId, trimmed) : addVideoLessonComment(lessonId, trimmed));
      setNewComment("");
      setIsInputFocused(false);
      await fetchInteractions();
    } catch (err) {
      console.error("Add comment failed:", err);
    } finally {
      setAddingComment(false);
    }
  };

  const handleSaveEdit = async (commentId) => {
    const trimmed = editText.trim();
    if (!trimmed || editSaving) return;
    setEditSaving(true);
    try {
      await (isLiveCourse ? editLiveLessonComment(batchLessonId, commentId, trimmed) : editVideoLessonComment(commentId, trimmed));
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, body: trimmed } : c)));
      setEditingId(null);
    } catch (err) {
      console.error("Edit comment failed:", err);
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const commentId = confirmDeleteId;
    try {
      await (isLiveCourse ? deleteLiveLessonComment(batchLessonId, commentId) : deleteVideoLessonComment(lessonId, commentId));
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setCommentsCount((n) => Math.max(0, n - 1));
    } catch (err) {
      console.error("Delete comment failed:", err);
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const scrollToComments = () => {
    const element = document.getElementById("lesson-comments-section");
    if (!element) return;
    const navOffset = 88;
    const top = element.getBoundingClientRect().top + window.scrollY - navOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    requestAnimationFrame(() => {
      const retryTop =
        element.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top: Math.max(0, retryTop), behavior: "smooth" });
    });
  };

  if (!isLoggedIn) return null;

  const displayedComments = showAllComments ? comments : comments.slice(0, 2);

  // ── Render Mode: Stats Bar ───────────────────────────────────────────────
  if (mode === "stats") {
    return (
      <div className="flex items-center gap-4 py-3">
        <button
          onClick={handleLike}
          disabled={likeLoading || !hasAccess}
          title={!hasAccess ? t("interactions.subscribeToLike", "You must be subscribed to like") : ""}
          className={`flex items-center gap-2.5 px-5 py-2 rounded-2xl transition-all duration-300 ${!hasAccess ? "opacity-60 cursor-not-allowed " : ""}${isLiked
            ? "bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-none"
            : "bg-accent/40 text-text-muted hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
            }`}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span className="text-xs font-black uppercase tracking-wider">{t("interactions.like", "Like")}</span>
          <span className="w-1 h-1 bg-current opacity-30 rounded-full"></span>
          <span className="text-sm font-bold">{likesCount}</span>
        </button>

        <button
          onClick={scrollToComments}
          className="flex items-center gap-2.5 px-5 py-2 rounded-2xl bg-accent/40 text-text-muted hover:bg-primary/10 hover:text-primary transition-all duration-300"
        >
          <FaComment />
          <span className="text-xs font-black uppercase tracking-wider">{t("interactions.commentLabel", "Comment")}</span>
          <span className="w-1 h-1 bg-current opacity-30 rounded-full"></span>
          <span className="text-sm font-bold">{commentsCount}</span>
        </button>
      </div>
    );
  }

  // ── Render Mode: Full Comments Section ───────────────────────────────────
  return (
    <>
      <div id="lesson-comments-section" className="mt-8 scroll-mt-24 rounded-[2.5rem] border-2 border-primary/10 bg-accent/20 dark:bg-accent/5 p-6 sm:p-8 shadow-inner">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
        <h3 className="text-lg font-black tracking-tight text-text">
          {t("interactions.discussion", "Lesson Discussion")}
          <span className="ml-3 text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{commentsCount}</span>
        </h3>
      </div>

      {/* ── Add Comment Area ── */}
      {hasAccess ? (
        <form onSubmit={handleAddComment} className="relative mb-10">
          <div className="flex gap-4">
            <div className="shrink-0">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface flex items-center justify-center text-primary shadow-sm border border-border/40">
                <FaUserCircle size={24} />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                ref={textareaRef}
                rows={isInputFocused ? 3 : 1}
                value={newComment}
                onFocus={() => setIsInputFocused(true)}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={t("interactions.writeComment", "Join the discussion...")}
                className={`w-full bg-white dark:bg-background border-2 rounded-2xl p-3 text-sm transition-all duration-300 focus:outline-none resize-none shadow-sm ${isInputFocused
                  ? "border-primary ring-4 ring-primary/5 min-h-[100px]"
                  : "border-border/40 hover:border-primary/20"
                  }`}
              />

              <AnimatePresence>
                {isInputFocused && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-end gap-3 mt-3 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => { setIsInputFocused(false); setNewComment(""); }}
                      className="px-5 py-2 text-xs font-bold text-text-muted hover:text-text"
                    >
                      {t("common.cancel", "Cancel")}
                    </button>
                    <button
                      type="submit"
                      disabled={!newComment.trim() || addingComment}
                      className="px-6 py-2 text-xs font-bold bg-primary text-white rounded-xl hover:bg-secondary disabled:opacity-50 transition-all shadow-md shadow-primary/10"
                    >
                      {addingComment ? <FaSpinner className="animate-spin" /> : t("interactions.submitComment", "Post")}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-10 p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 text-sm font-medium text-center flex items-center justify-center gap-2">
          <FaLock className="text-yellow-600 dark:text-yellow-400" />
          {t("interactions.subscribeToComment", "You must be subscribed to the course to join the discussion.")}
        </div>
      )}

      {/* ── Comments List ── */}
      <div className="space-y-6">
        {loading && comments.length === 0 ? (
          <div className="flex justify-center py-6"><FaSpinner className="animate-spin text-primary opacity-50" /></div>
        ) : comments.length === 0 ? (
          <div className="text-center py-10 opacity-60 italic text-sm">
            {t("interactions.noComments", "No messages yet.")}
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {displayedComments.map((comment) => (
                <motion.div layout key={comment.id} className="flex gap-4">
                  <div className="shrink-0">
                    {comment.client?.image ? (
                      <img src={comment.client.image} alt="" className="w-10 h-10 rounded-xl object-cover border border-border shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-surface flex items-center justify-center text-xs font-bold opacity-50 border border-border shadow-sm">
                        {(comment.client?.name || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-text truncate">{comment.client?.name}</span>
                      <span className="text-[10px] text-text-muted opacity-60">{comment.created_at}</span>
                    </div>

                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <textarea
                          ref={editRef}
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="w-full bg-white dark:bg-background border-2 border-primary rounded-xl p-2 text-sm focus:outline-none"
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button 
                            onClick={() => setEditingId(null)} 
                            className="px-4 py-1.5 text-[11px] font-bold text-text-muted bg-accent/60 hover:bg-accent rounded-lg transition-colors"
                          >
                            {t("common.cancel", "Cancel")}
                          </button>
                          <button 
                            onClick={() => handleSaveEdit(comment.id)} 
                            disabled={editSaving} 
                            className="px-4 py-1.5 text-[11px] font-bold text-white bg-primary hover:bg-primary/90 rounded-lg transition-all shadow-sm shadow-primary/20"
                          >
                            {editSaving ? <FaSpinner className="animate-spin" /> : t("common.save", "Update")}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/60 dark:bg-background/20 rounded-2xl p-3 border border-border/20 shadow-sm">
                        <p className="text-sm text-text/80 leading-relaxed break-words">{comment.body}</p>
                      </div>
                    )}

                    {comment.is_mine && editingId !== comment.id && (
                      <div className="flex items-center gap-3 mt-1.5 px-1">
                        <button onClick={() => { setEditingId(comment.id); setEditText(comment.body); }} className="text-[10px] font-bold text-text-muted hover:text-primary transition-colors flex items-center gap-1">
                          <FaEdit size={8} /> {t("interactions.edit", "Edit")}
                        </button>
                        <button onClick={() => setConfirmDeleteId(comment.id)} className="text-[10px] font-bold text-text-muted hover:text-red-500 transition-colors flex items-center gap-1">
                          <FaTrash size={8} /> {t("interactions.delete", "Delete")}
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {comments.length > 2 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowAllComments(!showAllComments)}
                  className="flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-wider text-primary bg-white dark:bg-surface rounded-full border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm"
                >
                  {showAllComments ? (
                    <><FaChevronUp /> {t("common.showLess", "Show Less")}</>
                  ) : (
                    <><FaChevronDown /> {t("common.showMore", "Show More")} ({comments.length - 2} {t("common.more", "more")})</>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

    <AnimatePresence>
        {confirmDeleteId && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-surface rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-border/50 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-4">
                <FaTrash size={24} />
              </div>
              <h3 className="text-xl font-black text-text mb-2">
                {t("interactions.deleteConfirmTitle", "Delete Comment?")}
              </h3>
              <p className="text-sm text-text-muted mb-8 leading-relaxed">
                {t("interactions.deleteConfirmDesc", "Are you sure you want to remove this thought? This action cannot be undone.")}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-3 text-sm font-black text-text-muted bg-accent/40 hover:bg-accent/60 rounded-xl transition-all"
                >
                  {t("common.cancel", "Cancel")}
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 text-sm font-black bg-red-500 text-white rounded-xl hover:bg-red-600 hover:shadow-lg hover:shadow-red-200 transition-all active:scale-95"
                >
                  {t("common.delete", "Yes, Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
