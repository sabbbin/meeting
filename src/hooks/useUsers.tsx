import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function useUsers() {
    return useQuery(
        ["posts"],
        async () => await axios.get(
            "http://110.34.24.117:90/api/User/GetAllUser/10/1"
        ).then((res) => res.data)

    )
}

export default useUsers;