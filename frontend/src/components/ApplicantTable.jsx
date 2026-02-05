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

const ApplicantTable = ({ data }) => (
  <TableContainer component={Paper}>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Applicant ID</TableCell>
          <TableCell>Name</TableCell>
          <TableCell>Program</TableCell>
          <TableCell>Schedule</TableCell>
          <TableCell>Proctor</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map((row, i) => (
          <TableRow key={i}>
            <TableCell>{row.applicant_id}</TableCell>
            <TableCell>
              {row.last_name.toUpperCase()}, {row.first_name}
            </TableCell>
            <TableCell>{row.program_description}</TableCell>
            <TableCell>{row.start_time}-{row.end_time}, {row.building_description} ({row.room_description})</TableCell>
            <TableCell>{row.proctor}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default ApplicantTable;