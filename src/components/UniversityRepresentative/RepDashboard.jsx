import React, { useState } from "react";
import { FaBuilding, FaUser, FaGraduationCap } from "react-icons/fa";
import StudentCard from "./StudentCard";
import RepStatsGrid from "./RepStatsGrid";
import DashboardFilters from "./DashboardFilters";

export default function RepDashboard({
  t,
  i18n,
  students,
  userData,
  guestName,
  formatDate
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState(null);

  const toggleExpandStudent = (studentId) => {
    setExpandedStudentId(prev => prev === studentId ? null : studentId);
  };

  // Get unique college years for filter
  const uniqueYears = Array.from(
    new Set(students.map(s => s.college_year).filter(Boolean))
  );

  // Filter students based on search and selected year
  const filteredStudents = students.filter(student => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone?.includes(searchQuery);

    const matchesYear = selectedYear ? student.college_year === selectedYear : true;

    return matchesSearch && matchesYear;
  });

  // Calculate statistics from the student list
  const totalStudents = students.length;
  let totalVideoCourses = 0;
  let totalLiveCourses = 0;
  let completedCoursesCount = 0;

  students.forEach(student => {
    const courses = student.courses || [];
    courses.forEach(course => {
      if (course.type === "live") {
        totalLiveCourses++;
      } else {
        totalVideoCourses++;
      }
      if (course.is_completed || course.status === "completed" || course.percentage === 100) {
        completedCoursesCount++;
      }
    });
  });

  const universityName = students[0]?.university?.name || userData?.university?.name || t("profile.university");

  return (
    <div className="container px-4 py-12 mx-auto max-w-7xl space-y-12 animate-slideUp">
      {/* Banner */}
      <div className="relative p-6 md:p-8 rounded-2xl bg-surface border border-border text-text shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-4">
        <div className="space-y-1.5 relative">
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
            <FaBuilding className="text-sm" />
            {t("universityRepresentative.dashboardTitle", "Representative Dashboard")}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-text leading-tight">{universityName}</h1>
          <p className="text-sm text-text-secondary font-medium">
            Welcome, {userData?.name || guestName || "Representative"}. You can track courses and academic performance of students under your university.
          </p>
        </div>
      </div>

      {/* Statistics Grid */}
      <RepStatsGrid
        t={t}
        totalStudents={totalStudents}
        totalVideoCourses={totalVideoCourses}
        totalLiveCourses={totalLiveCourses}
        completedCoursesCount={completedCoursesCount}
      />

      {/* Filters and List */}
      <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-6">
          <h2 className="text-xl font-bold text-text flex items-center gap-2">
            <FaGraduationCap className="text-primary" />
            {t("universityRepresentative.studentsList", "Students List")}
            <span className="px-2.5 py-0.5 text-xs bg-primary/10 text-primary font-semibold rounded-full">
              {filteredStudents.length}
            </span>
          </h2>

          <DashboardFilters
            t={t}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedYear={selectedYear}
            onYearChange={setSelectedYear}
            uniqueYears={uniqueYears}
          />
        </div>

        {/* Student Grid list */}
        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center text-text-muted border-2 border-dashed border-border rounded-xl">
            <FaUser className="mx-auto text-4xl opacity-20 mb-3" />
            <p className="font-medium">No students found matching filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredStudents.map(student => (
              <StudentCard
                key={student.id}
                student={student}
                t={t}
                i18n={i18n}
                isExpanded={expandedStudentId === student.id}
                onToggle={() => toggleExpandStudent(student.id)}
                formatDate={formatDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
