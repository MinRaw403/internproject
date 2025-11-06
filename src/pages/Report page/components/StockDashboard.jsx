"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "recharts";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./dashboard.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return dateString;
  }
};

const StockDashboard = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    supplier: "",
    category: "",
    documentType: "",
    search: "",
  });
  const [activeTab, setActiveTab] = useState("suppliers");
  const [kpiData, setKpiData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [itemData, setItemData] = useState([]);
  const [transactionData, setTransactionData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [departmentData, setDepartmentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchSuppliers();
    fetchItems();
    fetchTransactions();
    fetchCategories();
    fetchDepartments();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/dashboard");
      const data = await res.json();
      if (data.success) {
        setKpiData([
          { title: "Total Items in Stock", value: data.data.totalItems, icon: "📦", trend: "+2.5%" },
          { title: "Total Departments", value: data.data.totalDepartments, icon: "🏢", trend: "0%" },
          { title: "Purchase Orders", value: data.data.purchaseOrders, icon: "📄", trend: "+12%" },
          { title: "GRNs Received", value: data.data.grns, icon: "⬇️", trend: "+8%" },
          { title: "Issue Notes", value: data.data.issueNotes, icon: "⬆️", trend: "-3%" },
          { title: "Total Stock Value", value: `$${data.data.totalStockValue.toFixed(2)}`, icon: "💰", trend: "+5.2%" },
        ]);
      }
    } catch (err) {
      console.error("Error fetching dashboard:", err);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/suppliers");
      const data = await res.json();
      if (data.success) setSupplierData(data.suppliers);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/items");
      const data = await res.json();
      if (data.success) setItemData(data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/transactions");
      const data = await res.json();
      if (data.success) setTransactionData(data.transactions);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/categories");
      const data = await res.json();
      if (data.success) setCategoryData(data.categories);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/departments");
      const data = await res.json();
      if (data.success) setDepartmentData(data.departments);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const purchasesBySupplier = useMemo(() => {
    const totals = transactionData
        .filter((t) => t.type === "PO" || t.type === "GRN")
        .reduce((acc, t) => {
          const name = t.supplier || "Unknown";
          const amount = Number.parseFloat(t.amount) || 0;
          acc[name] = (acc[name] || 0) + amount;
          return acc;
        }, {});
    return Object.entries(totals).map(([name, value]) => ({ name, value }));
  }, [transactionData]);

  const stockByCategory = useMemo(() => {
    const counts = itemData.reduce((acc, i) => {
      const c = i.category || "Uncategorized";
      acc[c] = (acc[c] || 0) + 1;
      return acc;
    }, {});
    const COLORS = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
    return Object.entries(counts).map(([name, value], idx) => ({ name, value, color: COLORS[idx % COLORS.length] }));
  }, [itemData]);

  const monthlyMovement = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const data = transactionData.reduce((acc, t) => {
      if (t.type === "GRN" || t.type === "Issue") {
        const d = new Date(t.date);
        const m = months[d.getMonth()];
        if (!acc[m]) acc[m] = { month: m, grns: 0, issues: 0 };
        if (t.type === "GRN") acc[m].grns++;
        else acc[m].issues++;
      }
      return acc;
    }, {});
    return Object.values(data).sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
  }, [transactionData]);

  const handleFilterChange = (k, v) => setFilters({ ...filters, [k]: v });
  const resetFilters = () =>
      setFilters({ dateFrom: "", dateTo: "", supplier: "", category: "", documentType: "", search: "" });

  const handleExportPDF = () => {
    setExportLoading(true);
    try {
      const doc = new jsPDF();
      doc.text(`Stock Management System - ${activeTab.toUpperCase()} Report`, 14, 15);

      let headers = [],
          data = [];

      if (activeTab === "suppliers") {
        headers = ["Name", "Code", "Email", "Telephone", "Added On"];
        data = supplierData.map((s) => [s.name, s.code, s.email, s.tp1, formatDate(s.date)]);
      } else if (activeTab === "items") {
        headers = ["Description", "Code", "Category", "Unit Price", "Reorder", "Rack"];
        data = itemData.map((i) => [i.description, i.itemCode, i.category, i.unitPrice, i.reOrder, i.rackNumber]);
      } else if (activeTab === "categories") {
        headers = ["Category", "Code"];
        data = categoryData.map((c) => [c.description, c.code]);
      } else if (activeTab === "departments") {
        headers = ["Department", "Code", "Description"];
        data = departmentData.map((d) => [d.name, d.code, d.description]);
      } else if (activeTab === "transactions") {
        headers = ["Type", "Doc No", "Date", "Party", "Amount"];
        data = transactionData.map((t) => [t.type, t.docNo, formatDate(t.date), t.supplier || t.department, t.amount]);
      }

      autoTable(doc, {
        head: [headers],
        body: data,
        startY: 25,
      });

      doc.save(`${activeTab}_report.pdf`);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = () => {
    setExportLoading(true);
    try {
      let sheetData = [];
      if (activeTab === "suppliers") sheetData = supplierData;
      else if (activeTab === "items") sheetData = itemData;
      else if (activeTab === "categories") sheetData = categoryData;
      else if (activeTab === "departments") sheetData = departmentData;
      else if (activeTab === "transactions") sheetData = transactionData;

      const ws = XLSX.utils.json_to_sheet(sheetData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `${activeTab}`);
      const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buf], { type: "application/octet-stream" }), `${activeTab}_report.xlsx`);
    } finally {
      setExportLoading(false);
    }
  };

  const handlePrint = () => window.print();

  return (
      <div className="dashboard-container">
              <div className="dashboard-content">
          {/* Filters */}
          <div className="card card-filter">
            <div className="card-header">
              <h2 className="card-title">🔍 Filters & Search</h2>
            </div>
            <div className="card-content">
              <div className="filters-grid">
                <div className="filter-group">
                  <label className="filter-label">From Date</label>
                  <input
                      type="date"
                      className="input"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">To Date</label>
                  <input
                      type="date"
                      className="input"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label className="filter-label">Supplier</label>
                  <select
                      className="select"
                      value={filters.supplier}
                      onChange={(e) => handleFilterChange("supplier", e.target.value)}
                  >
                    <option value="">All Suppliers</option>
                    {supplierData.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.name}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Category</label>
                  <select
                      className="select"
                      value={filters.category}
                      onChange={(e) => handleFilterChange("category", e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categoryData.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.description}
                        </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label className="filter-label">Search</label>
                  <input
                      type="text"
                      className="input"
                      placeholder="Search items..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange("search", e.target.value)}
                  />
                </div>
              </div>
              <div className="filter-actions">
                <button onClick={resetFilters} className="btn btn-ghost">
                  🔄 Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* KPI */}
          <div>
            <h2 className="card-title" style={{ marginBottom: "1rem" }}>
              Key Performance Indicators
            </h2>
            <div className="kpi-grid">
              {kpiData.map((k, i) => (
                  <div key={i} className="kpi-card" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="kpi-header">
                      <h3 className="kpi-title">{k.title}</h3>
                      <span className="kpi-icon">{k.icon}</span>
                    </div>
                    <div className="kpi-content">
                      <div className="kpi-value">{k.value}</div>
                      <div className="kpi-change">
                    <span className={k.trend.startsWith("+") ? "trend-up" : "trend-down"}>
                      {k.trend.startsWith("+") ? "↑" : "↓"} {k.trend}
                    </span>
                        <span className="kpi-period">vs last month</span>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>

          {/* Tables */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">Detailed Reports</h2>
            </div>

            <div className="card-content">
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

              <div className="table-container">
                {activeTab === "suppliers" && (
                    <table className="table">
                      <thead>
                      <tr>
                        <th>Name</th>
                        <th>Code</th>
                        <th>Email</th>
                        <th>Telephone</th>
                      </tr>
                      </thead>
                      <tbody>
                      {supplierData.length > 0 ? (
                          supplierData.map((s) => (
                              <tr key={s.code}>
                                <td className="font-medium">{s.name}</td>
                                <td>{s.code}</td>
                                <td>{s.email}</td>
                                <td>{s.tp1}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="4" className="empty-state">
                              No suppliers found
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                )}
                {activeTab === "items" && (
                    <table className="table">
                      <thead>
                      <tr>
                        <th>Description</th>
                        <th>Code</th>
                        <th>Category</th>
                        <th>Unit Price</th>
                      </tr>
                      </thead>
                      <tbody>
                      {itemData.length > 0 ? (
                          itemData.map((i) => (
                              <tr key={i.itemCode}>
                                <td className="font-medium">{i.description}</td>
                                <td>{i.itemCode}</td>
                                <td>{i.category}</td>
                                <td>${i.unitPrice}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="4" className="empty-state">
                              No items found
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                )}
                {activeTab === "categories" && (
                    <table className="table">
                      <thead>
                      <tr>
                        <th>Category Name</th>
                        <th>Code</th>
                      </tr>
                      </thead>
                      <tbody>
                      {categoryData.length > 0 ? (
                          categoryData.map((c) => (
                              <tr key={c.code}>
                                <td className="font-medium">{c.description}</td>
                                <td>{c.code}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="2" className="empty-state">
                              No categories found
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                )}
                {activeTab === "departments" && (
                    <table className="table">
                      <thead>
                      <tr>
                        <th>Department Name</th>
                        <th>Code</th>
                        <th>Description</th>
                      </tr>
                      </thead>
                      <tbody>
                      {departmentData.length > 0 ? (
                          departmentData.map((d) => (
                              <tr key={d.code}>
                                <td className="font-medium">{d.name}</td>
                                <td>{d.code}</td>
                                <td>{d.description}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="3" className="empty-state">
                              No departments found
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                )}
                {activeTab === "transactions" && (
                    <table className="table">
                      <thead>
                      <tr>
                        <th>Type</th>
                        <th>Document No</th>
                        <th>Date</th>
                        <th>Party</th>
                        <th>Amount</th>
                      </tr>
                      </thead>
                      <tbody>
                      {transactionData.length > 0 ? (
                          transactionData.map((t) => (
                              <tr key={t.id}>
                                <td>
                                  <span className="badge badge-secondary">{t.type}</span>
                                </td>
                                <td className="font-medium">{t.docNo}</td>
                                <td>{formatDate(t.date)}</td>
                                <td>{t.supplier || t.department}</td>
                                <td>${t.amount}</td>
                              </tr>
                          ))
                      ) : (
                          <tr>
                            <td colSpan="5" className="empty-state">
                              No transactions found
                            </td>
                          </tr>
                      )}
                      </tbody>
                    </table>
                )}
              </div>
            </div>
          </div>

          {/* Charts */}
          <div>
            <h2 className="card-title" style={{ marginBottom: "1rem" }}>
              Analytics & Insights
            </h2>
            <div className="charts-grid">
              <div className="card card-chart">
                <div className="card-header">
                  <h2 className="card-title">Purchases by Supplier</h2>
                </div>
                <div className="card-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={purchasesBySupplier}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                          contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                      />
                      <Bar dataKey="value" fill="#1e40af" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card card-chart">
                <div className="card-header">
                  <h2 className="card-title">Stock by Category</h2>
                </div>
                <div className="card-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={stockByCategory} cx="50%" cy="50%" label dataKey="value">
                        {stockByCategory.map((e, i) => (
                            <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip
                          contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card card-chart">
                <div className="card-header">
                  <h2 className="card-title">Monthly Stock Movement</h2>
                </div>
                <div className="card-content">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyMovement}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                          contentStyle={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "0.5rem" }}
                      />
                      <Line type="monotone" dataKey="grns" stroke="#1e40af" strokeWidth={2} dot={{ fill: "#1e40af" }} />
                      <Line type="monotone" dataKey="issues" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Export & Print Card */}
          <div className="card card-export">
            <div className="card-header">
              <h2 className="card-title">📥 Export & Print</h2>
            </div>
            <div className="card-content">
              <p style={{ marginBottom: "1rem", color: "#64748b", fontSize: "0.9rem" }}>
                Export or print a report based on the currently selected tab in the "Detailed Reports" section.
              </p>
              <div className="export-buttons">
                <button onClick={handleExportPDF} className="btn btn-primary" disabled={exportLoading}>
                  {exportLoading ? "⏳ Exporting..." : "📄 Export as PDF"}
                </button>
                <button onClick={handleExportExcel} className="btn btn-outline" disabled={exportLoading}>
                  {exportLoading ? "⏳ Exporting..." : "📊 Export as Excel"}
                </button>
                <button onClick={handlePrint} className="btn btn-outline">
                  🖨️ Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

export default StockDashboard