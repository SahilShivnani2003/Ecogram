import { useMutation } from "@tanstack/react-query"
import { createWithdrawl } from "../service/wallet.service"

export const useCreateWithdrawl = () => {
    return useMutation({
        mutationFn: createWithdrawl
    })
}