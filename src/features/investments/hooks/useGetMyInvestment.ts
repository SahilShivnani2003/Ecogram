import { getMyDailyIncome } from "@/features/dailyIncome/service/dailyIncome.service"
import { useQuery } from "@tanstack/react-query"

export const useGetMyInvestment = () => {
    return useQuery({
        queryKey: ["getMyInvestment"],
        queryFn: getMyDailyIncome,
    })
}