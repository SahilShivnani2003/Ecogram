import { useMutation } from "@tanstack/react-query"
import { updateUser } from "../service/user.service"

export const useUpdateUser = () => {
    return useMutation({
        mutationFn: updateUser,
    })
}