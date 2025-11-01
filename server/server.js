//server/server.js
// internproject/server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const multer = require("multer");
const path = require("path");

// Models
const User = require("./models/User");
const Item = require("./models/Item");
const Supplier = require("./models/Supplier");
const Category = require("./models/Category");
const IssueNote = require("./models/IssueNote");
const PurchaseOrder = require("./models/PurchaseOrder");
const Grn = require("./models/Grn");
const Department = require("./models/Department");
const Maneger = require("./models/Maneger");

const app = express()

require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// ✅ Connect to MongoDB
mongoose
    .connect("mongodb://localhost:27017/yourDB")
    .then(() => console.log("✅ MongoDB connected"))
    .catch((err) => console.error("❌ MongoDB connection error:", err))

// ✅ In-memory store for OTPs (Temporary - don't use in production)
const otpStore = {}

// ✅ Multer config for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads")) // ✅ Fixed path
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname
        cb(null, uniqueName)
    },
})
const upload = multer({ storage })

// ✅ Upload Item API
app.post("/api/upload-item", upload.single("image"), async (req, res) => {
    const { category, unitPrice, itemCode, unit, rackNumber, supplier, reOrder, description } = req.body

    // ✅ Debug logs
    console.log("🟢 Form submitted")
    console.log("Request body:", req.body)
    console.log("Uploaded file:", req.file)

    try {
        const newItem = new Item({
            category,
            unitPrice,
            itemCode,
            unit,
            imagePath: req.file ? "/uploads/" + req.file.filename : "",
            rackNumber,
            supplier,
            reOrder,
            description,
        })

        await newItem.save()
        res.status(201).json({ success: true, message: "Item saved successfully", item: newItem })
    } catch (err) {
        console.error("❌ Error saving item:", err)
        res.status(500).json({ success: false, message: "Server error while saving item" })
    }
})

// ✅ Get All Items API
app.get("/api/items", async (req, res) => {
    try {
        const items = await Item.find()
        res.json({ success: true, items })
    } catch (err) {
        console.error("Error fetching items:", err)
        res.status(500).json({ success: false, message: "Server error" })
    }
})

// GET /api/items/search?q=<query>
app.get("/api/items/search", async (req, res) => {
  try {
    const q = req.query.q || "";
    const regex = new RegExp(q, "i"); // case-insensitive search
    const items = await Item.find({
      $or: [
        { itemCode: regex },
        { description: regex },
        { rackNumber: regex },
      ],
    }).limit(20); // limit for scalability
    res.json({ success: true, items });
  } catch (err) {
    console.error("❌ Search error:", err);
    res.json({ success: false, items: [] });
  }
});


// ✅ Login route (Managers + Users)
app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Try manager first
        const manager = await Maneger.findOne({ email, password });
        if (manager) {
            return res.json({
                success: true,
                isManager: true,
                message: "Manager login successful",
            });
        }

        // Then regular user
        const user = await User.findOne({ email, password });
        if (user) {
            return res.json({
                success: true,
                isManager: false,
                message: "User login successful",
            });
        }

        // None matched
        res.status(401).json({ success: false, message: "Invalid credentials" });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Create account (User + Manager)
