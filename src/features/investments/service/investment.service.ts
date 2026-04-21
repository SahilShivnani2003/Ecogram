import { privateClient } from "@/service/apiClient";

export const getMyInvestments = async() =>{
    try{
        console.log('Fetching my investments....');

        const response = await privateClient.get('/investments/my');

        console.log('My investment response : ', response.data);

        return response.data;
    }catch(error){
        console.error('Error while fetching my investements : ',error);
        throw error;
    }
}