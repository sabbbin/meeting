import { useToggle } from "@mantine/hooks";
import {
  Alert,
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  tableCellClasses,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { flexRender, Row } from "@tanstack/react-table";
import { IGetAgenda } from "../dialog/getAgenda";
import StyledTableCell from "./StyledTableCell";
import StyledTableRow from "./StyledTableRow";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IMeeting } from "../Tables/meeting";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export interface MeetingTableProps {
  row: Row<IMeeting>;
}

const MeetingTableRow = ({ row }: MeetingTableProps) => {
  let accessToken = localStorage.getItem("access_token");
  const [shouldExpand, toggleSholdExpand] = useToggle([false, true]);
  const { data } = useQuery<IGetAgenda[], unknown, IGetAgenda[]>(
    ["getMinutes", row.original.meetId],
    () => {
      return axios
        .get("api/Minute/GetMinute", {
          params: {
            meetId: row.original.meetId!,

          },
          headers: {
            Authorization: "bearer " + accessToken,
          },
        })
        .then((res) => res.data);
    },
    {
      initialData: [],
      enabled: shouldExpand,
    }
  );

  return (
    <>
      <StyledTableRow key={row.id}>
        <StyledTableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={async () => {
              toggleSholdExpand();
            }}
          >
            {shouldExpand ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </StyledTableCell>

        {row.getVisibleCells().map((cell) => (
          <StyledTableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </StyledTableCell>
        ))}
      </StyledTableRow>

      <StyledTableRow>
        <StyledTableCell
          style={{
            border: "none",
            padding: 0,
          }}
          colSpan={9999}
        >
          <Collapse in={shouldExpand} timeout="auto" unmountOnExit>
            {data.length == 0 ? (
              <Alert
                severity="warning"
                sx={{
                  width: "100%",
                  borderRadius: 0,
                }}
              >
                This meeting has no agenda.
              </Alert>
            ) : (
              <Box
                sx={{
                  backgroundColor: "lightblue",
                  border: "2px solid lightblue",
                }}
              >
                {data.length > 0 &&
                  data.map((minute, id) => (
                    <Box
                      sx={{
                        backgroundColor: "lightgray",
                        borderRadius: 3,
                        padding: 2,
                        marginBottom: 1,
                        marginRight: 1,
                        marginTop: 1,
                      }}
                    >
                      <b>Agenda</b>

                      <Typography
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        {minute.agenda}
                      </Typography>

                      <b>Description</b>

                      <Typography
                        sx={{
                          fontSize: 13,
                        }}
                      >
                        {minute.description}
                      </Typography>

                      <Box display="flex">
                        <Typography
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          <b>Posted By: </b>
                          {minute.postedBy}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
              </Box>
            )}
          </Collapse>
        </StyledTableCell>
      </StyledTableRow>
    </>
  );
};

export default MeetingTableRow;
