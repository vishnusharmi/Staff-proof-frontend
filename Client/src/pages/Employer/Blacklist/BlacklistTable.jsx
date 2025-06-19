function BlacklistTable({ records }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Blacklist Records Table:
      </h2>
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Employee Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                StaffProof ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Blacklist Reason
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Evidence
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 border-b">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 border-b">{record.employeeName}</td>
                <td className="px-4 py-3 border-b font-mono text-sm">
                  {record.staffProofId}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="max-w-xs truncate" title={record.reason}>
                    {record.reason}
                  </div>
                </td>
                <td className="px-4 py-3 border-b">
                  {record.evidence !== "None provided" ? (
                    <div className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer">
                      <FileText size={16} className="mr-1" />
                      <span className="text-sm">{record.evidence}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm">None</span>
                  )}
                </td>
                <td className="px-4 py-3 border-b">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={16} className="mr-1" />
                    <span className="text-sm">{record.date}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}








import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Typography,
  Tooltip,
  Tab,
} from "@mui/material"; 

// Styled components for table cells and rows
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: "bold",
  fontSize: "0.9rem",
  padding: "8px 16px", // Adjust padding for smaller cells
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.8rem",
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  height: "40px", // Set a fixed height for table rows
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
  "&:hover": {
    backgroundColor: theme.palette.action.selected,
    transition: "background-color 0.3s ease",
  },
}));

const BlacklistTable = ({ filteredEmployees, handleEdit, handleDeleteOpen }) => {
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Slice the filtered employees for pagination
  const paginatedEmployees = filteredEmployees.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Paper sx={{ mt: 4, boxShadow: 3, borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="blacklist table">
          <TableHead>
            <TableRow
              sx={{
                background: "linear-gradient(45deg, #3f51b5, rgb(99, 179, 244))",
                height: "50px", // Set a fixed height for the header
              }}
              className=" bg-gradient-to-r from-teal-400 to-teal-400"
            >
              <StyledTableCell className="text-white">Full Name</StyledTableCell>
              <StyledTableCell className="text-white">Email</StyledTableCell>
              {/* <StyledTableCell className="text-white">Contact</StyledTableCell> */}
              <StyledTableCell className="text-white">Position</StyledTableCell>
              <StyledTableCell className="text-white">
                Company Name
              </StyledTableCell>
              <StyledTableCell className="text-white">
                Reason for Blacklist
              </StyledTableCell>

              <StyledTableCell className="text-white">Start Date</StyledTableCell>
              <StyledTableCell className="text-white">End Date</StyledTableCell>
              {/* <StyledTableCell className="text-white">
                Blacklist Date
              </StyledTableCell> */}
              <StyledTableCell className="text-white">Status</StyledTableCell>
              <StyledTableCell className="text-white">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedEmployees.length > 0 ? (
              paginatedEmployees.map((employee) => (
                <StyledTableRow key={employee.id}>
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {employee.fullname}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">{employee.email}</Typography>
                  </TableCell>
                  {/* <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">
                      {employee.contact_number}
                    </Typography>
                  </TableCell> */}
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">{employee.position}</Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">
                      {employee.company_name}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">
                      {employee.reason_for_blacklist}
                    </Typography>
                  </TableCell> 

                    <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">
                      {employee.start_date}
                    </Typography>
                  </TableCell> 
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">
                      {employee.end_date}
                    </Typography>
                  </TableCell>
                  

                  {/* <TableCell sx={{ padding: "8px 16px" }}>
                    <Typography variant="body2">
                      {employee.blackList_date
                        ? new Date(employee.blackList_date).toLocaleDateString()
                        : "N/A"}
                    </Typography>
                  </TableCell> */}
                  <TableCell sx={{ padding: "8px 16px" }}>
                    <Chip
                      label={employee.status}
                      sx={{
                        backgroundColor:
                          employee.status === "Temporary"
                            ? "warning.light"
                            : "success.light",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "0.75rem",
                      }}
                    />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{ padding: "8px 16px", minWidth: 120 }}
                  >
                    <Tooltip title="Edit" arrow>
                      <IconButton
                        onClick={() => handleEdit(employee)}
                        sx={{
                          color: "primary.main",
                          "&:hover": { backgroundColor: "action.hover" },
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        <FiEdit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete" arrow>
                      <IconButton
                        onClick={() => handleDeleteOpen(employee.id)}
                        sx={{
                          color: "error.main",
                          "&:hover": { backgroundColor: "action.hover" },
                          transition: "background-color 0.3s ease",
                        }}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No blacklisted employees found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredEmployees.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};

export default BlacklistTable;