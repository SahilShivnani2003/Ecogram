import { useMutation } from "@tanstack/react-query"
import { createInvestment } from "../service/investment.service"

export const useCreateInvestment = () => {
    return useMutation({
        mutationFn: createInvestment
    })
}