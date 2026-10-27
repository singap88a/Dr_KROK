import React from "react";
import { FaTimes, FaAward } from "react-icons/fa";
import { Trans } from "react-i18next";

export default function TestModals({
  showImageModal,
  setShowImageModal,
  modalImage,
  pointsPopupData,
  setPointsPopupData,
  t,
}) {
  return (
    <>
      {/* Image Modal for Mobile */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative max-w-lg mx-4">
            <button
              className="absolute top-0 right-0 z-10 p-2 text-white translate-x-2 -translate-y-2 bg-red-500 rounded-full hover:bg-red-600"
              onClick={() => setShowImageModal(false)}
            >
              <FaTimes />
            </button>
            <img
              src={modalImage}
              alt="Enlarged view"
              className="rounded-lg max-h-[80vh]"
            />
          </div>
        </div>
      )}

      {/* Points Popup */}
      {pointsPopupData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center transform transition-all animate-bounce-in">
            <div className="flex justify-center mb-4 text-yellow-400">
              <FaAward size={64} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {t("courses.congratulationsPopup", "Congratulations!")}
            </h3>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              <Trans
                i18nKey="courses.pointsRewardMessage"
                values={{
                  percentage: pointsPopupData.percentage,
                  points: pointsPopupData.points,
                }}
                components={{
                  1: <span className="font-bold text-green-600" />,
                  2: <span className="font-bold text-yellow-500" />,
                }}
              >
                You have successfully passed the test with a score of{" "}
                <span className="font-bold text-green-600">
                  {pointsPopupData.percentage}%
                </span>{" "}
                and{" "}
                <span className="font-bold text-yellow-500">
                  {pointsPopupData.points}
                </span>{" "}
                points have been added to your balance as a reward.
              </Trans>
            </p>
            <button
              onClick={() => {
                const continueNav = pointsPopupData.onContinue;
                setPointsPopupData(null);
                if (continueNav) continueNav();
              }}
              className="w-full bg-primary text-white rounded-lg py-3 font-semibold hover:bg-secondary transition-colors"
            >
              {t("common.continue", "متابعة")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
