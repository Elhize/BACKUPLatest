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
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import LoadingOverlay from "../components/LoadingOverlay";

const CORExportingModule = () => {
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
  const [paymentType, setPaymentType] = useState(1);

  const [dataFetched, setDataFetched] = useState(false);
  const [viewClicked, setViewClicked] = useState(false);

  const settings = useContext(SettingsContext);

  const [titleColor, setTitleColor] = useState("#000000");
  const [subtitleColor, setSubtitleColor] = useState("#555555");
  const [borderColor, setBorderColor] = useState("#000000");
  const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
  const [subButtonColor, setSubButtonColor] = useState("#ffffff"); // ✅ NEW
  const [stepperColor, setStepperColor] = useState("#000000"); // ✅ NEW

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
    if (settings.main_button_color)
      setMainButtonColor(settings.main_button_color);
    if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color); // ✅ NEW
    if (settings.stepper_color) setStepperColor(settings.stepper_color); // ✅ NEW

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
      const response = await axios.get(
        `${API_BASE_URL}/api/page_access/${employeeID}/${pageId}`,
      );
      if (response.data && response.data.page_privilege === 1) {
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error("Error checking access:", error);
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
  }, []);

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
  }, []);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/get_school_semester/`)
      .then((res) => setSchoolSemester(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    fetchActiveSchoolYear();
  }, []);

  useEffect(() => {
    if (!dataFetched) return;

    let filtered = [...rawData];

    filtered = filtered.filter((d) => d.campus_id == campusFilter);
    filtered = filtered.filter((d) => d.year_id == yearId);
    filtered = filtered.filter((d) => d.semester_id == semesterId);
    if (selectedProgram) {
      filtered = filtered.filter((d) => d.program_id == selectedProgram);
    }
    setFilteredData(filtered);
  }, [rawData, campusFilter, yearId, semesterId, selectedProgram]);

  useEffect(() => {
    setViewClicked(false);
    setVisibleData([]);
  }, [campusFilter, yearId, semesterId, selectedProgram, paymentType]);

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
      const res = await axios.get(
        `${API_BASE_URL}/api/applied_program/${dprtmnt_id}`,
      );
      setPrograms(res.data);
    } catch (err) {
      console.error("❌ Department fetch error:", err);
      setErrorMessage("Failed to load department list");
    }
  };

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

  const handleViewRecord = () => {
    setVisibleData(filteredData);
    setViewClicked(true);
  };

  if (loading || hasAccess === null) {
    return <LoadingOverlay open={loading} message="Loading..." />;
  }

  if (!hasAccess) {
    return <Unauthorized />;
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        paddingRight: 1,
        backgroundColor: "transparent",
        mt: 1,
        padding: 2,
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
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

      <TableContainer
        component={Paper}
        sx={{ width: "100%", border: `2px solid ${borderColor}` }}
      >
        <Table>
          <TableHead
            sx={{ backgroundColor: settings?.header_color || "#1976d2" }}
          >
            <TableRow>
              <TableCell sx={{ color: "white", textAlign: "Center" }}>
                Payment Exporting Module
              </TableCell>
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

          <Grid item xs={12} md={7.5} />

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
                    ({p.program_code}-{p.year_description}){" "}
                    {p.program_description} {p.program_major}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6} />

          <Grid item xs={12} md={1.5}>
            <Button
              variant="contained"
              fullWidth
              onClick={""}
              disabled={!filteredData.length}
            >
              View Record
            </Button>
          </Grid>

          <Grid item xs={12} md={1.5}>
            <Button
              variant="contained"
              fullWidth
              onClick={""}
              disabled={!filteredData.length}
            >
              EXPORT PDF
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {viewClicked && visibleData.length > 0 ? (
        <></>
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
            There's no Certificate Of Registration currently being displayed.
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Click the "View COR" button to display data.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default CORExportingModule;
