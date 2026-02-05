import React, {useEffect, useState} from "react";
import {Box, Typography, Snackbar, Alert, TableContainer, Table, TableHead, TableRow, TableCell, Paper, TextField, Select, MenuItem} from "@mui/material";
import API_BASE_URL from "../apiConfig";
import axios from "axios";

const SlotMonitoring = () => {
    const [schoolYears, setSchoolYears] = useState([]);
    const [semesters, setSchoolSemester] = useState([]);
    const [selectedSchoolYear, setSelectedSchoolYear] = useState('');
    const [selectedSchoolSemester, setSelectedSchoolSemester] = useState('');
    const [selectedActiveSchoolYear, setSelectedActiveSchoolYear] = useState('');
    const [department, setDepartment] = useState([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [campusFilter, setCampusFilter] = useState("1");

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/get_school_year/`)
            .then((res) => setSchoolYears(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/get_school_semester/`)
            .then((res) => setSchoolSemester(res.data))
            .catch((err) => console.error(err));
    }, [])

    useEffect(() => {
        axios
            .get(`${API_BASE_URL}/active_school_year`)
            .then((res) => {
                if (res.data.length > 0) {
                    setSelectedSchoolYear(res.data[0].year_id);
                    setSelectedSchoolSemester(res.data[0].semester_id);
                }
            })
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedSchoolYear && selectedSchoolSemester) {
            axios
                .get(`${API_BASE_URL}/get_selecterd_year/${selectedSchoolYear}/${selectedSchoolSemester}`)
                .then((res) => {
                    if (res.data.length > 0) {
                        setSelectedActiveSchoolYear(res.data[0].school_year_id);
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [selectedSchoolYear, selectedSchoolSemester]);

    useEffect(() => {
      fetchDepartments();
    }, [])

    useEffect(() => {
        if (department.length > 0 && !selectedDepartmentFilter) {
            const firstDeptId = department[0].dprtmnt_id;
            setSelectedDepartmentFilter(firstDeptId);
            fetchPrograms(firstDeptId);
        }
    }, [department, selectedDepartmentFilter]);

    useEffect(() => {
        if (programs.length > 0 && !selectedProgram) {
            setSelectedProgram(programs[0].program_id);
        }
    }, [programs, selectedProgram]);

    const fetchDepartments = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/get_department`);
            setDepartment(res.data);
            console.log(res.data);
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const fetchPrograms = async (dprtmnt_id) => {
        if (!dprtmnt_id) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/applied_program/${dprtmnt_id}`);
            setPrograms(res.data);
        } catch (err) {
            console.error("❌ Department fetch error:", err);
            setErrorMessage("Failed to load department list");
        }
    };

    const handleSchoolYearChange = (event) => {
        setSelectedSchoolYear(event.target.value);
    };

    const handleSchoolSemesterChange = (event) => {
        setSelectedSchoolSemester(event.target.value);
    };

    const handleCollegeChange = (e) => {
        const selectedId = e.target.value;

        setSelectedDepartmentFilter(selectedId);
        setSelectedProgram("");
        setPrograms([]);
        fetchPrograms(selectedId); 
    };

    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent", mt: 1, padding: 2 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "bold",
                    color: "maroon", //titleColor
                    fontSize: "36px",
                    background: "white",
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                SLOT MONITORING
            </Typography>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid maroon`,  }}>
                <Table>
                    <TableHead sx={{ backgroundColor: "maroon" }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', textAlign: "Center" }}>FILTER OPTIONS</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid maroon`,  }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{display: "flex", alignItems: "center", gap: "1rem" }}>
                                <Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        Campus: 
                                        <Select
                                            name="campus"
                                            value={campusFilter}
                                            onChange={(e) => setCampusFilter(e.target.value)}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            <MenuItem value={1}>Manila</MenuItem>
                                            <MenuItem value={2}>Cavite</MenuItem>
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        College: 
                                        <Select
                                            name="college"
                                            value={selectedDepartmentFilter}
                                            onChange={handleCollegeChange}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {department.map((dep) => (
                                                <MenuItem key={dep.dprtmnt_id} value={dep.dprtmnt_id}>
                                                    {dep.dprtmnt_name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        School Year: 
                                        <Select
                                            name="campus"
                                            value={selectedProgram}
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {programs.map((prog) => (
                                                <MenuItem key={prog.program_id} value={prog.program_id}>
                                                    {prog.program_description} {prog.major}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>
                                <Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        Year Level: 
                                        <Select
                                            name="campus"
                                            value={selectedProgram}
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {programs.map((prog) => (
                                                <MenuItem key={prog.program_id} value={prog.program_id}>
                                                    {prog.program_description} {prog.major}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        Program: 
                                        <Select
                                            name="campus"
                                            value={selectedProgram}
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {programs.map((prog) => (
                                                <MenuItem key={prog.program_id} value={prog.program_id}>
                                                    {prog.program_description} {prog.major}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                    <Box sx={{ textAlign: "Center", display: "flex", alignItems: "center", gap: "1rem" }}>
                                        Semester: 
                                        <Select
                                            name="campus"
                                            value={selectedProgram}
                                            onChange={(e) => setSelectedProgram(e.target.value)}
                                            MenuProps={{
                                                PaperProps: {
                                                    sx: {
                                                        maxHeight: 410,
                                                        marginTop: "8px"
                                                    },
                                                },
                                            }}
                                        >
                                            {programs.map((prog) => (
                                                <MenuItem key={prog.program_id} value={prog.program_id}>
                                                    {prog.program_description} {prog.major}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </Box>
                                </Box>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>
        </Box>
    )   
}

export default SlotMonitoring;