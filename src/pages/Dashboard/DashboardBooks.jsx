import React from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import BooksManagement from '../../components/Dashboard/BooksManagement';

export default function DashboardBooks() {
  return (
    <DashboardLayout>
      <BooksManagement />
    </DashboardLayout>
  );
}
