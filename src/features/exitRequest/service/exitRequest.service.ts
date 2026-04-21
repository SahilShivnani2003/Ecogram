import { privateClient } from "@/service/apiClient";

export const getMyExitRequest = async () => {
    try {
        console.log('Fetching my exit Request....');

        const response = await privateClient.get('')

        console.log('My exit request response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while fetching my exit request : ', error);
        throw error;
    }
}