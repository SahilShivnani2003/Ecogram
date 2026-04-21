import { useQuery } from "@tanstack/react-query"
import { getMybookings } from "../service/booking.service"

export const useGetMyBookings = () => {
    return useQuery({
        queryKey: ["getMyBookings"],
        queryFn: getMybookings,
    })
}