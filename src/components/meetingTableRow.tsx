import { useToggle } from "@mantine/hooks"
import { Alert, Box, Collapse, IconButton, Table, TableBody, tableCellClasses, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
import { flexRender, Row } from "@tanstack/react-table"
import { IGetAgenda } from "../dialog/getAgenda"
import StyledTableCell from "./StyledTableCell"
import StyledTableRow from "./StyledTableRow"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { IMeeting } from "../Tables/meeting"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"


export interface MeetingTableProps {
    row: Row<IMeeting>
}


const MeetingTableRow = ({
    row
}: MeetingTableProps) => {

    let accessToken = localStorage.getItem("access_token");
    const [shouldExpand, toggleSholdExpand] = useToggle([false, true])
    const { data } = useQuery<IGetAgenda[], unknown, IGetAgenda[]>(
        ["getMinutes", row.original.meetId],
        () => {
            return axios
                .get("api/Minute/GetAgenda", {
                    params: {
                        meetId: row.original.meetId!,
                        meetTypeId: row.original.meetTypeId!
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
                        {shouldExpand ? (
                            <KeyboardArrowUpIcon />
                        ) : (
                            <KeyboardArrowDownIcon />
                        )}
                    </IconButton>
                </StyledTableCell>

                {row.getVisibleCells().map((cell) => (
                    <StyledTableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                    </StyledTableCell>
                ))}
            </StyledTableRow>

            <StyledTableRow>
                <StyledTableCell
                    style={{
                        border: 'none',
                        padding: 0,
                    }}
                    colSpan={9999}
                >
                    <Collapse
                        in={shouldExpand}
                        timeout="auto"
                        unmountOnExit
                    >
                        {data.length == 0 ? (
                            <Alert severity='warning' sx={{
                                width: '100%',
                                borderRadius: 0
                            }}
                            >
                                This meeting has no agenda.
                            </Alert>
                        ) : (
                            <Box >
                                <Typography
                                    variant="h6"
                                    gutterBottom
                                    component="div"
                                    textAlign="center"
                                >
                                    Minutes
                                </Typography>
                                <Table size="small" aria-label="purchases">
                                    <TableHead
                                        sx={{
                                            color: "se",
                                        }}
                                    >
                                        <TableRow>
                                            <StyledTableCell>Agenda</StyledTableCell>
                                            <StyledTableCell>
                                                Description
                                            </StyledTableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.length > 0 &&
                                            data.map((minute, id) => (
                                                <TableRow key={id}>
                                                    <StyledTableCell
                                                        scope="row"
                                                    >
                                                        <Tooltip title={minute.agenda}>
                                                            <Typography
                                                                sx={{
                                                                    width: "150px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {minute.agenda}
                                                            </Typography>
                                                        </Tooltip>
                                                    </StyledTableCell>
                                                    <StyledTableCell>
                                                        <Tooltip title={minute.description}>
                                                            <Typography
                                                                sx={{
                                                                    width: "150px",
                                                                    overflow: "hidden",
                                                                    textOverflow: "ellipsis",
                                                                    whiteSpace: "nowrap",
                                                                }}
                                                            >
                                                                {minute.description}
                                                            </Typography>
                                                        </Tooltip>
                                                    </StyledTableCell>

                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}
                    </Collapse>
                </StyledTableCell>
            </StyledTableRow>
        </>
    )
}

export default MeetingTableRow;