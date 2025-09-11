import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import InstructorsManagement from '../../components/Dashboard/InstructorsManagement';

export default function DashboardInstructors() {
  return (
    <DashboardLayout>
      <InstructorsManagement />
    </DashboardLayout>
  );
}