app.post("/api/create-account", async (req, res) => {
    const { firstName, lastName, email, username, role, department, password } = req.body;

    try {
        // Check if email already exists in either collection
        const existingUser = await User.findOne({ email });
        const existingManager = await Maneger.findOne({ email });

        if (existingUser || existingManager) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        let createdAccount;

        // ✅ If role is Manager or Admin → Save in Maneger collection
        if (role === "manager" || role === "admin") {
            createdAccount = await Maneger.create({
                firstName,
                lastName,
                email,
                username,
                role,
                department,
                password,
            });
        }
        // ✅ Otherwise → Save in User collection
        else {
            createdAccount = await User.create({
                firstName,
                lastName,
                email,
                username,
                role,
                department,
                password,
            });
        }

        res.json({ success: true, user: createdAccount });
    } catch (error) {
        console.error("❌ Error creating account:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ✅ Optional: Auto add user (for testing)
app.post("/api/auto-add-user", async (req, res) => {
    const { email, password } = req.body

    try {
        let user = await User.findOne({ email })

        if (user) {
            return res.status(200).json({ message: "User already exists", user })
        }

        user = new User({ email, password })
        await user.save()

        res.status(201).json({ message: "User created successfully", user })
    } catch (error) {
        console.error("Error adding user:", error)
        res.status(500).json({ message: "Server error" })
    }
})

// ✅ Send OTP
app.post("/api/send-otp", async (req, res) => {
    const { email } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ success: false, message: "Email not found. Please go back and try again." })
        }

        const otp = Math.floor(1000 + Math.random() * 9000).toString()
        otpStore[email] = otp

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "proximatechnologies34@gmail.com",
                pass: "dlmyxbxuaujykidf", // App password (keep secret)
            },
        })

        const mailOptions = {
            from: "proximatechnologies34@gmail.com",
            to: email,
            subject: "SmartStock OTP Verification",
            text: `Your OTP code is: ${otp}`,
        }

        await transporter.sendMail(mailOptions)
        res.json({ success: true, message: "OTP sent successfully" })
    } catch (error) {
        console.error("Error sending OTP:", error)
        res.status(500).json({ success: false, message: "Failed to send OTP" })
    }
})

// ✅ Verify OTP
app.post("/api/verify-otp", (req, res) => {
    const { email, otp } = req.body

    if (otpStore[email] === otp) {
        delete otpStore[email] // Clear used OTP
        res.json({ success: true, message: "OTP verified" })
    } else {
        res.status(400).json({ success: false, message: "Invalid OTP" })
    }
})

// ✅ Reset Password
app.post("/api/reset-password", async (req, res) => {
    const { email, newPassword } = req.body

    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" })
        }

        user.password = newPassword
        await user.save()

        res.json({ success: true, message: "Password updated successfully" })
    } catch (err) {
        console.error("Error resetting password:", err)
        res.status(500).json({ success: false, message: "Server error" })
    }
})

// ✅ Added new endpoint for creating user accounts by manager
app.post("/api/create-account", async (req, res) => {
    const { firstName, lastName, email, username, role, department, password } = req.body

    console.log("🟢 Create account request received:", req.body)

    try {
        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        })

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email or username already exists",
            })
        }

        // Create new user
        const newUser = new User({
            firstName,
            lastName,
            email,
            username,
            role,
            department,
            password, // In production, hash this password
            createdAt: new Date(),
        })

        await newUser.save()

        console.log("✅ User created successfully:", newUser._id)

        res.status(201).json({
            success: true,
            message: "User account created successfully",
            user: {
                id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                department: newUser.department,
            },
        })
    } catch (err) {
        console.error("❌ Error creating user account:", err)
        res.status(500).json({
            success: false,
            message: "Server error while creating account",
        })
    }
})


