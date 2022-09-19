import { styled, TableCell, TableRow } from "@mui/material";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:last-child td, &:last-child th": {
    border: 0,
  },
  "&:nth-of-type(odd)": {
    backgroundColor: theme.palette.action.hover,
  },
}));

export default StyledTableRow;

export const StyledAttendanceRow = styled(TableRow)(({ theme }) => ({
  "&.MuiTableRow-root": {
    margin: 0,
    py: 0,

    fontSize: 10,
  },
}));
