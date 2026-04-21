import { useQuery } from "@tanstack/react-query"
import { getAllResorts } from "../service/resort.service"

export const useGetAllResorts = () => {
    return useQuery({
        queryKey: ["getAllResorts"],
        queryFn: getAllResorts,
    })
}