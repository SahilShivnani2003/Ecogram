import { privateClient } from "@/service/apiClient";

export const getMybookings = async() =>{
    try{
        console.log('Fetching my bookings.....');

        const response = await privateClient.get('/bookings/my');

        console.log('My booking response : ',response.data);

        return response.data;
    }catch(error){
        console.error('Error while fetching my bookings : ',error);
        throw error;
    }
}