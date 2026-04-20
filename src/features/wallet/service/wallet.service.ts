import { privateClient } from "@/service/apiClient";

export const getWallet = async () => {
    try {
        console.log('Fetching wallet.....');

        const response = await privateClient.get('/wallet/');

        console.log('Wallet response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching wallet : ', error);
        throw error;
    }
};

export const getWithdrawls = async () => {
    try {
        console.log('Fetching withdrawls....');

        const response = await privateClient.get('/wallet/withdrawals');

        console.log('Withdrawls response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching withdrawls : ', error);
        throw error;
    }
};

export const createWithdrawl = async (data: any) => {
    try {
        console.log('Creating withdrawl ')

        const response = await privateClient.post('/wallet/withdraw');

        console.log('Create withdrawl response : ', response.data);

        return response.data;

    } catch (error) {
        console.error('Error while creating withdrawl : ', error);
        throw error;
    }
}