import { useState, useEffect } from "react";

export function useConnectDnD(setAnswers) {
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [dragItem, setDragItem] = useState(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Touch Handlers for mobile
  const handleTouchStart = (e, questionId, answerKey) => {
    if (!isMobile) return;

    e.preventDefault();
    setSelectedImage({
      questionId,
      answerKey,
      image: e.currentTarget.querySelector("img")?.src,
      element: e.currentTarget,
    });
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !selectedImage) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e, questionId, textKey) => {
    if (!isMobile || !selectedImage) return;

    e.preventDefault();

    if (selectedImage.questionId === questionId) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [textKey]: selectedImage.answerKey,
        },
      }));
    }

    setSelectedImage(null);
    setActiveDropZone(null);
  };

  const handleTouchEnter = (questionId, textKey) => {
    if (!isMobile || !selectedImage) return;
    setActiveDropZone({ questionId, textKey });
  };

  const handleTouchLeave = () => {
    if (!isMobile || !selectedImage) return;
    setActiveDropZone(null);
  };

  // Drag Handlers for desktop
  const handleDragStart = (e, questionId, answerKey) => {
    if (isMobile) return;

    setDragItem({ questionId, answerKey });
    e.dataTransfer.setData("text/plain", `${questionId}-${answerKey}`);
  };

  const handleDragOver = (e) => {
    if (isMobile) return;
    e.preventDefault();
  };

  const handleDrop = (e, questionId, textKey) => {
    if (isMobile) return;

    e.preventDefault();
    if (dragItem && dragItem.questionId === questionId) {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [textKey]: dragItem.answerKey,
        },
      }));
    }
    setDragItem(null);
  };

  // Remove connection
  const removeConnection = (questionId, textKey) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev };
      if (newAnswers[questionId]) {
        delete newAnswers[questionId][textKey];
        if (Object.keys(newAnswers[questionId]).length === 0) {
          delete newAnswers[questionId];
        }
      }
      return newAnswers;
    });
  };

  // View image modal
  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  return {
    isMobile,
    selectedImage,
    activeDropZone,
    showImageModal,
    setShowImageModal,
    modalImage,
    dragItem,
    setDragItem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchEnter,
    handleTouchLeave,
    handleDragStart,
    handleDragOver,
    handleDrop,
    removeConnection,
    openImageModal,
  };
}
