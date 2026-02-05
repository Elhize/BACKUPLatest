import React, { useState, useEffect, useContext, useRef } from "react";
import { SettingsContext } from "../App";
import axios from "axios";
import {
  Box,
  TextField,
  Button,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TableContainer,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  Grid,
  FormControlLabel
} from "@mui/material";
import Unauthorized from "../components/Unauthorized";
import LoadingOverlay from "../components/LoadingOverlay";
import API_BASE_URL from "../apiConfig";

const TOSF = () => {
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

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasAccess, setHasAccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const pageId = 99;

  const [employeeID, setEmployeeID] = useState("");

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

  const [tosfData, setTosfData] = useState([]);


  const [formData, setFormData] = useState({
    athletic_fee: "",
    cultural_fee: "",
    developmental_fee: "",
    guidance_fee: "",
    library_fee: "",
    medical_and_dental_fee: "",
    registration_fee: "",
    school_id_fees: "",   // ✅ ADD THIS
    nstp_fees: "",
    computer_fees: "",
    laboratory_fees: "",
  });




  const [editingId, setEditingId] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Fetch all TOSF data
  const fetchTosf = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tosf`);
      setTosfData(res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Error fetching data", "error");
    }
  };

  const yearLevelMap = {
    1: "First Year",
    2: "Second Year",
    3: "Third Year",
    4: "Fourth Year",
    5: "Fifth Year",
  };

  const semesterMap = {
    1: "First Semester",
    2: "Second Semester",
    3: "Summer",
  };

  useEffect(() => {
    fetchTosf();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Show snackbar
  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle submit for create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_BASE_URL}/update_tosf/${editingId}`, formData);
        showSnackbar("Data successfully updated!");
      } else {
        await axios.post(`${API_BASE_URL}/insert_tosf`, formData);
        showSnackbar("Data successfully inserted!");
      }
      setFormData({
        athletic_fee: "",
        cultural_fee: "",
        developmental_fee: "",
        guidance_fee: "",
        library_fee: "",
        medical_and_dental_fee: "",
        registration_fee: "",
        school_id_fees: "",   // ✅ ADD
        nstp_fees: "",
        computer_fees: "",
        laboratory_fees: "",
      });

      setEditingId(null);
      fetchTosf();
    } catch (error) {
      console.error("Error submitting data:", error);
      showSnackbar("Error while saving data", "error");
    }
  };



  // Handle edit
  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.tosf_id);
  };

  // Open delete dialog
  const handleDeleteDialog = (tosf_id) => {
    setSelectedId(tosf_id);
    setDialogOpen(true);
  };

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/departments`);
        setDepartments(res.data); // [{ dprtmnt_id, dprtmnt_name }]
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      }
    };

    const fetchPrograms = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/programs`);
        setPrograms(res.data);
      } catch (err) {
        console.error("Failed to fetch programs:", err);
      }
    };


    fetchDepartments();
    fetchPrograms();
  }, []);


  // Confirm delete
  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/delete_tosf/${selectedId}`);
      showSnackbar("Data successfully deleted!");
      fetchTosf();
    } catch (error) {
      console.error("Error deleting data:", error);
      showSnackbar("Error while deleting data", "error");
    } finally {
      setDialogOpen(false);
      setSelectedId(null);
    }
  };


  // Add these new states near your existing states for TOSF
  const [feeRules, setFeeRules] = useState([]);
  const [feeForm, setFeeForm] = useState({
    fee_code: "",
    description: "",
    amount: "",
    applies_to_all: 0,
    semester_id: "",
    year_level_id: "",
    dprtmnt_id: "",
    program_id: ""
  });

  const [editingFeeId, setEditingFeeId] = useState(null);

  // Fetch all fee rules
  const fetchFeeRules = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/fee_rules`);
      setFeeRules(res.data);
    } catch (err) {
      console.error("Error fetching fee rules:", err);
      showSnackbar("Failed to fetch fee rules", "error");
    }
  };

  useEffect(() => {
    fetchFeeRules();
  }, []);

  const [miscFee, setMiscFee] = useState(null);


  const fetchMiscFee = async (year_level_id, semester_id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/misc_fee`, {
        params: {
          year_level_id,
          semester_id
        }
      });
      setMiscFee(res.data);
    } catch (err) {
      console.error("Failed to fetch misc fee", err);
      setMiscFee(null);
    }
  };



  // Handle input changes for fee form
  const handleFeeChange = (e) => {
    setFeeForm({ ...feeForm, [e.target.name]: e.target.value });
  };

  // Handle fee form submit (create or update)
  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFeeId) {
        await axios.put(`${API_BASE_URL}/update_fee_rule/${editingFeeId}`, feeForm);
        showSnackbar("Fee rule updated!");
      } else {
        await axios.post(`${API_BASE_URL}/insert_fee_rule`, feeForm);
        showSnackbar("Fee rule added!");
      }
      setFeeForm({
        fee_code: "",
        description: "",
        amount: "",
        applies_to_all: 0,
        semester_id: "",
        year_level_id: "",
        dprtmnt_id: "",
        program_id: ""
      });

      setEditingFeeId(null);
      fetchFeeRules();
    } catch (err) {
      console.error("Error submitting fee rule:", err);
      showSnackbar("Error saving fee rule", "error");
    }
  };

  // Handle edit fee rule
  const handleEditFee = (item) => {
    setFeeForm(item);
    setEditingFeeId(item.fee_rule_id);

  };


  // Handle delete fee rule
  const handleDeleteFee = async (fee_code) => {
    if (!window.confirm("Are you sure you want to delete this fee rule?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/delete_fee_rule/${fee_code}`);
      showSnackbar("Fee rule deleted!");
      fetchFeeRules();
    } catch (err) {
      console.error("Error deleting fee rule:", err);
      showSnackbar("Error deleting fee rule", "error");
    }
  };


  // Cancel delete
  const handleDeleteCancel = () => {
    setDialogOpen(false);
    setSelectedId(null);
  };

  // ✅ Access Guards
  if (loading || hasAccess === null) {
    return <LoadingOverlay open={loading} message="Checking Access..." />;
  }

  if (!hasAccess) {
    return <Unauthorized />;
  }


  return (
    <Box sx={{ height: "calc(100vh - 150px)", overflowY: "auto", paddingRight: 1, backgroundColor: "transparent", mt: 1, padding: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: titleColor,
            fontSize: "36px",
          }}
        >
          TUITION FEE MANAGEMENT
        </Typography>
      </Box>

      <hr style={{ border: "1px solid #ccc", width: "100%" }} />
      <br />


      {/* TITLE */}
      <TableContainer component={Paper} sx={{ width: "100%", border: `2px solid ${borderColor}` }}>
        <Table>
          <TableHead sx={{ backgroundColor: settings?.header_color || "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white", textAlign: "center", fontWeight: "bold" }}>
                TOSF MANAGEMENT
              </TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      {/* FORM CONTAINER */}
      <Paper sx={{ padding: 2, mb: 3, border: `2px solid ${borderColor}` }}>
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 2,
            }}
          >
            {Object.keys(formData).map((key) => (
              <Box key={key} sx={{ display: "flex", flexDirection: "column" }}>
                <Typography sx={{ fontWeight: "500", mb: 0.5 }}>
                  {key.replace(/_/g, " ").toUpperCase()}
                </Typography>
                <TextField
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  required
                />
              </Box>
            ))}
          </Box>



          <Box sx={{ mt: 2, textAlign: "right" }}>
            <Button
              type="submit"
              variant="contained"
              color={editingId ? "warning" : "primary"}
            >
              {editingId ? "Update Record" : "Add Record"}
            </Button>

            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    athletic_fee: "",
                    cultural_fee: "",
                    developmental_fee: "",
                    guidance_fee: "",
                    library_fee: "",
                    medical_and_dental_fee: "",
                    registration_fee: "",
                    school_id_fees: "",   // ✅ ADD
                    nstp_fees: "",
                    computer_fees: "",
                    laboratory_fees: "",
                  });

                }}
                variant="outlined"
                color="secondary"
                sx={{ ml: 2 }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      {/* TABLE SECTION */}
      <TableContainer component={Paper} sx={{ border: `2px solid ${borderColor}` }}>
        <Table>
          <TableHead
            style={{
              border: `2px solid ${borderColor}`,
              backgroundColor: settings?.header_color || "#1976d2",
            }}
          >
            <TableRow>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Athletic Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Cultural Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Developmental Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Guidance Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Library Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Medical & Dental
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Registration Fee
              </TableCell>

              <TableCell
                style={{
                  border: `2px solid ${borderColor}`,
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                School ID Fee
              </TableCell>



              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                NSTP Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Computer Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Laboratory Fee
              </TableCell>
              <TableCell style={{ border: `2px solid ${borderColor}`, color: "white", textAlign: "center", fontWeight: "bold" }}>
                Actions
              </TableCell>

            </TableRow>

          </TableHead>

          <TableBody>
            {tosfData.map((item, index) => (
              <TableRow key={item.tosf_id}>
                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {index + 1}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.athletic_fee}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.cultural_fee}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.developmental_fee}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.guidance_fee}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.library_fee}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.medical_and_dental_fee}
                </TableCell>

                <TableCell style={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.registration_fee}
                </TableCell>

                <TableCell sx={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.school_id_fees}
                </TableCell>


                <TableCell sx={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.nstp_fees}
                </TableCell>

                <TableCell sx={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.computer_fees}
                </TableCell>

                <TableCell sx={{ border: `2px solid ${borderColor}`, textAlign: "center" }}>
                  {item.laboratory_fees}
                </TableCell>


                {/* ACTIONS SIDE BY SIDE */}
                <TableCell
                  style={{
                    border: `2px solid ${borderColor}`,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Button
                    onClick={() => handleEdit(item)}
                    size="small"
                    sx={{
                      backgroundColor: "green",
                      color: "white",
                      borderRadius: "5px",
                      marginRight: "6px",
                      width: "85px",
                      height: "35px",
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    onClick={() => handleDeleteDialog(item.tosf_id)}
                    size="small"
                    sx={{
                      backgroundColor: "#9E0000",
                      color: "white",
                      borderRadius: "5px",
                      width: "85px",
                      height: "35px",
                    }}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 5 }}>
        {/* <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
            flexWrap: "wrap",
            mb: 2,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              color: titleColor,
              fontSize: "36px",
            }}
          >
            EXTRA FEE
          </Typography>
        </Box> */}

        <hr style={{ border: "1px solid #ccc", width: "100%" }} />
        <br />


        {/* 
        <Paper sx={{ p: 3, mb: 4, border: `2px solid ${borderColor}` }}>
          <form onSubmit={handleFeeSubmit}>
            <Grid container spacing={3}>

      
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Fee Code"
                  name="fee_code"
                  value={feeForm.fee_code}
                  onChange={handleFeeChange}
                  required
                  size="small"
                  disabled={!!editingFeeId}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={feeForm.description}
                  onChange={handleFeeChange}
                  required
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={feeForm.amount}
                  onChange={handleFeeChange}
                  size="small"
             
                />
              </Grid>

           
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year Level (Optional)"
                  name="year_level_id"
                  type="number"
                  value={feeForm.year_level_id}
                  onChange={handleFeeChange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Semester (Optional)"
                  name="semester_id"
                  type="number"
                  value={feeForm.semester_id}
                  onChange={handleFeeChange}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Department (Optional)"
                  name="dprtmnt_id"
                  value={feeForm.dprtmnt_id || ""}
                  onChange={handleFeeChange}
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value=""></option>
                  {departments.map((dept) => (
                    <option key={dept.dprtmnt_id} value={dept.dprtmnt_id}>
                      {dept.dprtmnt_name}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  select
                  label="Program (Optional)"
                  name="program_id"
                  value={feeForm.program_id || ""}
                  onChange={handleFeeChange}
                  SelectProps={{ native: true }}
                  size="small"
                >
                  <option value=""></option>
                  {programs.map((prog) => (
                    <option key={prog.program_id} value={prog.program_id}>
                      ({prog.program_code}) - {prog.program_description} {prog.major ? `(${prog.major})` : ""}
                    </option>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={feeForm.applies_to_all === 1}
                      onChange={(e) =>
                        setFeeForm(prev => ({
                          ...prev,
                          applies_to_all: e.target.checked ? 1 : 0,
                          semester_id: "",
                          year_level_id: "",
                          dprtmnt_id: "",
                          program_id: ""
                        }))
                      }
                      color="primary"
                    />
                  }
                  label="Applies to ALL students"
                />
                <Typography variant="caption" color="textSecondary" sx={{ display: "block", ml: 5 }}>
                  When enabled, this fee applies to all students regardless of program or semester.
                </Typography>
              </Grid>

              <Grid item xs={12} sx={{ textAlign: "right" }}>
                <Button type="submit" variant="contained" color={editingFeeId ? "warning" : "primary"} sx={{ mr: 2 }}>
                  {editingFeeId ? "Update Fee" : "Add Fee"}
                </Button>
                {editingFeeId && (
                  <Button
                    onClick={() => {
                      setEditingFeeId(null);
                      setFeeForm({ fee_code: "", description: "", amount: "" });
                    }}
                    variant="outlined"
                    color="secondary"
                  >
                    Cancel
                  </Button>
                )}
              </Grid>

            </Grid>
          </form>
        </Paper> */}


        {/* Fee Rules Table */}
        {/* Fee Rules Table */}
        {/* <TableContainer component={Paper} sx={{ border: `2px solid ${borderColor}` }}>
          <Table>
            <TableHead sx={{ backgroundColor: settings?.header_color || "#1976d2" }}>
              <TableRow>
                {["ID", "Fee Code", "Description", "Amount", "Year Level", "Semester", "Department", "Program", "Actions"].map((header) => (
                  <TableCell
                    key={header}
                    sx={{ color: "white", fontWeight: "bold", textAlign: "center", border: `2px solid ${borderColor}` }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {feeRules.map((fee, index) => (
                <TableRow key={fee.fee_code}>
                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>
                    {index + 1}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>{fee.fee_code}</TableCell>
                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>{fee.description}</TableCell>
                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>{fee.amount}</TableCell>

                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>
                    {fee.year_level_id ? yearLevelMap[fee.year_level_id] : "ALL"}
                  </TableCell>

                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>
                    {fee.semester_id ? semesterMap[fee.semester_id] : "ALL"}
                  </TableCell>


                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>
                    {fee.dprtmnt_id
                      ? departments.find((d) => d.dprtmnt_id === fee.dprtmnt_id)?.dprtmnt_name || "NONE"
                      : "NONE"}
                  </TableCell>

                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>
                    {(() => {
                      const prog = programs.find(p => p.program_id === fee.program_id);
                      if (!prog) return "NONE";
                      return `${prog.program_description}${prog.major ? " — " + prog.major : ""}`;
                    })()}
                  </TableCell>


                  <TableCell sx={{ textAlign: "center", border: `2px solid ${borderColor}` }}>
                    <Button
                      onClick={() => handleEditFee(fee)}
                      size="small"
                      sx={{
                        backgroundColor: "green",
                        color: "white",
                        borderRadius: "5px",
                        marginRight: "6px",
                        width: "85px",
                        height: "35px",
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDeleteFee(fee.fee_code)}
                      size="small"
                      sx={{
                        backgroundColor: "#9E0000",
                        color: "white",
                        borderRadius: "5px",
                        width: "85px",
                        height: "35px",
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer> */}

      </Box>

      {miscFee && (
        <Paper sx={{ mt: 3, p: 2, border: `2px solid ${borderColor}` }}>
          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Miscellaneous Fee
          </Typography>

          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>{miscFee.description}</TableCell>
                <TableCell align="right">
                  {Number(miscFee.amount).toLocaleString()}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      )}



      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={dialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Confirmation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TOSF;
