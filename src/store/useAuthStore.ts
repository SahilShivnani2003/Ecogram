import { User } from '@/features/profile/types/User';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    removeAuth: () => void;
    loadAuth: () => void;
}

const STORAGE_KEY = 'auth';

export const useAuthStore = create<AuthState>((set) => ({
    isAuthenticated: false,
    user: null,
    token: null,
    setAuth: async (user: User, token: string) => {
        try {
            const data = JSON.stringify({ user, token });

            await AsyncStorage.setItem(STORAGE_KEY, data);

            set({
                isAuthenticated: true,
                user,
                token
            });

        } catch (error) {
            console.error('Errow while storing auth: ', error);
        }
    },
    removeAuth: async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);

            set({
                isAuthenticated: false,
                user: null,
                token: null
            });
        } catch (error) {
            console.error('Errow while removing auth: ', error)
        }
    },
    loadAuth: async () => {
        try {
            const data = await AsyncStorage.getItem(STORAGE_KEY);

            if (data) {
                const authData = JSON.parse(data);

                set({
                    isAuthenticated: true,
                    user: authData?.user,
                    token: authData?.token
                });
            } else {
                console.warn('No reserved data found');
            }
        } catch (error) {
            console.error('Error while fetchin auth data : ', error);
        }
    }
}))