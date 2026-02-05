const express = require('express');
const multer = require("multer");
const { db, db3 } = require('../database/database');

const router = express.Router();

router.get("/course_list", async (req, res) => {
  const query = "SELECT * FROM course_table ORDER BY course_table.course_code ASC";

  try {
    const [result] = await db3.query(query);
    res.status(200).json(result);
  } catch (err) {
    console.error("Query error:", err);
    res.status(500).json({
      error: "Query failed",
      details: err.message,
    });
  }
});

router.post("/adding_course", async (req, res) => {
  const {
    course_code,
    course_description,
    course_unit,
    lab_unit,
    prereq,
    corequisite,

  } = req.body;

  try {
    const normalized_code = (course_code || "")
      .replace(/[^A-Za-z0-9]/g, "")
      .toUpperCase();

    if (!normalized_code) {
      return res.status(400).json({ message: "Course code is required" });
    }

    const [rows] = await db3.query(
      "SELECT course_id FROM course_table WHERE course_code = ?",
      [normalized_code]
    );

    if (rows.length > 0) {
      return res.status(400).json({ message: "The course already exists" });
    }

    await db3.query(
      `INSERT INTO course_table
      (course_code, course_description, course_unit, lab_unit, prereq, corequisite,)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        normalized_code,
        course_description || null,
        course_unit || 0,
        lab_unit || 0,
        prereq || null,
        corequisite || null,

      ]
    );

    res.status(200).json({ message: "✅ Course added successfully" });
  } catch (error) {
    console.error("❌ Error adding course:", error);
    res.status(500).json({ message: "Failed to add course" });
  }
});

router.put("/update_course/:id", async (req, res) => {
  const { id } = req.params;
  const {
    course_code,
    course_description,
    course_unit,
    lec_unit,
    lab_unit,
    prereq,
    corequisite,

  } = req.body;

  try {
    /* ===================== GET CURRENT COURSE ===================== */
    const [currentRows] = await db3.query(
      "SELECT * FROM course_table WHERE course_id = ?",
      [id]
    );

    if (currentRows.length === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    const current = currentRows[0];

    /* ===================== NORMALIZE COURSE CODE ===================== */
    const normalizeCode = (code) =>
      code.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

    const normalized_current_code = normalizeCode(current.course_code);

    const final_course_code = course_code
      ? normalizeCode(course_code)
      : normalized_current_code;

    /* ===================== DUPLICATE CHECK (ONLY IF CHANGED) ===================== */
    if (course_code && final_course_code !== normalized_current_code) {
      const [rows] = await db3.query(
        "SELECT course_id FROM course_table WHERE course_code = ? AND course_id != ?",
        [final_course_code, id]
      );

      if (rows.length > 0) {
        return res.status(400).json({ message: "The course already exists" });
      }
    }

    /* ===================== UPDATE ===================== */
    await db3.query(
      `UPDATE course_table SET
        course_code = ?,
        course_description = ?,
        course_unit = ?,
        lec_unit = ?,
        lab_unit = ?,
        prereq = ?,
        corequisite = ?,
      WHERE course_id = ?`,
      [
        final_course_code,
        course_description ?? current.course_description,
        course_unit ?? current.course_unit,
        lec_unit ?? current.lec_unit,
        lab_unit ?? current.lab_unit,
        prereq !== undefined ? prereq : current.prereq,
        corequisite !== undefined ? corequisite : current.corequisite,
        id,
      ]
    );

    res.json({ message: "✅ Course updated successfully" });
  } catch (error) {
    console.error("❌ Error updating course:", error);
    res.status(500).json({ message: "Failed to update course" });
  }
});

router.delete("/delete_course/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await db3.query("DELETE FROM course_table WHERE course_id=?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ message: "✅ Course deleted successfully" });

  } catch (error) {
    console.error("❌ Error deleting course:", error);
    res.status(500).json({ message: "Failed to delete course" });
  }
});

module.exports = router;