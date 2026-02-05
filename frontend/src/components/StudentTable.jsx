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

const StudentTable = ({ data, paymentType, onRemove }) => {
  const handleTransfer = async (row) => {
    try {
      const saveEndpoint =
        paymentType === 1
          ? "/save_to_unifast"
          : "/save_to_matriculation";

      const deleteEndpoint =
        paymentType === 1
          ? `/delete_matriculation/${row.student_number}/${row.id}`
          : `/delete_unifast/${row.student_number}/${row.id}`;

      const saveRes = await axios.post(`${API_BASE_URL}${saveEndpoint}`, row);
      const generatedId =
        paymentType === 1
          ? saveRes.data.unifast_id
          : saveRes.data.matriculation_id;

      await axios.delete(`${API_BASE_URL}${deleteEndpoint}`, {
        data: { generatedId }, 
      });

      onRemove(row.student_number, row.id);
    } catch (error) {
      console.error(error);
      alert("Transfer failed");
    }
  };


  return (
    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>No.</TableCell>
            <TableCell>Campus</TableCell>
            <TableCell>Student No.</TableCell>
            <TableCell>LRN</TableCell>
            <TableCell>Last Name</TableCell>
            <TableCell>Given Name</TableCell>
            <TableCell>MI</TableCell>
            <TableCell>Degree Program</TableCell>
            <TableCell>Year Level</TableCell>
            <TableCell>Sex</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell align="right">Lab Units</TableCell>
            <TableCell align="right">Comp Units</TableCell>
            <TableCell align="right">Acad Units</TableCell>
            <TableCell align="right">NSTP Units</TableCell>
            <TableCell align="right">Tuition</TableCell>
            <TableCell align="right">Total TOSF</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>{row.campus_name}</TableCell>
              <TableCell>{row.student_number}</TableCell>
              <TableCell>{row.learner_reference_number}</TableCell>
              <TableCell>{row.last_name}</TableCell>
              <TableCell>{row.given_name}</TableCell>
              <TableCell>{row.middle_initial}</TableCell>
              <TableCell>{row.degree_program}</TableCell>
              <TableCell>{row.year_level}</TableCell>
              <TableCell>{row.sex}</TableCell>
              <TableCell>{row.email_address}</TableCell>
              <TableCell>{row.phone_number}</TableCell>
              <TableCell align="right">{row.laboratory_units}</TableCell>
              <TableCell align="right">{row.computer_units}</TableCell>
              <TableCell align="right">{row.academic_units_enrolled}</TableCell>
              <TableCell align="right">
                {row.academic_units_nstp_enrolled}
              </TableCell>
              <TableCell align="right">{row.tuition_fees}</TableCell>
              <TableCell align="right">{row.total_tosf}</TableCell>
              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleTransfer(row)}
                >
                  {paymentType === 1
                    ? "Transfer to UNIFAST"
                    : "Transfer to Matriculation"}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StudentTable;
