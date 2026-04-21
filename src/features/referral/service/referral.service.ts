import { privateClient } from "@/service/apiClient";

export const getReferrals = async () => {
    try {
        console.log('Fetching referrals ');

        const response = await privateClient.get('/referrals/');

        console.log('Referrals response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching referrals: ', error);
        throw error;
    }
}