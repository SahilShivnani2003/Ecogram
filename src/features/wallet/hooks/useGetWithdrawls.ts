import { useQuery } from "@tanstack/react-query"
import { getWithdrawls } from "../service/wallet.service"

export const useGetWithdrawls = () =>{
    return useQuery({
        queryKey: ["getWithdrawls"],
        queryFn: getWithdrawls,
    })
}