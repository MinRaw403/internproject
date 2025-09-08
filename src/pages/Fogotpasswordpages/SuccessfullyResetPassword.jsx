import React from 'react';
import './SuccessfullyResetPassword.css'; // Import CSS file
import logoImage from '../../assets/LOGO.jpg';
import frontimage from "../../assets/SuccessfullyResetPassword.png";
import { useNavigate } from 'react-router-dom';

function SuccessfullyResetPassword() {
    const navigate = useNavigate();

    const handleContinue = () => {
        navigate('/'); // redirects to login page
    };

    return (
        <div className="container1">
            <form className="login-card">
                <div className="logo-container">
                    <img src={logoImage} alt="SmartStock Logo" className="logo-img" />
                    <h2 className="logo-title">SmartStock</h2>
                </div>

                <h2 className="subtitle">Password Changed <br />Successfully</h2>

                <div className="img-wrapper">
                    <img src={frontimage} alt="Verified" className="front-img" />
                </div>

                <button type="button" className="btn" onClick={handleContinue}>
                    Log in
                </button>
            </form>
        </div>
    );
}

export default SuccessfullyResetPassword;
