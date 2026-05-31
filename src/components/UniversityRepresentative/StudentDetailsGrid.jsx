import React from "react";
import { FaUser, FaGraduationCap, FaEnvelope, FaWhatsapp } from "react-icons/fa";

export default function StudentDetailsGrid({ student, formatDate }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6 bg-surface/40 rounded-2xl border border-border/80">
      {/* Column 1: Personal Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <FaUser className="text-primary text-sm" />
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Personal Info
          </h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Gender</span>
            <span className="text-sm font-semibold text-text capitalize">
              {student.gender || "Not specified"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Birth Date</span>
            <span className="text-sm font-semibold text-text">
              {formatDate(student.birth) || "Not specified"}
            </span>
          </div>
        </div>
      </div>

      {/* Column 2: Academic Status */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <FaGraduationCap className="text-primary text-sm" />
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Academic Info
          </h4>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">University</span>
            <span className="text-sm font-semibold text-text truncate block max-w-full" title={student.university?.name}>
              {student.university?.name || "Not specified"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">College Year</span>
              <span className="text-sm font-semibold text-text">{student.college_year || "Not specified"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Specialization</span>
              <span className="text-sm font-semibold text-text capitalize">{student.specialization?.name || "None"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Column 3: Contact & Actions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <FaEnvelope className="text-primary text-sm" />
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider">
            Contact & Actions
          </h4>
        </div>
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Email Address</span>
            <a href={`mailto:${student.email}`} className="text-sm font-semibold text-primary hover:underline truncate block" title={student.email}>
              {student.email}
            </a>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-text-muted font-bold uppercase tracking-wider">Phone Number</span>
            <a href={`tel:${student.phone}`} className="text-sm font-semibold text-text hover:underline block">
              {student.phone}
            </a>
          </div>
          <div className="pt-2 flex items-center gap-2">
            {student.phone && (
              <a
                href={`https://wa.me/${student.phone.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md"
              >
                <FaWhatsapp className="text-sm" /> WhatsApp
              </a>
            )}
            <a
              href={`mailto:${student.email}`}
              className="p-2.5 border border-border bg-background hover:bg-surface text-text-secondary hover:text-primary rounded-xl transition shadow-sm"
              title="Send Email"
            >
              <FaEnvelope className="text-xs" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
