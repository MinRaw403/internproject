// Passwordresetpage.jsx
import React, { useState } from 'react';
import './Passwordresetpage.css';
import logoImage from '../../assets/LOGO.jpg';
import { useNavigate, useLocation } from 'react-router-dom';

function Passwordresetpage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email;

    if (!email) {
        return <p style={{ color: 'red', padding: '20px' }}>❌ Email not found. Please go back and try again.</p>;
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            alert('Passwords do not match!');
            setNewPassword('');
            setConfirmPassword('');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await response.json();
            if (response.ok && data.success) {
                alert('✅ Password reset successful');
                navigate('/success');
            } else {
                alert(data.message || '❌ Failed to reset password');
            }
        } catch (err) {
            console.error('Error:', err);
            alert('Server error');
        }
    };

    return (
        <div className="container1">
            <form onSubmit={handlePasswordChange} className="login-card">
                <div className="logo-container">
                    <img src={logoImage} alt="SmartStock Logo" className="logo-img" />
                    <h2 className="logo-title">SmartStock</h2>
                </div>
                <h2 className="subtitle" style={{ marginTop: '40px' }}>Reset Password?</h2>
                <label>New Password</label>
                <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input"
                    required
                />
                <label>Confirm Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="eye-button"
                    />
                </div>
                <button type="submit" className="Change_Password-btn">Change Password</button>
            </form>
        </div>
    );
}

export default Passwordresetpage;
