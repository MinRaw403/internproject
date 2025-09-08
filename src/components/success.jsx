import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import { Link } from "react-router-dom";

export default function SuccessMessage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm text-center relative">
        {/* Circle Check Icon */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
          <div className="bg-green-100 border-4 border-green-500 rounded-full w-20 h-20 flex items-center justify-center">
            <FaCheck className="text-green-600 text-4xl" />
          </div>
        </div>

        {/* Texts */}
        <div className="mt-14">
          <h2 className="text-xl font-bold text-black mb-2">Success</h2>
          <p className="text-sm text-gray-600">Successfully Added New Department</p>

          {/* Buttons */}
          <div className="mt-6 flex justify-center space-x-4">
            <button
              className="bg-sky-500 text-white px-5 py-2 rounded hover:bg-sky-600"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <Link to="/department">
           <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600">
              Dashboard
            </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
