import "./App.css"
import "./index.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"

// Pages
import LoginPage from "./pages/Login page/LoginForm"
import MainPage from "./pages/Mainpage/MainPage"
import Fogotpasswordpage1 from "./pages/Fogotpasswordpages/fogotpasswordpage1"
import VerificationPage from "./pages/Fogotpasswordpages/VerificationPage"
import Passwordresetpage from "./pages/Fogotpasswordpages/Passwordresetpage"
import EmailVerifiedpage from "./pages/Fogotpasswordpages/EmailVerifiedpage"
import SuccessfullyResetPassword from "./pages/Fogotpasswordpages/SuccessfullyResetPassword"
import ItemDetailsPage from "./pages/Items Add pages/ItemDetailsPage"
import ItemPage from "./pages/Items Add pages/ItemPage"
import EditItemForm from "./pages/Items Add pages/EditItemForm"
import CategoryPage from "./pages/Categories Add pages/category"
import AddCategoryForm from "./pages/Categories Add pages/add"
import SuppliersPage from "./pages/SupplierAddpages/SuppliersPage"
import Issuenote from "./pages/Issue Note page/Issuenote"
import PurchaseOrder from "./pages/Purchase Order page/Purchaseorder"
import GRN from "./pages/GRN/GRN"
import Account from "./pages/Maneger/CreateAccountForm"
import Department from "./pages/Department/DepartmentManagement"
import Report from "./pages/Report page/components/StockDashboard"

function App() {
    return (
        <Router>
            <Routes>
                {/* 🔐 Authentication*/}
                <Route path="/" element={<LoginPage />} />
                <Route path="/create-account" element={<Account />} /> {/* for manager*/}
                <Route path="/forgot-password" element={<Fogotpasswordpage1 />} />
                <Route path="/verify" element={<VerificationPage />} />
                <Route path="/reset-password" element={<Passwordresetpage />} />
                <Route path="/email-verified" element={<EmailVerifiedpage />} />
                <Route path="/success-reset" element={<SuccessfullyResetPassword />} />
                {/* 🔧 Main Application */}
                <Route path="/main" element={<MainPage />} />
                <Route path="/item/:itemCode" element={<ItemPage />} />
                <Route path="/edit-item" element={<EditItemForm />} />
                <Route path="/details" element={<ItemDetailsPage />} />
                {/* 🗃️ Category Management */}
                <Route path="/categories" element={<CategoryPage />} />
                <Route path="/add" element={<AddCategoryForm />} />
                {/* 👥 Supplier Management */}
                <Route path="/suppliers" element={<SuppliersPage />} />
                {/* 🧾 Issue Note Page */}
                <Route path="/issue-note" element={<Issuenote />} /> {/* ✅ Added */}
                {/* 💵 Purchase Order Page*/}
                <Route path="/purchase-order" element={<PurchaseOrder />} />
                <Route path="/GRN" element={<GRN />} />
                <Route path="/department" element={<Department />} />
                <Route path="/report" element={<Report />} />


            </Routes>
        </Router>
    )
}

export default App
