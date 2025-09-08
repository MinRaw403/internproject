// VerificationPage.jsx
import React, { useState } from 'react';
import './VerificationPage.css';
import mailImage from '../../assets/verificationpageimg.jpg';
import logoImage from '../../assets/LOGO.jpg';
import { useLocation, useNavigate } from 'react-router-dom';

function VerificationPage() {
    const [code, setCode] = useState(['', '', '', '']);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (!isNaN(value) && value.length <= 1) {
            const newCode = [...code];
            newCode[index] = value;
            setCode(newCode);
            if (value !== '' && index < 3) {
                document.getElementById(`code-${index + 1}`).focus();
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpCode = code.join('');

        try {
            const response = await fetch('http://localhost:5000/api/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                navigate('/email-verified', { state: { email } });
            } else {
                alert('Invalid OTP');
            }
        } catch (err) {
            console.error('Error verifying OTP:', err);
            alert('Server error');
        }
    };

    return (
        <div className="container1">
            <div className="verify-card">
                <div className="logo-container">
                    <img src={logoImage} alt="SmartStock Logo" className="logo-img" />
                    <h2 className="logo-title">SmartStock</h2>
                </div>
                <img src={mailImage} alt="Verification" className="front-img" />
                <h3 className="verify-title">Verification Code</h3>
                <p className="verify-subtitle">Confirm With Code</p>
                <form onSubmit={handleSubmit} className="code-form">
                    <div className="code-inputs">
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                id={`code-${index}`}
                                type="text"
                                maxLength="1"
                                className="code-box"
                                value={digit}
                                onChange={(e) => handleChange(e, index)}
                            />
                        ))}
                    </div>
                    <p className="resend">Resend Code</p>
                    <button type="submit" className="verify-btn">Verify</button>
                </form>
            </div>
        </div>
    );
}

export default VerificationPage;