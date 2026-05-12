import { useQuery } from "@tanstack/react-query"
import { getMyInvestments } from "../service/investment.service"

export const useGetMyInvestment = () => {
    return useQuery({
        queryKey: ["getMyInvestment"],
        queryFn: getMyInvestments,
    })
}