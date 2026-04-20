import { publicClient } from "@/service/apiClient";
import { CreateUser } from "../types/CreateUser";

export const register = async (data: CreateUser) => {
    try {
        console.log('Registration started...');

        const response = await publicClient.post('/auth/register', data);

        console.log('Registration response : ', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while regitring user : ', error);
        throw error;
    }
};

export const login = async (data: { email: string, password: string }) => {
    try {
        console.log('User logging....');

        const response = await publicClient.post('/auth/login', data);

        console.log('Logi response :', response.data);

        return response.data;
    } catch (error) {
        console.error('Error while login : ', error);
        throw error;
    }
};