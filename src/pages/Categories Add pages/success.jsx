// This file is no longer directly navigated to for "success" after adding a category.
// It can be kept if you have other scenarios where a standalone success page is needed.
// Otherwise, you might consider removing it or repurposing it.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import './SuccessMessage.css';

export default function SuccessMessage() {
  const navigate = useNavigate();

  return (
      <div className="success-page">
        <div className="success-box">
          {/* Circle Check Icon */}
          <div className="success-icon-wrapper">
            <div className="success-icon-circle">
              <FaCheck className="success-check-icon" />
            </div>
          </div>

          {/* Texts */}
          <div className="success-content">
            <h2 className="success-title">Success</h2>
            <p className="success-message">Operation Completed Successfully</p> {/* Changed message to be generic */}

            {/* Buttons */}
            <div className="success-buttons">
              <button className="success-btn" onClick={() => navigate(-1)}>
                Back
              </button>
              <button className="success-btn" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}