// DELETE /api/items/:itemCode
app.delete('/api/items/:itemCode', async (req, res) => {
    const { itemCode } = req.params;
    console.log("🟡 [DELETE] itemCode from URL:", itemCode);

    try {
        const found = await Item.findOne({ itemCode });
        console.log("🔍 Found item before deletion?", found);

        const deleted = await Item.findOneAndDelete({ itemCode });

        if (!deleted) {
            console.log("❌ Item not found for deletion:", itemCode);
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        console.log("✅ Item deleted successfully:", itemCode);
        res.json({ success: true, message: 'Item deleted successfully' });
    } catch (err) {
        console.error('❌ Server Error deleting item:', err);
        res.status(500).json({ success: false, message: 'Server error while deleting item' });
    }
});


// PUT /api/items/:itemCode
app.put('/api/items/:itemCode', upload.single('image'), async (req, res) => {
    const { itemCode } = req.params;
    const {
        category,
        unitPrice,
        unit,
        rackNumber,
        supplier,
        reOrder,
        description,
    } = req.body;

    try {
        const updateData = {
            category,
            unitPrice,
            unit,
            rackNumber,
            supplier,
            reOrder,
            description,
        };

        if (req.file) {
            updateData.imagePath = '/uploads/' + req.file.filename;
        }

        const updatedItem = await Item.findOneAndUpdate({ itemCode }, updateData, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        res.json({ success: true, message: 'Item updated successfully', item: updatedItem });
    } catch (err) {
        console.error('Error updating item:', err);
        res.status(500).json({ success: false, message: 'Server error while updating item' });
    }
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET','POST','DELETE','PUT','OPTIONS'],
}));

// GET all suppliers
app.get('/api/suppliers', async (req, res) => {
    try {
        const suppliers = await Supplier.find();
        res.json({ success: true, suppliers });
    } catch (error) {
        console.error('Error fetching suppliers:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST add new supplier
app.post('/api/suppliers', async (req, res) => {
    try {
        const { code, name, email, address, tp1, tp2, date } = req.body;

        // Check if supplier with same code exists
        const existingSupplier = await Supplier.findOne({ code });
        if (existingSupplier) {
            return res.status(400).json({ success: false, message: 'Supplier code already exists' });
        }

        const newSupplier = new Supplier({ code, name, email, address, tp1, tp2, date });
        await newSupplier.save();

        res.status(201).json({ success: true, message: 'Supplier added successfully', supplier: newSupplier });
    } catch (error) {
        console.error('❌ Error adding supplier:', error.message, error.stack);
        res.status(500).json({ success: false, message: 'Server error while adding supplier' });
    }
});


// DELETE supplier by code
app.delete('/api/suppliers/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const deleted = await Supplier.findOneAndDelete({ code });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Supplier not found' });
        }
        res.json({ success: true, message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Error deleting supplier:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /api/categories - Add new category
// POST /api/categories - Add new category
app.post('/api/categories', async (req, res) => {
    console.log("📦 Incoming category:", req.body); // ✅ Debug log

    try {
        const { code, description } = req.body;

        // Check if category with same code exists
        const existing = await Category.findOne({ code });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Category code already exists' });
        }

        const newCategory = new Category({ code, description });
        await newCategory.save();

        res.status(201).json({ success: true, category: newCategory });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ success: false, message: 'Server error while adding category' });
    }
});

// GET /api/categories - Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching categories' });
    }
});

app.delete('/api/categories/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const deleted = await Category.findOneAndDelete({ code });
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting category' });
    }
});

// POST: Add Category API
app.post("/api/categories", async (req, res) => {
    const { code, description } = req.body;

    const categoryImageUrl = `https://source.unsplash.com/600x400/?${encodeURIComponent(description)}`;

    const newCategory = new Category({
        code,
        description,
        image: categoryImageUrl,  // auto-generated image URL
    });

    try {
        await newCategory.save();
        res.json({ success: true, category: newCategory });
    } catch (err) {
        res.status(500).json({ success: false, error: "Failed to add category" });
    }
});

app.post('/api/issue-notes', async (req, res) => {
try {
    const { department, personName, event, item, issuedDate, note, code, qty } = req.body;
    const newNote = new IssueNote({
        department,
        personName,
        event,
        item,
        issuedDate: new Date(issuedDate),
        note,
        code,
        qty
    });
    const saved = await newNote.save();
    return res.status(201).json({ success: true, note: saved });
} catch (error) {
    console.error('❌ Save error:', error.message, error.stack);
    return res.status(500).json({ success: false, message: error.message });
}
});

