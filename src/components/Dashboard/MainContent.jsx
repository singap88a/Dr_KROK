import React from 'react';

export default function MainContent({ children }) {
  return (
    <main className="flex-1 p-6 overflow-y-auto bg-gray-100 dark:bg-gray-900">
      {children}
    </main>
  );
}
