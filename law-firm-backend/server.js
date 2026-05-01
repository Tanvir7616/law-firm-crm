const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   DB CONNECT
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

/* =========================
   CONTACT MODEL
========================= */
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
  status: { type: String, default: "unread" },
  reply: String,
  repliedAt: Date
}, { timestamps: true });

const Contact = mongoose.model("Contact", contactSchema);

/* =========================
   CASE MODEL
========================= */
const caseSchema = new mongoose.Schema({
  title: String,
  clientName: String,
  description: String,
  status: { type: String, default: "ongoing" }
}, { timestamps: true });

const Case = mongoose.model("Case", caseSchema);

/* =========================
   AUTH MIDDLEWARE
========================= */
function auth(req, res, next) {

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
}

/* =========================
   LOGIN
========================= */
const adminEmail = "admin@gmail.com";
const adminPasswordHash = bcrypt.hashSync("123456", 10);

app.post("/api/auth/login", async (req, res) => {

  const { email, password } = req.body;

  if (email !== adminEmail) {
    return res.json({ success: false, message: "Admin not found" });
  }

  const match = await bcrypt.compare(password, adminPasswordHash);

  if (!match) {
    return res.json({ success: false, message: "Wrong password" });
  }

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1d"
  });

  res.json({
    success: true,
    token
  });
});

/* =========================
   CONTACT ROUTES
========================= */

// CREATE CONTACT
app.post("/api/contact", async (req, res) => {
  const newContact = await Contact.create(req.body);

  res.json({
    success: true,
    data: newContact
  });
});

// GET CONTACTS
app.get("/api/admin/contacts", auth, async (req, res) => {

  const data = await Contact.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data
  });
});

// DELETE CONTACT
app.delete("/api/admin/contact/:id", auth, async (req, res) => {

  await Contact.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Deleted"
  });
});

/* =========================
   CASE ROUTES (FULL FIXED)
========================= */

// CREATE CASE
app.post("/api/admin/case", auth, async (req, res) => {

  try {

    const newCase = await Case.create(req.body);

    res.json({
      success: true,
      data: newCase
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

// GET CASES
app.get("/api/admin/case", async (req, res) => {

  const cases = await Case.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: cases
  });
});

// UPDATE CASE
app.patch("/api/admin/case/:id", auth, async (req, res) => {

  await Case.findByIdAndUpdate(req.params.id, req.body);

  res.json({
    success: true,
    message: "Updated"
  });
});

// DELETE CASE
app.delete("/api/admin/case/:id", auth, async (req, res) => {

  await Case.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: "Deleted"
  });
});

/* =========================
   STATS
========================= */
app.get("/api/admin/stats", auth, async (req, res) => {

  const total = await Contact.countDocuments();
  const unread = await Contact.countDocuments({ status: "unread" });
  const resolved = await Contact.countDocuments({ status: "resolved" });

  res.json({
    success: true,
    data: { total, unread, resolved }
  });
});

app.get("/", (req, res) => {
  res.send("Law Firm API is running...");
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});