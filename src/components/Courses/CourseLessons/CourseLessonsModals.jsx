import React from "react";
import PurchaseModal from "../ContentModals/PurchaseModal";
import ImagePopup from "../ContentModals/ImagePopup";
import VideoPopup from "../ContentModals/VideoPopup";

export default function CourseLessonsModals({
  showPurchaseModal,
  closePurchaseModal,
  courseId,
  showImagePopup,
  selectedImage,
  setShowImagePopup,
  showVideoPopup,
  selectedVideo,
  setShowVideoPopup,
}) {
  return (
    <>
      <PurchaseModal
        show={showPurchaseModal}
        onClose={closePurchaseModal}
        courseId={courseId}
      />

      <ImagePopup
        show={showImagePopup}
        image={selectedImage}
        onClose={() => setShowImagePopup(false)}
      />

      <VideoPopup
        show={showVideoPopup}
        video={selectedVideo}
        onClose={() => setShowVideoPopup(false)}
      />
    </>
  );
}
