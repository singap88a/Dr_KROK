import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import HomeOverview from '../../components/Dashboard/HomeOverview';

export default function DashboardHome() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="mb-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard Overview
        </h1>
        <HomeOverview />
      </div>
    </DashboardLayout>
  );
}
