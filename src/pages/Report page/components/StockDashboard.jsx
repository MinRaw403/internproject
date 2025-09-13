"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import "./dashboard.css"

const StockDashboard = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplier: "",
    category: "",
    documentType: "",
    search: "",
  })

  const [activeTab, setActiveTab] = useState("suppliers")

  // ✅ State for live API data
  const [kpiData, setKpiData] = useState([])
  const [supplierData, setSupplierData] = useState([])
  const [itemData, setItemData] = useState([])
  const [transactionData, setTransactionData] = useState([])

  // ✅ Fetch data on mount
  useEffect(() => {
    fetchDashboardData()
    fetchSuppliers()
    fetchItems()
    fetchTransactions()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard")
      const data = await res.json()
      if (data.success) {
        setKpiData([
          { title: "Total Items in Stock", value: data.data.totalItems, change: "+0%", trend: "up", icon: "📦" },
          { title: "Total Departments", value: data.data.totalDepartments, change: "+0%", trend: "up", icon: "🏢" },
          { title: "Purchase Orders", value: data.data.purchaseOrders, change: "+0%", trend: "up", icon: "📄" },
          { title: "GRNs Received", value: data.data.grns, change: "+0%", trend: "up", icon: "⬇️" },
          { title: "Issue Notes", value: data.data.issueNotes, change: "+0%", trend: "up", icon: "⬆️" },
          { title: "Total Stock Value", value: `$${data.data.totalStockValue}`, change: "+0%", trend: "up", icon: "💰" },
        ])
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/suppliers")
      const data = await res.json()
      if (data.success) setSupplierData(data.suppliers)
    } catch (err) {
      console.error("Error fetching suppliers:", err)
    }
  }

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/items")
      const data = await res.json()
      if (data.success) setItemData(data.items)
    } catch (err) {
      console.error("Error fetching items:", err)
    }
  }

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions")
      const data = await res.json()
      if (data.success) setTransactionData(data.transactions)
    } catch (err) {
      console.error("Error fetching transactions:", err)
    }
  }

  // ✅ Charts can stay static for now
  const purchasesBySupplier = [
    { name: "ABC Corp", value: 125000 },
    { name: "XYZ Ltd", value: 89000 },
    { name: "Global Supplies", value: 156000 },
    { name: "Tech Solutions", value: 78000 },
    { name: "Office Pro", value: 92000 },
  ]

  const stockByCategory = [
    { name: "Electronics", value: 35, color: "#3b82f6" },
    { name: "Furniture", value: 25, color: "#60a5fa" },
    { name: "Office Supplies", value: 20, color: "#93c5fd" },
    { name: "IT Equipment", value: 15, color: "#bfdbfe" },
    { name: "Others", value: 5, color: "#dbeafe" },
  ]

  const monthlyMovement = [
    { month: "Jan", grns: 45, issues: 38 },
    { month: "Feb", grns: 52, issues: 42 },
    { month: "Mar", grns: 48, issues: 45 },
    { month: "Apr", grns: 61, issues: 39 },
    { month: "May", grns: 55, issues: 48 },
    { month: "Jun", grns: 67, issues: 52 },
  ]

  const handleFilterChange = (key, value) => setFilters({ ...filters, [key]: value })
  const resetFilters = () =>
    setFilters({ dateFrom: "", dateTo: "", supplier: "", category: "", documentType: "", search: "" })

  const getStatusBadge = (status) => {
    const variants = {
      Active: "badge-default",
      Pending: "badge-secondary",
      Normal: "badge-default",
      "Low Stock": "badge-destructive",
      Completed: "badge-default",
      Received: "badge-default",
      Issued: "badge-secondary",
    }
    return <span className={`badge ${variants[status] || "badge-default"}`}>{status}</span>
  }

  const handleExportPDF = () => console.log("Exporting to PDF...")
  const handleExportExcel = () => console.log("Exporting to Excel...")
  const handlePrint = () => window.print()

  return (
    <div className="dashboard-container">
      <div className="dashboard-container">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <span className="menu-icon">☰</span>
              <h1 className="header-title">Stock Management System</h1>
            </div>
            <div className="header-right">
              <span className="header-subtitle">Dashboard Reports</span>
              <div className="user-avatar">A</div>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Filters Section */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">🔍 Filters & Search</h2>
            </div>
            <div className="card-content">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">From Date</label>
                  <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                      className="input"
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">To Date</label>
                  <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                      className="input"
                  />
                </div>

                <div className="filter-group">
                  <label className="filter-label">Supplier</label>
                  <select
                      value={filters.supplier}
                      onChange={(e) => handleFilterChange("supplier", e.target.value)}
                      className="select"
                  >
                    <option value="">Select a Supplier</option>
                    <option value="all">All Suppliers</option>
                    <option value="supplier1">ABC Corp</option>
                    <option value="supplier2">XYZ Ltd</option>
                    <option value="supplier3">Global Supplies</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                      className="select"
                  >
                    <option value="">Select a Category</option>
                    <option value="all">All Categories</option>
                    <option value="electronics">Electronics</option>
                    <option value="office">Office Supplies</option>
                    <option value="furniture">Furniture</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Document Type</label>
                  <select
                      value={filters.documentType}
                      onChange={(e) => handleFilterChange("documentType", e.target.value)}
                      className="select"
                  >
                    <option value="">Select a Document Type</option>
                    <option value="all">All Types</option>
                    <option value="po">Purchase Order</option>
                    <option value="grn">GRN</option>
                    <option value="issue">Issue Note</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label className="filter-label">Quick Search</label>
                  <input
                      type="text"
                      placeholder="Search items..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                      className="input"
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button onClick={resetFilters} className="btn btn-outline">
                  🔄 Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="kpi-grid">
            {kpiData.map((kpi, index) => (
                <div key={index} className="card kpi-card">
                  <div className="kpi-header">
                    <h3 className="kpi-title">{kpi.title}</h3>
                    <span className="kpi-icon">{kpi.icon}</span>
                  </div>
                  <div className="kpi-content">
                    <div className="kpi-value">{kpi.value}</div>
                    <div className="kpi-change">
                  <span className={`trend-icon ${kpi.trend === "up" ? "trend-up" : "trend-down"}`}>
                    {kpi.trend === "up" ? "📈" : "📉"}
                  </span>
                      <span className={kpi.trend === "up" ? "text-green-700" : "text-red-700"}>{kpi.change}</span>
                      <span className="kpi-period">from last month</span>
                    </div>
                  </div>
                </div>
            ))}
          </div>

          {/* Data Tables */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Detailed Reports</h2>
            </div>
            <div className="card-content">
              <div className="tabs">
                <div className="tabs-list">
                  {["suppliers", "items", "categories", "departments", "transactions"].map((tab) => (
                      <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`tabs-trigger ${activeTab === tab ? "active" : ""}`}
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </button>
                  ))}
                </div>

                {activeTab === "suppliers" && (
                    <div className="tabs-content">
                      <div className="table-header">
                        <h3 className="table-title">Supplier Report</h3>
                        <button className="btn btn-outline btn-sm">📥 Export</button>
                      </div>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                          <tr>
                            <th>Supplier Name</th>
                            <th>Total Purchases</th>
                            <th>GRNs</th>
                            <th>Outstanding</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                          {supplierData.map((supplier) => (
                              <tr key={supplier.id}>
                                <td className="font-medium">{supplier.name}</td>
                                <td>{supplier.totalPurchases}</td>
                                <td>{supplier.grns}</td>
                                <td>{supplier.outstanding}</td>
                                <td>{getStatusBadge(supplier.status)}</td>
                                <td>
                                  <button className="btn btn-ghost btn-sm">🗑️</button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}

                {activeTab === "items" && (
                    <div className="tabs-content">
                      <div className="table-header">
                        <h3 className="table-title">Item Report</h3>
                        <button className="btn btn-outline btn-sm">📥 Export</button>
                      </div>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Current Stock</th>
                            <th>Min/Max Stock</th>
                            <th>Value</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                          {itemData.map((item) => (
                              <tr key={item.id}>
                                <td className="font-medium">{item.name}</td>
                                <td>{item.category}</td>
                                <td>{item.stock}</td>
                                <td>
                                  {item.minStock} / {item.maxStock}
                                </td>
                                <td>{item.value}</td>
                                <td>{getStatusBadge(item.status)}</td>
                                <td>
                                  <button className="btn btn-ghost btn-sm">👁️</button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}

                {activeTab === "transactions" && (
                    <div className="tabs-content">
                      <div className="table-header">
                        <h3 className="table-title">Transaction Report</h3>
                        <button className="btn btn-outline btn-sm">📥 Export</button>
                      </div>
                      <div className="table-container">
                        <table className="table">
                          <thead>
                          <tr>
                            <th>Document Type</th>
                            <th>Document No.</th>
                            <th>Date</th>
                            <th>Supplier/Department</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                          {transactionData.map((transaction) => (
                              <tr key={transaction.id}>
                                <td className="font-medium">{transaction.type}</td>
                                <td>{transaction.docNo}</td>
                                <td>{transaction.date}</td>
                                <td>{transaction.supplier || transaction.department}</td>
                                <td>{transaction.amount}</td>
                                <td>{getStatusBadge(transaction.status)}</td>
                                <td>
                                  <button className="btn btn-ghost btn-sm">👁️</button>
                                </td>
                              </tr>
                          ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                )}

                {(activeTab === "categories" || activeTab === "departments") && (
                    <div className="tabs-content">
                      <div className="empty-state">
                        {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} report data will be displayed here
                      </div>
                    </div>
                )}
              </div>

              <div className="pagination">
                <div className="pagination-info">Showing 1-10 of 50 results</div>
                <div className="pagination-controls">
                  <button className="btn btn-outline btn-sm" disabled>
                    ← Previous
                  </button>
                  <button className="btn btn-outline btn-sm">Next →</button>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-grid">
            <div className="card chart-card-large">
              <div className="card-header">
                <h3 className="card-title">Purchases by Supplier</h3>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={purchasesBySupplier}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Purchases"]} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Stock by Category</h3>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                        data={stockByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                      {stockByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Monthly Stock Movement</h3>
              </div>
              <div className="card-content">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyMovement}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="grns" stroke="#3b82f6" strokeWidth={2} name="GRNs Received" />
                    <Line type="monotone" dataKey="issues" stroke="#60a5fa" strokeWidth={2} name="Issues" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Export Panel */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Export & Print Options</h3>
            </div>
            <div className="card-content">
              <div className="export-buttons">
                <button onClick={handleExportPDF} className="btn btn-primary">
                  📥 Export to PDF
                </button>
                <button onClick={handleExportExcel} className="btn btn-outline">
                  📊 Export to Excel
                </button>
                <button onClick={handlePrint} className="btn btn-outline">
                  🖨️ Print Report
                </button>
              </div>
              <p className="export-note">
                Export options will generate reports based on current filters and selected data ranges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StockDashboard
