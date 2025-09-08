import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './ItemPage.css';

const ItemPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const item = location.state?.item || {};

    const handleDelete = async () => {
        console.log("🧪 Deleting item:", item);
        const confirmDelete = window.confirm("Are you sure you want to delete selected Item?");
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5000/api/items/${item.itemCode}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Item deleted successfully!');
                navigate('/details', { state: { deletedItemCode: item.itemCode } });
            } else {
                alert('Failed to delete item: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item. Please try again.');
        }
    };


    if (!item.itemCode) {
        return (
            <div className="item-page-container">
                <header className="item-page-header">
                    <h2>Item Details</h2>
                </header>
                <div className="item-page-content">
                    <p>No item data found. Please go back and select an item.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="item-page-container">
            <header className="item-page-header">
                <h2>Item Details: {item.itemCode}</h2>
                <div className="item-actions">
                    <button className="edit-button" onClick={() => navigate('/edit-item', { state: { item } })}>
                        Edit Item
                    </button>
                    <button className="delete-button" onClick={handleDelete}>
                        Remove Item
                    </button>
                </div>
            </header>

            <main className="item-page-content layout-split">
                {item.imagePath && (
                    <div className="image-preview">
                        <img
                            src={`http://localhost:5000${item.imagePath}`}
                            alt="Item"
                            className="item-preview-image"
                        />
                    </div>
                )}

                <div className="item-details">
                    <div className="detail-row">
                        <strong>Category:</strong> <span>{item.category}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Item Code:</strong> <span>{item.itemCode}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Unit Price:</strong> <span>{item.unitPrice}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Units:</strong> <span>{item.unit}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Supplier:</strong> <span>{item.supplier}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Re - Order:</strong> <span>{item.reOrder || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                        <strong>Rack:</strong> <span>{item.rackNumber}</span>
                    </div>
                    <div className="detail-row description-detail">
                        <strong>Description : <span>{item.description}</span></strong>

                    </div>
                </div>
            </main>



            <footer className="item-page-footer">
                <p>Detailed view for {item.itemCode}</p>
            </footer>
        </div>
    );
};

export default ItemPage;