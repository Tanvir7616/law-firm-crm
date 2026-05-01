const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Contact = require("../models/Contact");

// GET ALL CONTACTS (ADMIN ONLY)
router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ _id: -1 });

    res.json({
      success: true,
      data: contacts,
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;