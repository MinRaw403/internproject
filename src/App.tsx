import "./App.css"
import "./index.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import ConditionalLayout from "./components/conditional-layout"

// Pages

// 🔐 Authentication
import LoginPage from "./pages/Login page/LoginForm"
import Account from "./pages/Maneger/CreateAccountForm"
import Fogotpasswordpage1 from "./pages/Fogotpasswordpages/fogotpasswordpage1"
import VerificationPage from "./pages/Fogotpasswordpages/VerificationPage"
import Passwordresetpage from "./pages/Fogotpasswordpages/Passwordresetpage"
import EmailVerifiedpage from "./pages/Fogotpasswordpages/EmailVerifiedpage"
import SuccessfullyResetPassword from "./pages/Fogotpasswordpages/SuccessfullyResetPassword"

// 🔧 Main Application
import MainPage from "./pages/Mainpage/MainPage"

// 🛒 Items
import ItemPage from "./pages/Items Add pages/ItemPage"
import EditItemForm from "./pages/Items Add pages/EditItemForm"
import ItemDetailsPage from "./pages/Items Add pages/ItemDetailsPage"

// 🗃️ Category Management
import CategoryPage from "./pages/Categories Add pages/category"
import AddCategoryForm from "./pages/Categories Add pages/add"
import EditCategoryForm from "./pages/Categories Add pages/EditCategoryForm"

// 👥 Supplier Management
import SuppliersPage from "./pages/SupplierAddpages/SuppliersPage"

// 🧾 Issue Note
import IssueNoteWrapper from "./pages/IssueNotePage/IssueNoteWrapper"

// 💵 Purchase Order
import PurchaseOrder from "./pages/Purchase Order page/Purchaseorder"

// 📦 GRN
import GRNPage from "./pages/GRN/GRNPage"

// 🏢 Department
import DepartmentManagement from "./pages/Department/DepartmentManagement"

// 📊 Reports
import Report from "./pages/Report page/components/StockDashboard"

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Authentication - No Sidebar */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<Fogotpasswordpage1 />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/reset-password" element={<Passwordresetpage />} />
        <Route path="/email-verified" element={<EmailVerifiedpage />} />
        <Route path="/success-reset" element={<SuccessfullyResetPassword />} />

        {/* 🔧 Main Application - With Conditional Sidebar */}
        <Route
          path="/main"
          element={
            <ConditionalLayout>
              <MainPage />
            </ConditionalLayout>
          }
        />

        {/* 🛒 Item Pages - With Conditional Sidebar */}
        <Route
          path="/item/:itemCode"
          element={
            <ConditionalLayout>
              <ItemPage />
            </ConditionalLayout>
          }
        />
        <Route
          path="/edit-item"
          element={
            <ConditionalLayout>
              <EditItemForm />
            </ConditionalLayout>
          }
        />
        <Route
          path="/details"
          element={
            <ConditionalLayout>
              <ItemDetailsPage />
            </ConditionalLayout>
          }
        />

        {/* 🗃️ Category Management - With Conditional Sidebar */}
        <Route
          path="/categories"
          element={
            <ConditionalLayout>
              <CategoryPage />
            </ConditionalLayout>
          }
        />
        <Route
          path="/categories/add"
          element={
            <ConditionalLayout>
              <AddCategoryForm />
            </ConditionalLayout>
          }
        />
        <Route
          path="/categories/edit"
          element={
            <ConditionalLayout>
              <EditCategoryForm />
            </ConditionalLayout>
          }
        />

        {/* 👥 Supplier Management - With Conditional Sidebar */}
        <Route
          path="/suppliers"
          element={
            <ConditionalLayout>
              <SuppliersPage />
            </ConditionalLayout>
          }
        />

        {/* 🧾 Issue Note - With Conditional Sidebar */}
        <Route
          path="/issue-note"
          element={
            <ConditionalLayout>
              <IssueNoteWrapper />
            </ConditionalLayout>
          }
        />

        {/* 💵 Purchase Order - With Conditional Sidebar */}
        <Route
          path="/purchase-order"
          element={
            <ConditionalLayout>
              <PurchaseOrder />
            </ConditionalLayout>
          }
        />

        {/* 📦 GRN Pages - With Conditional Sidebar */}
        <Route
          path="/grn"
          element={
            <ConditionalLayout>
              <GRNPage />
            </ConditionalLayout>
          }
        />

        {/* 🏢 Department - With Conditional Sidebar */}
        <Route
          path="/department"
          element={
            <ConditionalLayout>
              <DepartmentManagement />
            </ConditionalLayout>
          }
        />

        {/* 📊 Reports - With Conditional Sidebar */}
        <Route
          path="/report"
          element={
            <ConditionalLayout>
              <Report />
            </ConditionalLayout>
          }
        />

        {/* 👤 Create Account - Manager Only (With Conditional Sidebar) */}
        <Route
          path="/create-account"
          element={
            <ConditionalLayout>
              <Account />
            </ConditionalLayout>
          }
        />

        {/* fallback or default route */}
        <Route path="*" element={<div>Page not found</div>} />
      </Routes>
    </Router>
  )
}

export default App
