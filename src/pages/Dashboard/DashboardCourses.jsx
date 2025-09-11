import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import CoursesManagement from '../../components/Dashboard/CoursesManagement';

export default function DashboardCourses() {
  return (
    <DashboardLayout>
      <CoursesManagement />
    </DashboardLayout>
  );
}
