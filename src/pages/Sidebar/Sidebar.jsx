import "./Sidebar.css";
import { NavLink } from "react-router-dom";

const Sidebar = () => (
    <div className="sidebar">
        <p className="brand">SMARTSTOCK<br />(PVT)LTD</p>
        <hr />
        <ul>
            <li><NavLink to="/main">Home</NavLink></li>
            <li><NavLink to="/suppliers">Suppliers</NavLink></li>
            <li><NavLink to="/details">Items</NavLink></li>
            <li><NavLink to="/categories">Items Category</NavLink></li>
            <li><NavLink to="/issue-note">Issue Note</NavLink></li>
            <li><NavLink to="/purchase-order">Purchase Order</NavLink></li>
            <li><NavLink to="/departments">Department</NavLink></li>
            <li><NavLink to="/GRN">GRN</NavLink></li>
            <li><NavLink to="/Report">Report</NavLink></li>
        </ul>
    </div>
);

export default Sidebar;
