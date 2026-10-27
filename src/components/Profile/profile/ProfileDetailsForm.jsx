import React from "react";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaStethoscope,
  FaCalendarAlt,
  FaVenusMars,
  FaGraduationCap,
  FaChevronDown,
  FaSearch,
} from "react-icons/fa";
import { FieldError, formatDateForDisplay } from "./profileValidation";

export default function ProfileDetailsForm({
  user,
  localUser,
  isEditing,
  formData,
  handleInputChange,
  handleBlur,
  errors,
  fieldClass,
  labelClass,
  errorId,
  fieldId,
  a11yProps,
  // Specializations
  specializations,
  specDropdownOpen,
  setSpecDropdownOpen,
  specDropdownRef,
  specSearch,
  setSpecSearch,
  specPage,
  specTotalPages,
  specLoading,
  fetchSpecializations,
  // Universities
  universities,
  uniDropdownOpen,
  setUniDropdownOpen,
  uniDropdownRef,
  uniSearch,
  setUniSearch,
  uniPage,
  uniTotalPages,
  uniLoading,
  fetchUniversities,
  // College Years
  collegeYears,
}) {
  const { t } = useTranslation();

  return (
    <div className="p-6 border lg:col-span-2 bg-surface border-border rounded-xl">
      <h3 className="mb-6 text-lg font-semibold">{t("profile.info")}</h3>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left Sub-Column */}
        <div className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor={fieldId("name")} className={labelClass("name")}>
              {t("profile.full_name")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  {...a11yProps("name")}
                  className={fieldClass("name")}
                  required
                />
                <FieldError id={errorId("name")} message={errors.name} />
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaUser className="text-primary text-sm" />
                </div>
                <span className="font-medium">{user.name}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor={fieldId("email")} className={labelClass("email")}>
              {t("profile.email_address")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  {...a11yProps("email")}
                  className={fieldClass("email")}
                  required
                />
                <FieldError id={errorId("email")} message={errors.email} />
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaEnvelope className="text-primary text-sm" />
                </div>
                <span className="font-medium">{user.email}</span>
              </div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor={fieldId("phone")} className={labelClass("phone")}>
              {t("profile.phone_number")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="+380501234567"
                  {...a11yProps("phone")}
                  className={fieldClass("phone")}
                  required
                />
                <FieldError id={errorId("phone")} message={errors.phone} />
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaPhone className="text-primary text-sm" />
                </div>
                <span className="font-medium">{user.phone || t("profile.not_provided")}</span>
              </div>
            )}
          </div>

          {/* Specialization */}
          <div>
            <label className="block mb-2 text-sm font-bold text-text-primary">
              {t("profile.specialization")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                (Optional)
              </span>
            </label>
            {isEditing ? (
              <div className="relative" ref={specDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSpecDropdownOpen((o) => !o)}
                  className="w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary text-left"
                >
                  <span className={formData.specialization_id ? "" : "text-gray-400"}>
                    {formData.specialization_id
                      ? specializations.find((s) => String(s.id) === String(formData.specialization_id))
                          ?.name || t("profile.select_specialization")
                      : t("profile.select_specialization")}
                  </span>
                  <FaChevronDown
                    className={`text-xs transition-transform ${specDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {specDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl dark:bg-gray-800 border-border max-h-64 flex flex-col">
                    <div className="flex items-center gap-2 p-2 border-b border-border">
                      <FaSearch className="text-xs text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={specSearch}
                        onChange={(e) => setSpecSearch(e.target.value)}
                        placeholder={t("profile.search_specialization", "Search specialization...")}
                        className="flex-1 text-sm bg-transparent outline-none dark:text-white"
                        autoFocus
                      />
                    </div>
                    <ul className="overflow-y-auto flex-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange({ target: { name: "specialization_id", value: "" } });
                            setSpecDropdownOpen(false);
                            setSpecSearch("");
                          }}
                          className="w-full px-3 py-2 text-sm text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {t("profile.select_specialization")}
                        </button>
                      </li>
                      {specializations
                        .filter(
                          (s) => !specSearch || s.name.toLowerCase().includes(specSearch.toLowerCase())
                        )
                        .map((specialization) => (
                          <li key={specialization.id}>
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange({
                                  target: { name: "specialization_id", value: specialization.id },
                                });
                                setSpecDropdownOpen(false);
                                setSpecSearch("");
                              }}
                              className={`w-full px-3 py-2 text-sm text-left transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                String(formData.specialization_id) === String(specialization.id)
                                  ? "bg-primary/10 dark:bg-primary/20 font-medium text-primary"
                                  : "dark:text-white"
                              }`}
                            >
                              {specialization.name}
                            </button>
                          </li>
                        ))}
                    </ul>
                    {specPage < specTotalPages && !specSearch && (
                      <div className="p-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => fetchSpecializations(specPage + 1, true)}
                          disabled={specLoading}
                          className="w-full py-1.5 text-xs text-center text-primary hover:underline disabled:opacity-50"
                        >
                          {specLoading
                            ? t("common.loading", "Loading...")
                            : t("profile.load_more_specializations", "Load more specializations")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaStethoscope className="text-primary text-sm" />
                </div>
                <span className="font-medium">
                  {localUser.specialization?.name ||
                    specializations.find((s) => s.id == localUser.specialization_id)?.name ||
                    t("profile.not_selected")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sub-Column */}
        <div className="space-y-4">
          {/* Birth Date */}
          <div>
            <label htmlFor={fieldId("birth")} className={labelClass("birth")}>
              {t("profile.birth_date")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <>
                <input
                  type="date"
                  name="birth"
                  value={formData.birth}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  max={new Date().toISOString().split("T")[0]}
                  {...a11yProps("birth")}
                  className={fieldClass("birth")}
                  required
                />
                <FieldError id={errorId("birth")} message={errors.birth} />
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaCalendarAlt className="text-primary text-sm" />
                </div>
                <span className="font-medium">
                  {user.birth ? formatDateForDisplay(user.birth) : t("profile.not_provided")}
                </span>
              </div>
            )}
          </div>

          {/* Gender */}
          <div>
            <label htmlFor={fieldId("gender")} className={labelClass("gender")}>
              {t("profile.gender")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  {...a11yProps("gender")}
                  className={fieldClass("gender")}
                  required
                >
                  <option value="">{t("profile.select_gender")}</option>
                  <option value="male">{t("profile.male")}</option>
                  <option value="female">{t("profile.female")}</option>
                  <option value="other">{t("profile.other")}</option>
                </select>
                <FieldError id={errorId("gender")} message={errors.gender} />
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaVenusMars className="text-primary text-sm" />
                </div>
                <span className="capitalize font-medium">
                  {user.gender || t("profile.not_provided")}
                </span>
              </div>
            )}
          </div>

          {/* University */}
          <div>
            <label htmlFor={fieldId("university_id")} className={labelClass("university_id")}>
              {t("profile.university")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <div className="relative" ref={uniDropdownRef}>
                <button
                  type="button"
                  onClick={() => setUniDropdownOpen((o) => !o)}
                  {...a11yProps("university_id")}
                  className={fieldClass(
                    "university_id",
                    "w-full flex items-center justify-between px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 text-left"
                  )}
                >
                  <span className={formData.university_id ? "" : "text-gray-400"}>
                    {formData.university_id
                      ? universities.find((u) => String(u.id) === String(formData.university_id))
                          ?.name || t("profile.select_university")
                      : t("profile.select_university")}
                  </span>
                  <FaChevronDown
                    className={`text-xs transition-transform ${uniDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {uniDropdownOpen && (
                  <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl dark:bg-gray-800 border-border max-h-64 flex flex-col">
                    <div className="flex items-center gap-2 p-2 border-b border-border">
                      <FaSearch className="text-xs text-gray-400 shrink-0" />
                      <input
                        type="text"
                        value={uniSearch}
                        onChange={(e) => setUniSearch(e.target.value)}
                        placeholder={t("profile.search_university", "Search university...")}
                        className="flex-1 text-sm bg-transparent outline-none dark:text-white"
                        autoFocus
                      />
                    </div>

                    <ul className="overflow-y-auto flex-1">
                      <li>
                        <button
                          type="button"
                          onClick={() => {
                            handleInputChange({ target: { name: "university_id", value: "" } });
                            setUniDropdownOpen(false);
                            setUniSearch("");
                          }}
                          className="w-full px-3 py-2 text-sm text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          {t("profile.select_university")}
                        </button>
                      </li>
                      {universities
                        .filter(
                          (u) => !uniSearch || u.name.toLowerCase().includes(uniSearch.toLowerCase())
                        )
                        .map((university) => (
                          <li key={university.id}>
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange({
                                  target: { name: "university_id", value: university.id },
                                });
                                setUniDropdownOpen(false);
                                setUniSearch("");
                              }}
                              className={`w-full px-3 py-2 text-sm text-left transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                String(formData.university_id) === String(university.id)
                                  ? "bg-primary/10 dark:bg-primary/20 font-medium text-primary"
                                  : "dark:text-white"
                              }`}
                            >
                              {university.name}
                            </button>
                          </li>
                        ))}
                    </ul>

                    {uniPage < uniTotalPages && !uniSearch && (
                      <div className="p-2 border-t border-border">
                        <button
                          type="button"
                          onClick={() => fetchUniversities(uniPage + 1, true)}
                          disabled={uniLoading}
                          className="w-full py-1.5 text-xs text-center text-primary hover:underline disabled:opacity-50"
                        >
                          {uniLoading
                            ? t("common.loading", "Loading...")
                            : t("profile.load_more_universities", "Load more universities")}
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <FieldError id={errorId("university_id")} message={errors.university_id} />
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaGraduationCap className="text-primary text-sm" />
                </div>
                <span className="font-medium">
                  {localUser.university?.name ||
                    universities.find((u) => u.id == localUser.university_id)?.name ||
                    t("profile.not_selected")}
                </span>
              </div>
            )}
          </div>

          {/* College Year */}
          <div>
            <label htmlFor={fieldId("college_year")} className={labelClass("college_year")}>
              {t("profile.college_year")}{" "}
              <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">
                * (Required)
              </span>
            </label>
            {isEditing ? (
              <>
                <select
                  name="college_year"
                  value={formData.college_year}
                  onChange={handleInputChange}
                  {...a11yProps("college_year")}
                  className={fieldClass("college_year")}
                  required
                >
                  <option value="">{t("profile.select_year")}</option>
                  {collegeYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
                <FieldError id={errorId("college_year")} message={errors.college_year} />
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                  <FaGraduationCap className="text-primary text-sm" />
                </div>
                <span className="font-medium">
                  {collegeYears.find((year) => year.id == localUser.college_year)?.name ||
                    t("profile.not_specified")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
