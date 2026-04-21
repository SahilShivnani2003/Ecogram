import { useQuery } from "@tanstack/react-query"
import { getReferrals } from "../service/referral.service"

export const useGetRerrals = () => {
    return useQuery({
        queryKey: ["getReferrals"],
        queryFn: getReferrals,
    })
}