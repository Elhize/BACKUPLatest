import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import {
    Box,
    Paper,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    Button,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    TableContainer,
    Grid, Card, CardContent, Chip, LinearProgress
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import LoadingOverlay from "../components/LoadingOverlay";
import * as XLSX from "xlsx";
import ApplicantTable from "../components/ApplicantTable";
import StudentTable from "../components/StudentTable";

const PaymentExportingModule = () => {
    const [yearId, setYearId] = useState("");
    const [semesterId, setSemesterId] = useState("");
    const [programs, setPrograms] = useState([]);
    const [selectedProgram, setSelectedProgram] = useState("");
    const [department, setDepartment] = useState([]);
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState("");
    const [schoolYears, setSchoolYears] = useState([]);
    const [semesters, setSchoolSemester] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [visibleData, setVisibleData] = useState([]);

    const [campusFilter, setCampusFilter] = useState(1);
    const [personTypeFilter, setPersonTypeFilter] = useState(0);
    const [paymentType, setPaymentType] = useState(1);

    const [dataFetched, setDataFetched] = useState(false);
    const [viewClicked, setViewClicked] = useState(false);

    const settings = useContext(SettingsContext);

    const [titleColor, setTitleColor] = useState("#000000");
    const [subtitleColor, setSubtitleColor] = useState("#555555");
    const [borderColor, setBorderColor] = useState("#000000");
    const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
    const [subButtonColor, setSubButtonColor] = useState("#ffffff");   // ✅ NEW
    const [stepperColor, setStepperColor] = useState("#000000");       // ✅ NEW

    const [fetchedLogo, setFetchedLogo] = useState(null);
    const [companyName, setCompanyName] = useState("");
    const [shortTerm, setShortTerm] = useState("");
    const [campusAddress, setCampusAddress] = useState("");

    // 🔹 Authentication and access states
    const [userID, setUserID] = useState("");
    const [user, setUser] = useState("");
    const [userRole, setUserRole] = useState("");
    const [employeeID, setEmployeeID] = useState("");
    const [hasAccess, setHasAccess] = useState(null);

    const [loading, setLoading] = useState(false);

    const pageId = 110;

    useEffect(() => {
        if (!settings) return;

        // 🎨 Colors
        if (settings.title_color) setTitleColor(settings.title_color);
        if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
        if (settings.border_color) setBorderColor(settings.border_color);
        if (settings.main_button_color) setMainButtonColor(settings.main_button_color);
        if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);   // ✅ NEW
        if (settings.stepper_color) setStepperColor(settings.stepper_color);           // ✅ NEW

        // 🏫 Logo
        if (settings.logo_url) {
            setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
        } else {
            setFetchedLogo(EaristLogo);
        }

        // 🏷️ School Information
        if (settings.company_name) setCompanyName(settings.company_name);
        if (settings.short_term) setShortTerm(settings.short_term);
        if (settings.campus_address) setCampusAddress(settings.campus_address);

    }, [settings]);

    useEffect(() => {

        const storedUser = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");
        const storedID = localStorage.getItem("person_id");
        const storedEmployeeID = localStorage.getItem("employee_id");

        if (storedUser && storedRole && storedID) {
            setUser(storedUser);
            setUserRole(storedRole);
            setUserID(storedID);
            setEmployeeID(storedEmployeeID);

            if (storedRole === "registrar") {
                checkAccess(storedEmployeeID);
            } else {
                window.location.href = "/login";
            }
        } else {
            window.location.href = "/login";
        }
    }, []);

    const checkAccess = async (employeeID) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/page_access/${employeeID}/${pageId}`);
            if (response.data && response.data.page_privilege === 1) {
                setHasAccess(true);
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setHasAccess(false);
            if (error.response && error.response.data.message) {
                console.log(error.response.data.message);
            } else {
                console.log("An unexpected error occurred.");
            }
            setLoading(false);
        }
    };
    
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
        fetchActiveSchoolYear();
    }, []);

    useEffect(() => {
        const endpoint = getEndpoint();

        if (!endpoint) return;
        if (personTypeFilter === 0) return;

        axios
            .get(`${API_BASE_URL}${endpoint}`)
            .then(res => {
            setRawData(res.data);
            setDataFetched(true);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));

    }, [personTypeFilter, paymentType]);

    useEffect(() => {
        if (!dataFetched) return;

        let filtered = [...rawData];

        filtered = filtered.filter(d => d.campus_id == campusFilter);
        filtered = filtered.filter(d => d.year_id == yearId);
        filtered = filtered.filter(d => d.semester_id == semesterId);
        if (selectedProgram) {
            filtered = filtered.filter(d => d.program_id == selectedProgram);
        }
        setFilteredData(filtered);
    }, [rawData, campusFilter, yearId, semesterId, selectedProgram]);

    useEffect(() => {
        setViewClicked(false);
        setVisibleData([]);
    }, [campusFilter, yearId, semesterId, selectedProgram, personTypeFilter, paymentType]);

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
    }

    const fetchActiveSchoolYear = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/active_school_year`);

            if (res.data.length > 0) {
                const active = res.data[0];
                setYearId(active.year_id);
                setSemesterId(active.semester_id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCollegeChange = (e) => {
        const selectedId = e.target.value;

        setSelectedDepartmentFilter(selectedId);
        setSelectedProgram("");
        setPrograms([]);
        fetchPrograms(selectedId); 
    };

    const getEndpoint = () => {
        if (personTypeFilter === 1) {
            return "/get_applicant_data";
        }

        if (personTypeFilter === 2) {
            if (paymentType === 0) return "/get_student_data_unifast";
            if (paymentType === 1) return "/get_student_data_matriculation";
        }

        return null; // no "All" for now
    };

    const handleViewRecord = () => {
        setVisibleData(filteredData);
        setViewClicked(true);
    };

    const buildExportData = () => {
        if (personTypeFilter === 1) {
            return filteredData.map((row, index) => ({
                "No.": index + 1,
                "Applicant Number": row.applicant_id,
                "Last Name": row.last_name,
                "First Name": row.first_name,
                "Middle Name": row.middle_name,
                "Program": row.program_description,
                "Schedule": `${row.start_time}-${row.end_time}, ${row.building_description} (${row.room_description})`,
                "Proctor": row.proctor
            }));
        }

        return filteredData.map((row, index) => ({
            "No.": index + 1,
            "Campus": row.campus_name,
            "Student No.": row.student_number,
            "LRN": row.learner_reference_number,
            "Last Name": row.last_name,
            "Given Name": row.given_name,
            "MI": row.middle_initial,
            "Degree Program": row.degree_program,
            "Year Level": row.year_level,
            "Sex": row.sex,
            "Email": row.email_address,
            "Phone": row.phone_number,
            "Lab Units": row.laboratory_units,
            "Computer Units": row.computer_units,
            "Acad Units": row.academic_units_enrolled,
            "NSTP Units": row.academic_units_nstp_enrolled,
            "Tuition Fees": row.tuition_fees,
            "NSTP Fees": row.nstp_fees,
            "Athletic Fees": row.athletic_fees,
            "Computer Fees": row.computer_fees,
            "Cultural Fees": row.cultural_fees,
            "Development Fees": row.development_fees,
            "Guidance Fees": row.guidance_fees,
            "Laboratory Fees": row.laboratory_fees,
            "Library Fees": row.library_fees,
            "Medical & Dental Fees": row.medical_and_dental_fees,
            "Registration Fees": row.registration_fees,
            "School ID Fees": row.school_id_fees,
            "Total TOSF": row.total_tosf,
            "Remark": row.remark
        }));

        return [];
    };

    const handleRemoveStudent = (student_number, id) => {
        setVisibleData((prev) =>
            prev.filter(
            (row) =>
                row.student_number !== student_number || row.id !== id
            )
        );

        setFilteredData((prev) =>
            prev.filter(
            (row) =>
                row.student_number !== student_number || row.id !== id
            )
        );
    };

    const handleExport = () => {
        if (!filteredData.length || personTypeFilter === 0) return;

        const exportData = buildExportData();

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
        XLSX.writeFile(workbook, "payment_export.xlsx");
    };

    if (loading || hasAccess === null) {
        return <LoadingOverlay open={loading} message="Loading..." />;
    }

    if (!hasAccess) {
        return <Unauthorized />;
    }

    return (
        <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent", mt: 1, padding: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        color: titleColor,
                    }}
                >
                    PAYMENT EXPORTING MODULE
                </Typography>
            </Box>

            <hr style={{ border: "1px solid #ccc", width: "100%" }} />
            <br />

            <TableContainer component={Paper} sx={{ width: '100%', border: `2px solid ${borderColor}`, }}>
                <Table>
                    <TableHead sx={{ backgroundColor: settings?.header_color || "#1976d2" }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', textAlign: "Center" }}>Payment Exporting Module</TableCell>
                        </TableRow>
                    </TableHead>
                </Table>
            </TableContainer>

            <Paper sx={{ p: 3, mb: 4, border: `2px solid ${borderColor}` }}>
                <Grid container spacing={2}>
                    {/* ROW 1 */}
                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={campusFilter}
                                onChange={(e) => setCampusFilter(e.target.value)}
                            >
                                <MenuItem value={1}>Manila</MenuItem>
                                <MenuItem value={2}>Cavite</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={7.5}/>

                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={yearId}
                                onChange={(e) => setYearId(e.target.value)}
                            >
                                {schoolYears.map((sy) => (
                                    <MenuItem key={sy.year_id} value={sy.year_id}>
                                    {sy.current_year} - {sy.next_year}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={semesterId}
                                onChange={(e) => setSemesterId(e.target.value)}
                            >
                                {semesters.map((sem) => (
                                    <MenuItem key={sem.semester_id} value={sem.semester_id}>
                                        {sem.semester_description}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={personTypeFilter}
                                onChange={(e) => setPersonTypeFilter(e.target.value)}
                            >
                                <MenuItem value={0}>All</MenuItem>
                                <MenuItem value={1}>Applicant</MenuItem>
                                <MenuItem value={2}>Student</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={paymentType}
                                disabled={personTypeFilter === 1}
                                onChange={(e) => setPaymentType(e.target.value)}
                            >
                                <MenuItem value={0}>Unifast</MenuItem>
                                <MenuItem value={1}>Matriculation</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}/>

                    {/* ROW 2 */}
                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={selectedDepartmentFilter}
                                onChange={handleCollegeChange}
                            >
                                {department.map((dep) => (
                                    <MenuItem key={dep.dprtmnt_id} value={dep.dprtmnt_id}>
                                        {dep.dprtmnt_name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={1.5}>
                        <FormControl fullWidth>
                            <Select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                displayEmpty
                            >
                                <MenuItem value="">Select Program</MenuItem>
                                {programs.map((p) => (
                                    <MenuItem key={p.curriculum_id} value={p.curriculum_id}>
                                        ({p.program_code}-{p.year_description}) {p.program_description} {p.program_major}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={1.5}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleViewRecord}
                            disabled={!filteredData.length}
                        >
                            View Record
                        </Button>
                    </Grid>

                    <Grid item xs={12} md={1.5}>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleExport}
                            disabled={!filteredData.length}
                        >
                            Export XLSX
                        </Button>
                    </Grid>


                </Grid>
            </Paper>

            {viewClicked && visibleData.length > 0 ? (
                <>
                    {personTypeFilter === 1 && (
                    <ApplicantTable data={visibleData} />
                    )}

                    {personTypeFilter === 2 && (
                        <StudentTable
                            data={visibleData}
                            paymentType={paymentType}
                            onRemove={handleRemoveStudent}
                        />
                    )}
                </>
            ) : (
                <Paper
                    sx={{
                        padding: "6rem 0rem",
                        textAlign: "center",
                        border: `2px dashed ${borderColor}`,
                        backgroundColor: "#f9f9f9",
                        mt: 2,
                    }}
                >
                    <Typography variant="h6" color="textSecondary">
                        There's no table currently being displayed.
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Click the "View Record" button to display data.
                    </Typography>
                </Paper>
            )}

        </Box>
    );
};

export default PaymentExportingModule;
