const express = require("express");
const { db, db3 } = require("../database/database");

const router = express.Router();

// ================= FOR APPLICANT =================
router.get("/get_applicant_data", async (req, res) => {
  try {
    const [rows] = await db3.query(`
        SELECT 
            ea.applicant_id, 
            pt.campus AS campus_id,
            pt.first_name, 
            pt.last_name, 
            pt.middle_name, 
            pgt.program_id, 
            pgt.program_description, 
            pgt.program_code, 
            sy.semester_id,
            sy.year_id,
            ees.building_description,
            ees.room_description,
            ees.start_time,
            ees.end_time,
            ees.proctor
        FROM admission.exam_applicants ea
        INNER JOIN admission.entrance_exam_schedule ees ON ea.schedule_id = ees.schedule_id
        INNER JOIN enrollment.active_school_year_table sy ON ees.active_school_year_id = sy.id
        INNER JOIN admission.applicant_numbering_table ant ON ea.applicant_id = ant.applicant_number
        INNER JOIN admission.person_table pt ON ant.person_id = pt.person_id
        INNER JOIN enrollment.curriculum_table ct ON pt.program = ct.curriculum_id
        INNER JOIN enrollment.program_table pgt ON ct.program_id = pgt.program_id
        WHERE ea.email_sent = 1;
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
});

// =================== FOR STUDENT =============== //

// FOR UNIFAST
router.get("/get_student_data_unifast", async (req, res) => {
  try {
    const [rows] = await db3.query(`
        SELECT u.*, st.*, pgt.*, sy.year_id, pt.campus AS campus_id FROM student_status_table sst
            INNER JOIN unifast u ON sst.student_number = u.student_number
            INNER JOIN active_school_year_table sy ON u.active_school_year_id = sy.id
            INNER JOIN semester_table st ON sy.semester_id = st.semester_id
            INNER JOIN curriculum_table ct ON sst.active_curriculum = ct.curriculum_id
            INNER JOIN program_table pgt ON ct.program_id = pgt.program_id
            INNER JOIN student_numbering_table snt ON sst.student_number = snt.student_number
            INNER JOIN person_table pt ON snt.person_id = pt.person_id
        WHERE sst.enrolled_status = 1 GROUP BY u.student_number, u.active_school_year_id;
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
});

// FOR MATRICULATION
router.get("/get_student_data_matriculation", async (req, res) => {
  try {
    const [rows] = await db3.query(`
        SELECT m.*, st.*, pgt.*, sy.year_id, pt.campus AS campus_id FROM student_status_table sst
            INNER JOIN matriculation m ON sst.student_number = m.student_number
            INNER JOIN active_school_year_table sy ON m.active_school_year_id = sy.id
            INNER JOIN semester_table st ON sy.semester_id = st.semester_id
            INNER JOIN curriculum_table ct ON sst.active_curriculum = ct.curriculum_id
            INNER JOIN program_table pgt ON ct.program_id = pgt.program_id
            INNER JOIN student_numbering_table snt ON sst.student_number = snt.student_number
            INNER JOIN person_table pt ON snt.person_id = pt.person_id
        WHERE sst.enrolled_status = 1 GROUP BY m.student_number, m.active_school_year_id;
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while fetching data" });
  }
});

router.delete("/delete_unifast/:student_number/:id", async (req, res) => {
  const { student_number, id } = req.params;
  const { generatedId } = req.body;

  try {
    await db3.query("DELETE FROM unifast WHERE student_number = ? AND id = ?", [
      student_number,
      id,
    ]);
    await db3.query(
      "UPDATE matriculation SET unifast_id = ?, remark = 'Transferred FROM Unifast' WHERE student_number = ?",
      [generatedId, student_number],
    );
    res.json({ message: "Unifast record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting record" });
  }
});

router.delete("/delete_matriculation/:student_number/:id", async (req, res) => {
  const { student_number, id } = req.params;
  const { generatedId } = req.body;
  try {
    await db3.query(
      "DELETE FROM matriculation WHERE student_number = ? AND id = ?",
      [student_number, id],
    );

    await db3.query(
      "UPDATE unifast SET matriculation_id = ?, remark = 'Transferred FROM Matriculation' WHERE student_number = ?",
      [generatedId, student_number],
    );
    res.json({ message: "Matriculation record deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error while deleting record" });
  }
});

module.exports = router;
