"use client"

import { useEffect, useState } from "react"
import LayoutWithSidebar from "../pages/Sidebar/layout-with-sidebar"
import SideBarManager from "../pages/Sidebar/side-bar-manager"

export default function ConditionalLayout({ children }) {
  const [isManager, setIsManager] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is a manager from localStorage
    const managerStatus = localStorage.getItem("isManager")
    setIsManager(managerStatus === "true")
    setIsLoading(false)
  }, [])

  // Prevent flash of wrong sidebar while checking role
  if (isLoading) {
    return null
  }

  // Render appropriate sidebar based on role
  if (isManager) {
    return <SideBarManager>{children}</SideBarManager>
  }

  return <LayoutWithSidebar>{children}</LayoutWithSidebar>
}
