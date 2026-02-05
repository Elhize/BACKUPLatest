import React, { useMemo, useEffect } from "react";

const ProgramTaggingFilter = ({
  curriculumList,
  yearLevelList,
  semesterList,
  taggedPrograms,

  selectedCurriculum,
  selectedYearLevel,
  selectedSemester,

  setSelectedCurriculum,
  setSelectedYearLevel,
  setSelectedSemester,

  setFilteredPrograms,
}) => {

  /* ===== HELPER: Format School Year ===== */
  const formatSchoolYear = (yearDesc) => {
    if (!yearDesc) return "";
    const startYear = Number(yearDesc);
    if (isNaN(startYear)) return yearDesc;
    return `${startYear} - ${startYear + 1}`;
  };

  /* ===== ORDER MAPS ===== */
  const yearOrder = {
    "First Year": 1,
    "Second Year": 2,
    "Third Year": 3,
    "Fourth Year": 4,
    "Fifth Year": 5,
  };

  const semesterOrder = {
    "First Semester": 1,
    "Second Semester": 2,
  };

  /* ===== FILTERED YEAR LEVELS ===== */
  const filteredYearLevels = useMemo(() => {
    if (!selectedCurriculum) return [];

    const usedYearLevels = taggedPrograms
      .filter(p => p.curriculum_id == selectedCurriculum)
      .map(p => p.year_level_id);

    return yearLevelList
      .filter(y => usedYearLevels.includes(y.year_level_id))
      .sort((a, b) =>
        (yearOrder[a.year_level_description] || 99) -
        (yearOrder[b.year_level_description] || 99)
      );
  }, [selectedCurriculum, taggedPrograms, yearLevelList]);

  /* ===== FILTERED SEMESTERS ===== */
  const filteredSemesters = useMemo(() => {
    if (!selectedCurriculum) return [];

    const usedSemesters = taggedPrograms
      .filter(p => p.curriculum_id == selectedCurriculum)
      .map(p => p.semester_id);

    return semesterList
      .filter(s => usedSemesters.includes(s.semester_id))
      .sort((a, b) =>
        (semesterOrder[a.semester_description] || 99) -
        (semesterOrder[b.semester_description] || 99)
      );
  }, [selectedCurriculum, taggedPrograms, semesterList]);

  /* ===== APPLY FINAL FILTER ===== */
  const applyFilter = () => {
    let result = taggedPrograms;

    if (selectedCurriculum) {
      result = result.filter(p => p.curriculum_id == selectedCurriculum);
    }

    if (selectedYearLevel) {
      result = result.filter(p => p.year_level_id == selectedYearLevel);
    }

    if (selectedSemester) {
      result = result.filter(p => p.semester_id == selectedSemester);
    }

    setFilteredPrograms(result);
  };

  useEffect(() => {
    applyFilter();
  }, [selectedCurriculum, selectedYearLevel, selectedSemester, taggedPrograms]);

  return (
    <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
      
      {/* Curriculum */}
      <div style={{ flex: 1 }}>
        <label><b>Curriculum</b></label>
        <select
          value={selectedCurriculum}
          onChange={(e) => {
            setSelectedCurriculum(e.target.value);
            setSelectedYearLevel("");
            setSelectedSemester("");
          }}
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="">Select Curriculum</option>
          {curriculumList.map(c => (
            <option key={c.curriculum_id} value={c.curriculum_id}>
              {formatSchoolYear(c.year_description)}: ({c.program_code}) – {c.program_description}
              {c.major ? ` (${c.major})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Year Level */}
      <div style={{ flex: 1 }}>
        <label><b>Year Level</b></label>
        <select
          value={selectedYearLevel}
          onChange={(e) => setSelectedYearLevel(e.target.value)}
          disabled={!selectedCurriculum}
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="">Select Year Level</option>
          {filteredYearLevels.map(y => (
            <option key={y.year_level_id} value={y.year_level_id}>
              {y.year_level_description}
            </option>
          ))}
        </select>
      </div>

      {/* Semester */}
      <div style={{ flex: 1 }}>
        <label><b>Semester</b></label>
        <select
          value={selectedSemester}
          onChange={(e) => setSelectedSemester(e.target.value)}
          disabled={!selectedCurriculum}
          style={{ width: "100%", padding: "10px" }}
        >
          <option value="">Select Semester</option>
          {filteredSemesters.map(s => (
            <option key={s.semester_id} value={s.semester_id}>
              {s.semester_description}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default ProgramTaggingFilter;
