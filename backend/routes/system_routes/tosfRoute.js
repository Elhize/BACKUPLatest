const express = require('express');
const multer = require("multer");
const { db, db3 } = require('../database/database');

const router = express.Router();

router.get("/tosf", async (req, res) => {
  try {
    const [rows] = await db3.query("SELECT * FROM tosf ORDER BY tosf_id");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
});

router.post("/insert_tosf", async (req, res) => {
  const {
    athletic_fee,
    cultural_fee,
    developmental_fee,
    guidance_fee,
    library_fee,
    medical_and_dental_fee,
    registration_fee,
    school_id_fees,
    nstp_fees,
    computer_fees,
    laboratory_fees,
  } = req.body;

  try {
    await db3.query(
      `INSERT INTO tosf (
        athletic_fee,
        cultural_fee,
        developmental_fee,
        guidance_fee,
        library_fee,
        medical_and_dental_fee,
        registration_fee,
        school_id_fees,
        nstp_fees,
        computer_fees,
        laboratory_fees
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        athletic_fee ?? 0,
        cultural_fee ?? 0,
        developmental_fee ?? 0,
        guidance_fee ?? 0,
        library_fee ?? 0,
        medical_and_dental_fee ?? 0,
        registration_fee ?? 0,
        school_id_fees ?? 0,
        nstp_fees ?? 0,
        computer_fees ?? 0,
        laboratory_fees ?? 0,
      ]
    );

    res.json({
      success: true,
      message: "Data Successfully Inserted",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while inserting data" });
  }
});

router.put("/update_tosf/:tosf_id", async (req, res) => {
  const { tosf_id } = req.params;

  const {
    athletic_fee,
    cultural_fee,
    developmental_fee,
    guidance_fee,
    library_fee,
    medical_and_dental_fee,
    registration_fee,
    school_id_fees,
    nstp_fees,
    computer_fees,
    laboratory_fees,
  } = req.body;

  try {
    const [result] = await db3.query(
      `UPDATE tosf SET
        athletic_fee = ?,
        cultural_fee = ?,
        developmental_fee = ?,
        guidance_fee = ?,
        library_fee = ?,
        medical_and_dental_fee = ?,
        registration_fee = ?,
        school_id_fees = ?,
        nstp_fees = ?,
        computer_fees = ?,
        laboratory_fees = ?
      WHERE tosf_id = ?`,
      [
        athletic_fee ?? 0,
        cultural_fee ?? 0,
        developmental_fee ?? 0,
        guidance_fee ?? 0,
        library_fee ?? 0,
        medical_and_dental_fee ?? 0,
        registration_fee ?? 0,
        school_id_fees ?? 0,
        nstp_fees ?? 0,
        computer_fees ?? 0,
        laboratory_fees ?? 0,
        tosf_id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ success: true, message: "Data Successfully Updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while updating data" });
  }
});

router.delete("/delete_tosf/:tosf_id", async (req, res) => {
  const { tosf_id } = req.params;

  try {
    const [result] = await db3.query(
      "DELETE FROM tosf WHERE tosf_id = ?",
      [tosf_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    res.json({ success: true, message: "Data Successfully Deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting data" });
  }
});

module.exports = router;