import { privateClient } from "@/service/apiClient";

export const getMyDailyIncome = async () => {
    try {
        console.log('Fetching my daily income..')

        const response = await privateClient.get('/daily-income/my');

        console.log('Daily Income response : ', response.data);

        return response.data;

    } catch (error) {
        console.error('Error while fetching daily income : ', error);
        throw error;
    }
}