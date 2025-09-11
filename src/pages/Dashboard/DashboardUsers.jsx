import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import UsersManagement from '../../components/Dashboard/UsersManagement';

export default function DashboardUsers() {
  return (
    <DashboardLayout>
      <UsersManagement />
    </DashboardLayout>
  );
}
