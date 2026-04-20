import { useAuthStore } from '@/store/useAuthStore';
import { ApiError } from '@/types/ApiError';
import axios from 'axios';

const BASE_URL = 'https://ecogram.onrender.com/api';

//Public client for public routes
export const publicClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
});

//Error handling for the public client
publicClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const apiError: ApiError = {
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message || "Something went wrong",
            data: error?.response?.data
        }

        return Promise.reject(apiError);
    },
);

//Private client for protected routes
export const privateClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json"
    },
    timeout: 10000
})

//Dynamically adding token in private client
privateClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config;
    },
    (error) => Promise.reject(error)
);

//Error handling for private client
privateClient.interceptors.response.use(
    (response) => response,
    async(error) => {

        const apiError: ApiError = {
            status: error?.response?.status,
            message: error?.response?.data?.message || error?.message || "Something went wrong",
            data: error?.response?.data
        }

        if(apiError.status === 401) {
            try{
                const {updateToken} = useAuthStore.getState();
                const response = await axios.post(`${BASE_URL}/auth/refresh`);

                if(response.data?.success){
                    console.log('Token updated : ', response.data);
                    updateToken(response.data?.token);
                };
                
            }catch(error){
                console.error('Error while refreshing token : ', error);
            }
        }
        return Promise.reject(apiError);
    }
)