import SplashScreen from '@/screens/SplashScreen';
import { RootStackParamList } from '@/types/RootStackParamList';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import InvestorDrawerNavigation from './InvestorDrawerNavigation';
import { useColorScheme } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/service/queryClient';
import { AlertProvider } from '@/context/AlertContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
export default function AppNavigator() {
    const isDark = useColorScheme() === 'dark';
    return (
        <QueryClientProvider client={queryClient}>
            <AlertProvider>
                <NavigationContainer>
                    <Stack.Navigator
                        screenOptions={{
                            headerShown: false,
                            statusBarStyle: isDark ? 'light' : 'dark',
                        }}
                    >
                        <Stack.Screen name="splash" component={SplashScreen} />
                        <Stack.Screen name="investor" component={InvestorDrawerNavigation} />
                    </Stack.Navigator>
                </NavigationContainer>
            </AlertProvider>
        </QueryClientProvider>
    );
}
