import { useQuery } from "@tanstack/react-query"
import { getMyDailyIncome } from "../service/dailyIncome.service"

export const useGetDailyIncome = () => {
    return useQuery({
        queryKey: ["getDailyIncome"],
        queryFn: getMyDailyIncome
    })
}