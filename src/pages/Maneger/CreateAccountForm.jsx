//src/pages/CreateAccountForm.jsx
"use client"

import { useState } from "react"
import "./CreateAccountForm.css"

export default function CreateAccountForm() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        username: "",
        role: "employee",
        department: "",
        password: "",
        confirmPassword: "",
    })

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [errors, setErrors] = useState({})

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
        if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
        if (!formData.email.trim()) newErrors.email = "Email is required"
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
        if (!formData.username.trim()) newErrors.username = "Username is required"
        if (!formData.department.trim()) newErrors.department = "Department is required"
        if (!formData.password) newErrors.password = "Password is required"
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"

        return newErrors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newErrors = validateForm()
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch("http://localhost:5000/api/create-account", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    username: formData.username,
                    role: formData.role,
                    department: formData.department,
                    password: formData.password,
                }),
            })

            const result = await response.json()

            if (result.success) {
                setShowSuccess(true)
                console.log("✅ User created successfully:", result.user)

                // Reset form after success
                setTimeout(() => {
                    setFormData({
                        firstName: "",
                        lastName: "",
                        email: "",
                        username: "",
                        role: "employee",
                        department: "",
                        password: "",
                        confirmPassword: "",
                    })
                    setShowSuccess(false)
                }, 2000)
            } else {
                // Handle server errors
                setErrors({ general: result.message || "Failed to create account" })
            }
        } catch (error) {
            console.error("❌ Error creating account:", error)
            setErrors({ general: "Network error. Please check if the server is running." })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="create-account-container">
            <div className="form-header">
                <div className="icon-container">
                    <svg className="user-plus-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="19" y1="8" x2="19" y2="14" />
                        <line x1="22" y1="11" x2="16" y2="11" />
                    </svg>
                </div>
                <h2>Create New User Account</h2>
                <p>Add a new team member to SmartStock system</p>
            </div>

            {showSuccess && (
                <div className="success-message">
                    <div className="success-icon">✓</div>
                    <span>Account created successfully!</span>
                </div>
            )}

            {errors.general && (
                <div className="error-message">
                    <div className="error-icon">⚠</div>
                    <span>{errors.general}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="account-form">
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={errors.firstName ? "error" : ""}
                            placeholder="Enter first name"
                        />
                        {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={errors.lastName ? "error" : ""}
                            placeholder="Enter last name"
                        />
                        {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={errors.email ? "error" : ""}
                        placeholder="Enter email address"
                    />
                    {errors.email && <span className="error-text">{errors.email}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className={errors.username ? "error" : ""}
                            placeholder="Enter username"
                        />
                        {errors.username && <span className="error-text">{errors.username}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Role</label>
                        <select id="role" name="role" value={formData.role} onChange={handleInputChange}>
                            <option value="employee">Employee</option>
                            <option value="supervisor">Supervisor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className={errors.department ? "error" : ""}
                        placeholder="Enter department"
                    />
                    {errors.department && <span className="error-text">{errors.department}</span>}
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={errors.password ? "error" : ""}
                            placeholder="Enter password"
                        />
                        {errors.password && <span className="error-text">{errors.password}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={errors.confirmPassword ? "error" : ""}
                            placeholder="Confirm password"
                        />
                        {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
                    </div>
                </div>

                <button type="submit" className={`submit-btn ${isSubmitting ? "submitting" : ""}`} disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <div className="spinner"></div>
                            Creating Account...
                        </>
                    ) : (
                        "Create Account"
                    )}
                </button>
            </form>
        </div>
    )
}
