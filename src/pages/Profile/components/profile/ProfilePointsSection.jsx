import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  FaGem,
  FaCoins,
  FaTag,
  FaCheck,
  FaCopy,
  FaStore,
  FaUser,
} from "react-icons/fa";

export default function ProfilePointsSection({
  user,
  codeCopied,
  handleCopyCode,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border">
        <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <FaGem className="text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-xl font-bold">{t("points.title", "Points & Referral")}</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Points Balance Card */}
        <div className="p-5 border bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <FaCoins className="text-yellow-500" />
            <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">
              {t("points.balance", "Points Balance")}
            </h4>
          </div>
          <div className="text-center py-3">
            <div className="text-4xl font-bold text-primary mb-1">
              {Number(user.points_balance || 0).toLocaleString()}
            </div>
            <div className="text-sm text-text-secondary">{t("points.pts", "pts")}</div>
            <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">{t("points.monetary_value", "Cash Value")}</span>
                <span className="font-semibold text-green-600">
                  ₴{Number(user.points_monetary_value || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t("points.point_value", "Point Value")}</span>
                <span className="font-medium">₴{user.settings_point_value || "0"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{t("points.min_redeem", "Min to Redeem")}</span>
                <span className="font-medium">
                  {user.settings_min_points_to_redeem || "0"} {t("points.pts", "pts")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Referral Code Card */}
        <div className="p-5 border bg-surface border-border rounded-xl">
          <div className="flex items-center gap-2 mb-4">
            <FaTag className="text-primary" />
            <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">
              {t("points.my_code", "My Referral Code")}
            </h4>
          </div>

          {user.code_for_client ? (
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 font-mono text-lg font-bold tracking-widest text-center border rounded-lg bg-background border-border text-primary">
                  {user.code_for_client}
                </div>
                <button
                  onClick={handleCopyCode}
                  title={t("points.copy", "Copy")}
                  className={`p-3 rounded-lg border transition-all ${
                    codeCopied
                      ? "bg-green-100 border-green-300 text-green-600 dark:bg-green-900/30"
                      : "bg-surface border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {codeCopied ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                </button>
              </div>
              {codeCopied && (
                <p className="mt-1 text-xs text-center text-green-600">{t("points.copied", "Copied!")}</p>
              )}
              <p className="text-xs text-text-secondary mt-3 text-center leading-relaxed bg-primary/5 rounded p-2 border border-primary/10">
                {t(
                  "points.earn_referral",
                  "Share this code to earn {{points}} points for each friend that registers!",
                  { points: user.settings_referral_points || "0" }
                )}
              </p>
            </div>
          ) : (
            <p className="mb-4 text-sm text-center text-text-secondary opacity-60">
              {t("points.no_code", "No referral code assigned yet")}
            </p>
          )}
        </div>

        {/* Allowed Merchants Card */}
        {user.allowed_points_merchants && user.allowed_points_merchants.length > 0 && (
          <div className="p-5 border bg-surface border-border rounded-xl flex flex-col max-h-[360px]">
            <div className="flex items-center gap-2 mb-4 shrink-0">
              <FaStore className="text-emerald-600" />
              <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">
                {t("points.merchants_title", "Redeem Points At")}
              </h4>
            </div>
            <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-2">
              {user.allowed_points_merchants.map((merchant) => {
                const isStore =
                  merchant.role === "merchant" ||
                  merchant.role === "store" ||
                  merchant.is_store === true ||
                  merchant.email?.toLowerCase() === "drkrokwebsite@gmail.com" ||
                  merchant.name?.toLowerCase().includes("dr-krok");

                const isInstructor =
                  !isStore ||
                  merchant.role === "instructor" ||
                  merchant.role === "teacher" ||
                  merchant.email?.toLowerCase() === "dr.krok12@gmail.com" ||
                  merchant.is_instructor == true;

                return (
                  <div
                    key={merchant.id}
                    className="flex items-center justify-between p-3 border rounded-lg border-border bg-background/50"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{merchant.name}</p>
                      <p className="text-xs text-text-secondary truncate">{merchant.email}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      {isInstructor ? (
                        <button
                          onClick={() => navigate(`/instructors/${merchant.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg border border-primary text-primary hover:bg-primary hover:text-white"
                        >
                          <FaUser className="text-[10px]" />
                          {t("points.view_profile", "View Profile")}
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate(`/merchants/${merchant.id}`)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-all rounded-lg bg-primary hover:bg-secondary hover:shadow-sm"
                        >
                          <FaStore className="text-[10px]" />
                          {t("points.visit_store", "Visit Store")}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
