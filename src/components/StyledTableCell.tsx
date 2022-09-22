import { styled, TableCell, tableCellClasses, TableRow } from "@mui/material";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    whiteSpace: "nowrap",
    fontSize: 12,

    margin: 0,
  },
}));

export default StyledTableCell;

export const StyledAttendanceCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    whiteSpace: "nowrap",
    fontSize: 12,
  },
}));
