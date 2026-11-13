import React from "react";
import PurchaseModal from "../ContentModals/PurchaseModal";
import ImagePopup from "../ContentModals/ImagePopup";
import PDFPopup from "../ContentModals/PDFPopup";
import VideoPopup from "../ContentModals/VideoPopup";

export default function LiveCourseModals({
  showPurchaseModal,
  closePurchaseModal,
  courseId,
  showImagePopup,
  selectedImage,
  setShowImagePopup,
  showFilesPopup,
  selectedFile,
  setShowFilesPopup,
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
        isLive={true}
      />

      <ImagePopup
        show={showImagePopup}
        image={selectedImage}
        onClose={() => setShowImagePopup(false)}
      />

      <PDFPopup
        show={showFilesPopup}
        file={selectedFile}
        onClose={() => setShowFilesPopup(false)}
      />

      <VideoPopup
        show={showVideoPopup}
        video={selectedVideo}
        onClose={() => setShowVideoPopup(false)}
      />
    </>
  );
}
