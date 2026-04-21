import { useQuery } from "@tanstack/react-query"
import { getAllPlans } from "../service/plan.service"

export const useGetPlans = () => {
    return useQuery({
        queryKey: ["getPlans"],
        queryFn: getAllPlans,
    })
}