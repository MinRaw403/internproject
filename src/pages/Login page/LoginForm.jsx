import React, { useState } from 'react';
import './LoginPage.css';
import logoImage from '../../assets/LOGO.jpg';
import { Link, useNavigate } from 'react-router-dom';


function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Login successful');
                navigate('/main'); // ✅ redirect to Main Page
            } else {
                alert('Invalid email or password');
            }
        } catch (error) {
            console.error('Error connecting to server:', error);
            alert('Error connecting to server');
            console.error(error);
        }
    };

    return (
        <div className="login-container1">
            <form onSubmit={handleLogin} className="login-card">
                <div className="logo-container">
                    <img src={logoImage} alt="SmartStock Logo" className="logo-img" />
                    <h2 className="logo-title">SmartStock</h2>
                </div>

                <h3 className="litle">Log in to your account</h3>

                <label className="lable">Email</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input"
                    required
                />

                <label>Password</label>
                <div className="password-wrapper">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="eye-button"
                    />
                </div>

                <p className="forgotlink">
                    <Link to="/forgot-password" className="forgot">Forgot password</Link>
                </p>

                <p className="note">
                    Don’t have an account?<br />
                    <strong>Contact the manager</strong>
                </p>

                <button type="submit" className="login-btn">Log in</button>
            </form>
        </div>
    );
}

export default LoginPage;