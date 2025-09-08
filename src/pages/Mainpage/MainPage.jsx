import React from 'react';
import { Link } from 'react-router-dom';
import './MainPage.css';

import suppliersImg from '../../images/Suppliers.png';
import itemsCategoryImg from '../../images/itemsCatedotys.png';
import itemsImg from '../../images/items.png';
import departmentImg from '../../images/Department.png';
import reportsImg from '../../images/Reports.png';
import purchaseOrderImg from '../../images/PurchaseOrder.png';
import grnImg from '../../images/GRN.png';
import issueNoteImg from '../../images/Issuenote.png';

const cards = [
    { title: 'Suppliers', image: suppliersImg },
    { title: 'Items Category', image: itemsCategoryImg },
    { title: 'Items', image: itemsImg },
    { title: 'Department', image: departmentImg },
    { title: 'Report', image: reportsImg },
    { title: 'Purchase Order', image: purchaseOrderImg },
    { title: 'GRN', image: grnImg },
    { title: 'Issue note', image: issueNoteImg },
];

const row1 = cards.slice(0, 3);
const row2 = cards.slice(3, 5);
const row3 = cards.slice(5);

function MainPage() {
    const renderCard = (card, index) => {
        let linkTo = null;

        if (card.title === 'Items Category') {
            linkTo = '/categories';
        } else if (card.title === 'Suppliers') {
            linkTo = '/suppliers';
        } else if (card.title === 'Items') {
            linkTo = '/details';
        } else if (card.title === 'Issue note') {
            linkTo = '/issue-note';
        } else if (card.title === 'Purchase Order') {
            linkTo = '/purchase-order';
        }
        else if (card.title === 'GRN') {
            linkTo = '/GRN';
        }



        if (linkTo) {
            return (
                <Link to={linkTo} key={index} className="dashboard-card-link">
                    <div className="dashboard-card">
                        <img src={card.image} alt={card.title} className="card-img" />
                        <p className="card-title">{card.title}</p>
                    </div>
                </Link>
            );
        }

        return (
            <div className="dashboard-card" key={index}>
                <img src={card.image} alt={card.title} className="card-img" />
                <p className="card-title">{card.title}</p>
            </div>
        );
    };

    return (
        <div className="main-container">
            <header className="header">
                <div className="header-left">
                    <div className="hamburger-menu">
                        <div className="bar"></div>
                        <div className="bar"></div>
                        <div className="bar"></div>
                    </div>
                    <span className="app-title">SMARTSTOCK(PVT) LTD</span>
                </div>
            </header>

            <h2 className="dashboard-title">Stock Management System Dashboard</h2>

            <div className="card-row">{row1.map(renderCard)}</div>
            <div className="card-row">{row2.map(renderCard)}</div>
            <div className="card-row">{row3.map(renderCard)}</div>

            <footer className="footer">
                <div className="footer-section company-info">
                    <div className="black-box"></div>
                    <p>
                        Built with precision, powered by innovation. Delivering smart, scalable,
                        and seamless stock management solutions for the future of business.
                    </p>
                </div>
                <div className="footer-section quick-links"></div>
                <div className="footer-section newsletter">
                    <h4>Subscribe to our newsletter</h4>
                    <p>The latest news, articles, and resources, sent to your inbox weekly.</p>
                    <div className="subscribe">
                        <input type="email" placeholder="Enter your email" />
                        <button>Submit</button>
                    </div>
                </div>
            </footer>

            <div className="copyright">
                Copyright 2025 © Proxima Technologies Pvt.Ltd. All Right Reserved.
            </div>
        </div>
    );
}

export default MainPage;
