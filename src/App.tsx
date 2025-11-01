import "./App.css"
import "./index.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

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
import Department from "./pages/Department/DepartmentManagement"

// 📊 Reports
import Report from "./pages/Report page/components/StockDashboard"

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔐 Authentication */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/create-account" element={<Account />} />
        <Route path="/forgot-password" element={<Fogotpasswordpage1 />} />
        <Route path="/verify" element={<VerificationPage />} />
        <Route path="/reset-password" element={<Passwordresetpage />} />
        <Route path="/email-verified" element={<EmailVerifiedpage />} />
        <Route path="/success-reset" element={<SuccessfullyResetPassword />} />

        {/* 🔧 Main Application */}
        <Route path="/main" element={<MainPage />} />

        {/* 🛒 Item Pages */}
        <Route path="/item/:itemCode" element={<ItemPage />} />
        <Route path="/edit-item" element={<EditItemForm />} />
        <Route path="/details" element={<ItemDetailsPage />} />

        {/* 🗃️ Category Management */}
        <Route path="/categories" element={<CategoryPage />} />
        <Route path="/categories/add" element={<AddCategoryForm />} />
        <Route path="/categories/edit" element={<EditCategoryForm />} />

        {/* 👥 Supplier Management */}
        <Route path="/suppliers" element={<SuppliersPage />} />

        {/* 🧾 Issue Note */}
        <Route path="/issue-note" element={<IssueNoteWrapper />} />

        {/* 💵 Purchase Order */}
        <Route path="/purchase-order" element={<PurchaseOrder />} />

        {/* 📦 GRN Pages */}
        {/* GRN Page */}
        <Route path="/grn" element={<GRNPage />} />

        {/* fallback or default route */}
        <Route path="*" element={<div>Page not found</div>} />
        {/* 🏢 Department */}
        <Route path="/department" element={<Department />} />

        {/* 📊 Reports */}
        <Route path="/report" element={<Report />} />
      </Routes>
    </Router>
  )
}

export default App
