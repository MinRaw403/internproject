"use client"

import { useNavigate, useLocation } from "react-router-dom"
import "./sidebar.css"

export default function LayoutWithSidebar({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { path: "/main", label: "Dashboard", icon: "🏠" },
    { path: "/categories", label: "Categories", icon: "📁" },
    { path: "/details", label: "Items", icon: "📦" },
    { path: "/suppliers", label: "Suppliers", icon: "🏢" },
    { path: "/purchase-order", label: "Purchase Order", icon: "🛒" },
    { path: "/grn", label: "GRN", icon: "📋" },
    { path: "/issue-note", label: "Issue Note", icon: "📝" },
    { path: "/department", label: "Department", icon: "👥" },
    { path: "/report", label: "Reports", icon: "📊" },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>SMARTSTOCK</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>
      <main className="main-layout-content">{children}</main>
    </div>
  )
}
