import React from 'react';
import { FaPlus, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const departments = [
  { name: 'IT', date: '2025-05-22' },
  { name: 'HR', date: '2025-05-22' },
  { name: 'ACCOUNT', date: '2025-05-22' },
  { name: 'FINANCE', date: '2025-05-22' },
  { name: 'MARKETING', date: '2025-05-22' },
  { name: 'SALES', date: '2025-05-22' },
];

export default function DepartmentPage() {
  return (
    <div className="min-h-screen flex bg-blue-100">
      {/* Sidebar */}
      <aside className="hidden md:block w-1/5 bg-blue-100"></aside>

      {/* Main content */}
      <main className="flex-1 bg-white p-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          {/* Search Bar */}
          <div className="w-full sm:w-2/3 flex items-center bg-blue-100 rounded-full px-4 py-2">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="w-full bg-transparent outline-none"
            />
          </div>

          {/* Add Button */}
          <Link
            to="/DepartmentAddPage"
            className="mt-4 sm:mt-0 flex items-center bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-full"
          >
            Add <FaPlus className="ml-2" />
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b font-semibold text-black">
                <th className="py-2 px-4"> </th>
                <th className="py-2 px-4">Name</th>
                <th className="py-2 px-4">Code</th>
                <th className="py-2 px-4">Description</th>
                <th className="py-2 px-4">Date Created</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="py-2 px-4">
                    <input type="checkbox" />
                  </td>
                  <td className="py-2 px-4">{dept.name}</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4">-</td>
                  <td className="py-2 px-4 text-gray-600">{dept.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
