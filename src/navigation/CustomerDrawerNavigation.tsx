import CustomDrawerContent from '@/components/CustomDrawerContent';
import BookingsScreen from '@/features/bookings/screens/BookingScreen';
import ProfileScreen from '@/features/profile/screens/InvestorProfileScreen';
import SupportScreen from '@/features/support/screens/SupportScreen';
import { CustomerDrawerParamList } from '@/types/CustomerDrawerParamList';
import { DrawerItem } from '@/types/DrawerItem';
import { createDrawerNavigator } from '@react-navigation/drawer';

const customerDrawerItems: DrawerItem[] = [
    { name: 'Bookings', label: 'Bookings', iconName: 'book-outline' },
    { name: 'Support', label: 'Support', iconName: 'help-circle-outline' },
    { name: 'Profile', label: 'Profile', iconName: 'person-outline' },
];

const Drawer = createDrawerNavigator<CustomerDrawerParamList>();

export default function CustomerDrawerNavigation() {
    return (
        <Drawer.Navigator
        screenOptions={{ headerShown: false }}
                    drawerContent={props => (
                        <CustomDrawerContent
                            {...props}
                            drawerItems={customerDrawerItems}
                            headerTitle="Customer"
                        />
                    )}
        >
            <Drawer.Screen name="Bookings" component={BookingsScreen} />
            <Drawer.Screen name="Support" component={SupportScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />
        </Drawer.Navigator>
    );
}
