import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function DepartmentAddPage() {
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");

  const handleNew = () => {
    setCode("");
    setDescription("");
  };

  const handleEdit = () => {
    alert("Edit functionality not implemented");
  };

  const handleDelete = () => {
    alert("Delete functionality not implemented");
  };

  const handleSave = () => {
    console.log("Saved:", { code, description });
  };

  const handleReset = () => {
    setCode("");
    setDescription("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white py-8 px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-sky-500 text-white text-lg font-semibold px-6 py-3">
          Department
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <label className="w-full md:w-1/4 font-semibold text-gray-700 mb-2 md:mb-0">
              Code
            </label>
            <input
              type="text"
              className="flex-1 p-3 rounded bg-gray-200 outline-none"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
            />
          </div>

          <div className="flex flex-col md:flex-row md:items-center">
            <label className="w-full md:w-1/4 font-semibold text-gray-700 mb-2 md:mb-0">
              Description
            </label>
            <input
              type="text"
              className="flex-1 p-3 rounded bg-gray-200 outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 p-4 bg-white border-t">
          <button
            className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            onClick={handleNew}
          >
            New
          </button>
          <button
            className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            onClick={handleEdit}
          >
            Edit
          </button>
          <button
            className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            onClick={handleDelete}
          >
            Delete
          </button>
          <Link to="/success">
            <button className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600">
              Save
            </button>
          </Link>
          <button
            className="bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
