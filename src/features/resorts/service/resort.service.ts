import { publicClient } from "@/service/apiClient";

export const getAllResorts = async () => {
    try {
        console.log('Fetching all resorts...');

        const response = await publicClient.get('/resorts/');

        console.log('All resort response : ', response.data);

        return response.data;

    } catch (error) {
        console.error('Error while fetching resorts : ', error);
        throw error;
    }
}