import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { Collapse, Divider, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { ReactNode, useState } from "react";
import { Roles } from "../roles/roles";


interface INavListProps {
    items: INavItemsProps[];
}

const Navlist = ({ items }: INavListProps) => {

    return (
        <List>
            {items.map(
                (item, index) =>
                    <NavListItems {...item} key={index} />
            )}
        </List>
    );
};

export interface INavItemsProps {
    label: string;
    icon: ReactNode;
    onClick?: () => void;
    role?: Roles[];
    items?: INavItemsProps[];
}
const NavListItems = ({ label, icon, onClick, items }: INavItemsProps) => {
    const [open, setOpen] = useState(false);

    const handleChange = () => {
        setOpen(!open);
    };

    return (
        <>
            <ListItem button onClick={items ? handleChange : onClick}>
                <ListItemIcon>{icon}</ListItemIcon>
                <ListItemText primary={label} />
                {items && (open ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            {items && (
                <Collapse in={open}>
                    <Navlist items={items} />
                    <Divider />
                </Collapse>
            )}
        </>
    );
};

export default Navlist;