app.delete('/api/issue-notes/:id', async (req, res) => {
    try {
        const deleted = await IssueNote.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: 'Issue note not found' });
        }
        res.json({ success: true, message: 'Issue note deleted successfully' });
    } catch (error) {
        console.error('❌ Error deleting issue note:', error.message);
        res.status(500).json({ success: false, message: 'Server error while deleting issue note' });
    }
});
// ✅ GET: All issue notes
app.get('/api/issue-notes', async (req, res) => {
    try {
        const notes = await IssueNote.find().sort({ createdAt: -1 }); // Latest first
        res.json({ success: true, notes });
    } catch (error) {
        console.error('❌ Error fetching issue notes:', error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ✅ PURCHASE ORDER ROUTES (CLEAN FINAL VERSION)
/* 🔸 CREATE purchase-order (multi-item support) */
app.post("/api/purchase-orders", async (req, res) => {
  try {
    const { poNum, supplier, issuedDate, items, total, remarks } = req.body;

    if (!poNum || !supplier || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Missing or invalid fields" });
    }

    const newPO = new PurchaseOrder({
      poNum,
      supplier,
      issuedDate: new Date(issuedDate),
      items, // ✅ full array of items
      total,
      remarks,
    });

    const saved = await newPO.save();
    return res.status(201).json({ success: true, order: saved });
  } catch (err) {
    console.error("❌ Purchase-order save error:", err.stack);
    return res.status(500).json({ success: false, message: err.message });
  }
});


app.get("/api/purchase-orders", async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ Error fetching purchase orders:", err.message);
    res.status(500).json({ success: false, message: "Server error while fetching purchase orders" });
  }
});

// ✅ UPDATE Purchase Order (multi-item edit)
app.put("/api/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { supplier, issuedDate, items, total, remarks } = req.body;

    const existing = await PurchaseOrder.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }

    existing.supplier = supplier;
    existing.issuedDate = new Date(issuedDate);
    existing.items = items; // replaces old items array
    existing.total = total;
    existing.remarks = remarks;

    const updated = await existing.save();

    res.json({ success: true, message: "Purchase Order updated successfully", order: updated });
  } catch (err) {
    console.error("❌ Update error:", err.stack);
    res.status(500).json({ success: false, message: "Server error while updating order" });
  }
});


app.delete("/api/purchase-orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await PurchaseOrder.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, message: "Purchase order deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting purchase order:", err.message);
    res.status(500).json({ success: false, message: "Server error while deleting purchase order" });
  }
});




// Auto-generate GRN No
const generateGrnNo = async () => {
    const lastGrn = await Grn.findOne().sort({ createdAt: -1 });
    if (!lastGrn) return "GRN-001";

    const lastNo = parseInt(lastGrn.grnNo.replace("GRN-", ""), 10);
    const nextNo = String(lastNo + 1).padStart(3, "0");
    return `GRN-${nextNo}`;
};

// Save GRN
app.post("/api/grns", async (req, res) => {
    try {
        if (!req.body.supplier) {
            return res.status(400).json({ success: false, message: "Supplier is required" });
        }

        if (!req.body.grnNo) {
            req.body.grnNo = await generateGrnNo();
        }

        const newGrn = new Grn(req.body);
        const savedGrn = await newGrn.save();
        res.status(201).json({ success: true, grn: savedGrn });
    } catch (err) {
        console.error("❌ Error saving GRN:", err.stack);
        res.status(500).json({ success: false, message: "Server error while saving GRN" });
    }
});

// Get all GRNs
app.get("/api/grns", async (_req, res) => {
    try {
        const grns = await Grn.find().sort({ createdAt: -1 });
        res.json({ success: true, grns });
    } catch (err) {
        console.error("❌ Error fetching GRNs:", err.stack);
        res.status(500).json({ success: false, message: "Server error while fetching GRNs" });
    }
});

// Delete GRN
app.delete("/api/grns/:id", async (req, res) => {
    try {
        const deleted = await Grn.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "GRN not found" });
        }
        res.json({ success: true, message: "GRN deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting GRN:", err.stack);
        res.status(500).json({ success: false, message: "Server error while deleting GRN" });
    }
});

// ✅ Get all departments
app.get("/api/departments", async (req, res) => {
    try {
        const departments = await Department.find().sort({ createdAt: -1 });
        res.json({ success: true, departments });
    } catch (err) {
        console.error("❌ Error fetching departments:", err.message);
        res.status(500).json({ success: false, message: "Server error while fetching departments" });
    }
});

// ✅ Add new department
app.post("/api/departments", async (req, res) => {
    try {
        const { name, code, description } = req.body;

        // prevent duplicate code
        const existing = await Department.findOne({ code });
        if (existing) {
            return res.status(400).json({ success: false, message: "Department code already exists" });
        }

        const newDept = new Department({ name, code, description });
        await newDept.save();

        res.status(201).json({ success: true, department: newDept });
    } catch (err) {
        console.error("❌ Error adding department:", err.message);
        res.status(500).json({ success: false, message: "Server error while adding department" });
    }
});

