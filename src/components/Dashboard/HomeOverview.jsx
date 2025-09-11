import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const statsData = [
  { title: 'Total Users', value: 1200, icon: '👥', color: 'bg-blue-500' },
  { title: 'Books', value: 350, icon: '📚', color: 'bg-green-500' },
  { title: 'Courses', value: 75, icon: '🎓', color: 'bg-purple-500' },
  { title: 'Instructors', value: 25, icon: '👨‍🏫', color: 'bg-yellow-500' },
];

const userGrowthData = [
  { month: 'Jan', users: 400 },
  { month: 'Feb', users: 600 },
  { month: 'Mar', users: 800 },
  { month: 'Apr', users: 1000 },
  { month: 'May', users: 1100 },
  { month: 'Jun', users: 1200 },
];

const courseCompletionData = [
  { name: 'Course A', completion: 80 },
  { name: 'Course B', completion: 65 },
  { name: 'Course C', completion: 90 },
  { name: 'Course D', completion: 75 },
];

export default function HomeOverview() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
        {statsData.map((stat) => (
          <div
            key={stat.title}
            className={`flex items-center p-4 rounded-lg shadow-md text-white ${stat.color}`}
          >
            <div className="mr-4 text-3xl">{stat.icon}</div>
            <div>
              <p className="text-lg font-semibold">{stat.title}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* User Growth Area Chart */}
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
            User Growth (Last 6 Months)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={userGrowthData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Course Completion Bar Chart */}
        <div className="p-4 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-700 dark:text-gray-200">
            Course Completion Rates
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseCompletionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Bar dataKey="completion" fill="#a855f7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
