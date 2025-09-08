import React, { useState } from 'react';
import './Fogotpasswordpage1.css';
import logoImage from '../../assets/LOGO.jpg';
import FGImage from '../../assets/fogotpasswordpage1image.jpg';
import { useNavigate } from 'react-router-dom';

function FogotpasswordPage1() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('OTP sent to your email.');
                navigate('/verify', { state: { email } });
            } else {
                // ✅ Show backend error message if provided
                alert(data.message || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
            alert('Error connecting to server');
        }
    };

    return (
        <div className="container1">
            <form onSubmit={handleSubmit} className="login-card">
                <div className="logo-container">
                    <img src={logoImage} alt="SmartStock Logo" className="logo-img" />
                    <h2>SmartStock</h2>
                </div>

                <div className="img-wrapper">
                    <img src={FGImage} alt="SmartStock" className="front-img" />
                </div>

                <p className="subtitle">Forgot Password?</p>
                <p className="note">
                    Don’t worry! It happens. Please enter the email address <br />
                    associated with your account. Enter your email and submit it.
                </p>

                <label style={{ marginBottom: '8px', display: 'inline-block' }}>Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                />

                <p className="note2">
                    Don’t have an account?<br />
                    <strong>Contact the manager</strong>
                </p>

                <button type="submit" className="submit-btn">Submit</button>
            </form>
        </div>
    );
}

export default FogotpasswordPage1;
