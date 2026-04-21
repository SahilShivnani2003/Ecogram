import { privateClient } from "@/service/apiClient";

export const getAllPlans = async () => {
    try {
        console.log('Fetching the flans....');

        const response = await privateClient.get('/plans/');

        console.log('Plans response : ', response.data);

        return response.data
    } catch (error) {
        console.error('Error while fetching the plans', error);
        throw error;
    }
}