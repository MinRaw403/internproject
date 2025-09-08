import React, { useState, useEffect } from 'react';
import './Purchaseorder.css';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import '../Issue Note page/custom-datepicker.css';

export default function PurchaseOrder() {
    /* ---------------------- state ---------------------- */
    // form fields
    const [supplier, setSupplier]   = useState('');
    const [issuedDate, setIssuedDate] = useState(new Date());
    const [itemCode, setItemCode]   = useState('');
    const [quantity, setQuantity]   = useState('');
    const [remarks, setRemarks]     = useState('');

    // master data lists
    const [suppliersList, setSuppliersList] = useState([]);
    const [itemsList, setItemsList]         = useState([]);

    // derived fields
    const [unit, setUnit]           = useState('');
    const [unitPrice, setUnitPrice] = useState(0);

    // preview & table
    const [currentEntry, setCurrentEntry] = useState(null);
    const [tableData, setTableData]       = useState([]);

    /* ------------------- data loading ------------------- */
    useEffect(() => {
        /* suppliers */
        axios.get('http://localhost:5000/api/suppliers')
            .then(res => {
                if (res.data.success) {
                    setSuppliersList(res.data.suppliers);
                    if (res.data.suppliers.length) {
                        setSupplier(res.data.suppliers[0].code);
                    }
                }
            })
            .catch(err => console.error('Error fetching suppliers', err));

        /* items */
        axios.get('http://localhost:5000/api/items')
            .then(res => {
                if (res.data.success) {
                    setItemsList(res.data.items);
                    if (res.data.items.length) {
                        const first = res.data.items[0];
                        setItemCode(first.itemCode);
                        setUnit(first.unit);
                        setUnitPrice(parseFloat(first.unitPrice || 0));
                    }
                }
            })
            .catch(err => console.error('Error fetching items', err));

        /* 🆕 existing purchase orders → fill table at load */
        axios.get('http://localhost:5000/api/purchase-orders')
            .then(res => {
                if (res.data.success) {
                    setTableData(res.data.orders);
                }
            })
            .catch(err => console.error('Error fetching POs', err));
    }, []);

    /* ------------------- handlers ------------------- */
    const handleSupplierChange = e => setSupplier(e.target.value);

    const handleItemChange = e => {
        const code = e.target.value;
        setItemCode(code);
        const selected = itemsList.find(it => it.itemCode === code);
        if (selected) {
            setUnit(selected.unit);
            setUnitPrice(parseFloat(selected.unitPrice || 0));
        }
    };

    const handleQuantityChange = e => setQuantity(e.target.value);
    const handleRemarksChange  = e => setRemarks(e.target.value);

    const clearEntryInputs = () => {
        setQuantity('');
        setRemarks('');
    };

    /* ---------------- Preview button ---------------- */
    const handlePreview = () => {
        if (!quantity || !itemCode) return;

        /* build the entry exactly like the backend schema */
        const poNum = 'PO' + Date.now();                         // 🆕 safe unique
        const selectedItem = itemsList.find(it => it.itemCode === itemCode);
        const supplierObj  = suppliersList.find(s => s.code === supplier) || {};

        const newEntry = {
            poNum,
            supplier: { code: supplier, name: supplierObj.name || '' },
            issuedDate: issuedDate.toISOString(),
            item: {
                itemCode:    selectedItem?.itemCode || itemCode,
                description: selectedItem?.description || '',
                unit,
                unitPrice,
            },
            quantity: Number(quantity),
            total: Number(quantity) * unitPrice,
            remarks,
        };

        setCurrentEntry(newEntry);
        clearEntryInputs();
    };

    /* ---------------- Confirm button ---------------- */
    const handleConfirm = async () => {
        if (!currentEntry) return;

        try {
            const { data } = await axios.post(
                'http://localhost:5000/api/purchase-orders',
                currentEntry
            );

            if (data.success) {
                // put the saved doc (with _id & timestamps) into the table
                setTableData(prev => [data.order, ...prev]);          // 🆕 newest first
                setCurrentEntry(null);
                alert('Order saved!');
            } else {
                throw new Error(data.message || 'Save failed');
            }
        } catch (err) {
            console.error('Save error', err);
            alert('Could not save order');
        }
    };

    /* ---------------- Delete preview ---------------- */
    const handleDeletePreview = () => setCurrentEntry(null);

    /* ------------------- render ------------------- */
    return (
        <div className="purchase-order-container">

            <div className="main-content">
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
                <p className="page-title">Purchase Order</p>

                {/* Input Section */}
                <div className="input-section card">
                    {/* Supplier */}
                    <div className="form-group">
                        <label htmlFor="supplier">Supplier</label>
                        <select id="supplier" value={supplier} onChange={handleSupplierChange}>
                            {suppliersList.map(s => (
                                <option key={s.code} value={s.code}>
                                    {`${s.code} - ${s.name}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Issued Date */}
                    <div className="form-group">
                        <label className="form-label">Issued Date</label>
                        <DatePicker
                            selected={issuedDate}
                            onChange={setIssuedDate}
                            className="form-input"
                            dateFormat="yyyy-MM-dd"
                        />
                    </div>

                    {/* Item */}
                    <div className="form-group">
                        <label htmlFor="item">Item</label>
                        <select id="item" value={itemCode} onChange={handleItemChange}>
                            {itemsList.map(it => (
                                <option key={it.itemCode} value={it.itemCode}>
                                    {`${it.itemCode} - ${it.description}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Quantity */}
                    <div className="form-group">
                        <label htmlFor="quantity">Quantity</label>
                        <input
                            type="number"
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                        />
                    </div>

                    {/* Remarks */}
                    <div className="form-group full-width">
                        <label htmlFor="remarks">Remarks</label>
                        <textarea
                            id="remarks"
                            value={remarks}
                            onChange={handleRemarksChange}
                        ></textarea>
                    </div>

                    {/* Buttons */}
                    <div className="button-group">
                        <button className="clear-button" onClick={clearEntryInputs}>
                            Clear
                        </button>
                        <button className="add-button" onClick={handlePreview}>
                            Preview
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                {currentEntry && (
                    <div className="purchase-details-section card">
                        <div className="detail-row">
                            <div className="detail-item">
                                Purchasing No : <span>{currentEntry.poNum}</span>
                            </div>
                            <div className="detail-item">
                                Unit : <span>{currentEntry.item.unit}</span>
                            </div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-item">
                                Item :{' '}
                                <span>
                  {currentEntry.item.itemCode} - {currentEntry.item.description}
                </span>
                            </div>
                            <div className="detail-item">
                                Total : <span>{currentEntry.total.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="detail-row">
                            <div className="detail-item">
                                Quantity : <span>{currentEntry.quantity}</span>
                            </div>
                        </div>
                        <div className="button-group">
                            <button className="delete-button" onClick={handleDeletePreview}>
                                Delete
                            </button>
                            <button className="confirm-button" onClick={handleConfirm}>
                                Confirm
                            </button>
                        </div>
                    </div>
                )}

                {/* Table Section */}
                <div className="table-section card">
                    <table>
                        <thead>
                        <tr>
                            <th>PO Num</th>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit</th>
                            <th>Total</th>
                            <th>Ordered Date</th>
                            <th>Remarks</th>
                        </tr>
                        </thead>
                        <tbody>
                        {tableData.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    No purchase orders added yet.
                                </td>
                            </tr>
                        ) : (
                            tableData.map(row => (
                                <tr key={row._id /* comes from MongoDB */}>
                                    <td>{row.poNum}</td>
                                    <td>
                                        {row.item.itemCode} - {row.item.description}
                                    </td>
                                    <td>{row.quantity}</td>
                                    <td>{row.item.unit}</td>
                                    <td>{row.total.toFixed(2)}</td>
                                    <td>{row.issuedDate.slice(0, 10)}</td>
                                    <td>{row.remarks}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
