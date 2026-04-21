import { privateClient } from "@/service/apiClient";
import { UpdateUser } from "../types/User";

export const updateUser = async (data: UpdateUser) => {
    try {
        console.log('Updating user.....');

        const response = await privateClient.put('/auth/profile');

        console.log('Update user response : ', response.data);

        return response.data;

    } catch (error) {
        console.error('Error while updating user : ', error);
        throw error;
    }
}