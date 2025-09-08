// EmailVerifiedpage.jsx
import React from 'react';
import './EmailVerifiedpage.css';
import logoImage from '../../assets/LOGO.jpg';
import frontimage from "../../assets/Verified.png";
import { useNavigate, useLocation } from 'react-router-dom';

function EmailVerifiedpage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        return <p style={{ color: 'red', padding: '20px' }}>❌ Email not found. Please go back and try again.</p>;
    }

    return (
        <div className="container1">
            <form className="login-card">
                <div className="logo-container">
                    <img src={logoImage} alt="SmartStock Logo" className="logo-img" />
                    <h2 className="logo-title">SmartStock</h2>
                </div>
                <div className="img-wrapper">
                    <img src={frontimage} alt="Verified" className="front-img" />
                </div>
                <div >
                    <h2 id="subtitle">Email Verified</h2>
                </div>
                <p className="note1">Congratulations, your Email Address <br />has been verified.</p>
                <button type="button" className="btn1" onClick={() => navigate('/reset-password', { state: { email } })}>
                    Reset password
                </button>
                <button type="button" className="btn2" onClick={() => navigate('/main')}>
                    Continue
                </button>
            </form>
        </div>
    );
}

export default EmailVerifiedpage;