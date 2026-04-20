import { useQuery } from "@tanstack/react-query"
import { getWallet } from "../service/wallet.service"

export const useGetWallet = () =>{
    return useQuery({
        queryKey: ["getWallet"],
        queryFn: getWallet,
    })
}