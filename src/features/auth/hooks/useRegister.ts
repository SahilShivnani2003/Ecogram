import { useMutation } from "@tanstack/react-query"
import { register } from "../service/auth.service"

export const useRegister = () => {
    return useMutation({
        mutationFn: register,
    })
}