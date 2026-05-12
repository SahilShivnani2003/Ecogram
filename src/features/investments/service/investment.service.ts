import { privateClient } from "@/service/apiClient";

export const getMyInvestments = async () => {
    try {
        console.log('Fetching my investments....');

        const response = await privateClient.get('/investments/my');

        console.log('My investment response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching my investements : ', error);
        throw error;
    }
}

export const createInvestment = async (data: {
    investedAmount: string,
    planId: string,
    planType: string,
    sqft: number
}) => {
    try {
        console.log('Investing in plan : ', data);

        const response = await privateClient.post('/investments', data);

        console.log('Create investment response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while creating investment: ', error);
        throw error;
    }
}