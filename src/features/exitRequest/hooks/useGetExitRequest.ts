import { useQuery } from "@tanstack/react-query"
import { getMyExitRequest } from "../service/exitRequest.service"

export const useGetExitRequest = () => {
    return useQuery({
        queryKey: ["getMyExitRequest"],
        queryFn: getMyExitRequest
    })
}