// ✅ Delete department
app.delete("/api/departments/:id", async (req, res) => {
    try {
        const deleted = await Department.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Department not found" });
        }
        res.json({ success: true, message: "Department deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting department:", err.message);
        res.status(500).json({ success: false, message: "Server error while deleting department" });
    }
});

// ✅ Dashboard data endpoint

app.get("/api/dashboard", async (req, res) => {
  try {
    const totalItems = await Item.countDocuments();
    const totalDepartments = await Department.countDocuments();
    const purchaseOrders = await PurchaseOrder.countDocuments();
    const grns = await Grn.countDocuments();
    const issueNotes = await IssueNote.countDocuments();

    // Optional: Calculate stock value
    const items = await Item.find();
    const totalStockValue = items.reduce((sum, i) => sum + (parseFloat(i.unitPrice) || 0), 0);

    res.json({
      success: true,
      data: {
        totalItems,
        totalDepartments,
        purchaseOrders,
        grns,
        issueNotes,
        totalStockValue,
      }
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Reports API — Combined data for Report Page
app.get("/api/transactions", async (req, res) => {
  try {
    const purchaseOrders = await PurchaseOrder.find().sort({ createdAt: -1 });
    const grns = await Grn.find().sort({ createdAt: -1 });
    const issueNotes = await IssueNote.find().sort({ createdAt: -1 });

    // Normalize data for frontend
    const transactions = [
      ...purchaseOrders.map((po) => ({
        id: po._id,
        type: "Purchase Order",
        docNo: po.poNum || "N/A",
        date: po.issuedDate ? new Date(po.issuedDate).toLocaleDateString() : "N/A",
        supplier: po.supplier?.name || "Unknown Supplier",
        amount: po.total || 0,
        status: "Completed",
      })),
      ...grns.map((g) => ({
        id: g._id,
        type: "GRN",
        docNo: g.grnNo || "N/A",
        date: g.createdAt ? new Date(g.createdAt).toLocaleDateString() : "N/A",
        supplier: g.supplier?.name || "Unknown Supplier",
        amount: g.totalAmount || 0,
        status: "Received",
      })),
      ...issueNotes.map((note) => ({
        id: note._id,
        type: "Issue Note",
        docNo: note.code || "N/A",
        date: note.issuedDate ? new Date(note.issuedDate).toLocaleDateString() : "N/A",
        department: note.department || "N/A",
        amount: 0,
        status: "Issued",
      })),
    ];

    res.json({ success: true, transactions });
  } catch (err) {
    console.error("❌ Error fetching transaction data:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Supplier Summary API for Reports
app.get("/api/report-suppliers", async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    const purchaseOrders = await PurchaseOrder.find();

    const summary = suppliers.map((s) => {
      const supplierOrders = purchaseOrders.filter(
        (po) => po.supplier?.name === s.name
      );
      const totalPurchases = supplierOrders.reduce((sum, po) => sum + (po.total || 0), 0);
      const grns = supplierOrders.length;
      const outstanding = totalPurchases * 0.1; // (demo placeholder)
      return {
        id: s._id,
        name: s.name,
        totalPurchases,
        grns,
        outstanding,
        status: "Active",
      };
    });

    res.json({ success: true, suppliers: summary });
  } catch (err) {
    console.error("❌ Supplier report error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Item Summary API for Reports
app.get("/api/report-items", async (req, res) => {
  try {
    const items = await Item.find();
    const summary = items.map((i) => ({
      id: i._id,
      name: i.description || i.itemCode,
      category: i.category || "Uncategorized",
      stock: i.reOrder || 0,
      minStock: 10,
      maxStock: 100,
      value: i.unitPrice || 0,
      status: (i.reOrder || 0) < 10 ? "Low Stock" : "Normal",
    }));

    res.json({ success: true, items: summary });
  } catch (err) {
    console.error("❌ Item report error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// ✅ Server Start LAST
app.listen(5000, () => {
    console.log('🚀 Server running at http://localhost:5000');
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

