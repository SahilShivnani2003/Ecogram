import CustomDrawerContent from '@/components/CustomDrawerContent';
import BookingsScreen from '@/features/bookings/screens/BookingScreen';
import DailyIncomeScreen from '@/features/dailyIncome/screens/DailyIncomeScreen';
import DashboardScreen from '@/features/dashboard/screens/InvestorDashboardScreen';
import EarningsScreen from '@/features/Earnings/screens/EarningScreen';
import ExitRequestScreen from '@/features/exitRequest/screens/ExitRequestScreen';
import InvestmentsScreen from '@/features/investments/screens/InvestmentScreen';
import PlansScreen from '@/features/plans/screens/PlanScreen';
import ProfileScreen from '@/features/profile/screens/InvestorProfileScreen';
import ReferralScreen from '@/features/referral/screens/ReferralScreen';
import ResortsScreen from '@/features/resorts/screens/ResortScreen';
import SupportScreen from '@/features/support/screens/SupportScreen';
import WalletScreen from '@/features/wallet/screens/WalletScreen';
import { DrawerItem } from '@/types/DrawerItem';
import { InvestorDrawerParamList } from '@/types/InvestorDrawerParamList';
import { createDrawerNavigator } from '@react-navigation/drawer';

const investorDrawerItems: DrawerItem[] = [
    { name: 'Home', label: 'Dashboard', iconName: 'grid-outline' },
    { name: 'Wallet', label: 'Wallet', iconName: 'wallet-outline' },
    { name: 'Earnings', label: 'Earnings', iconName: 'cash-outline' },
    { name: 'DailyIncome', label: 'Daily Income', iconName: 'calendar-outline' },
    { name: 'Plans', label: 'Plans', iconName: 'list-outline' },
    { name: 'Investments', label: 'Investments', iconName: 'trending-up-outline' },
    { name: 'ExitRequest', label: 'Exit Request', iconName: 'log-out-outline' },
    { name: 'Resorts', label: 'Resorts', iconName: 'business-outline' },
    { name: 'Bookings', label: 'Bookings', iconName: 'book-outline' },
    { name: 'Refrels', label: 'Referrals', iconName: 'people-outline' },
    { name: 'Support', label: 'Support', iconName: 'help-circle-outline' },
    { name: 'Profile', label: 'Profile', iconName: 'person-outline' },
];

const Drawer = createDrawerNavigator<InvestorDrawerParamList>();

export default function InvestorDrawerNavigation() {
    return (
        <Drawer.Navigator
            screenOptions={{ headerShown: false }}
            drawerContent={props => (
                <CustomDrawerContent
                    {...props}
                    drawerItems={investorDrawerItems}
                    headerTitle="Investor"
                />
            )}
        >
            <Drawer.Screen name="Home" component={DashboardScreen} />
            <Drawer.Screen name="Wallet" component={WalletScreen} />
            <Drawer.Screen name="Earnings" component={EarningsScreen} />
            <Drawer.Screen name="DailyIncome" component={DailyIncomeScreen} />
            <Drawer.Screen name="Plans" component={PlansScreen} />
            <Drawer.Screen name="Investments" component={InvestmentsScreen} />
            <Drawer.Screen name="ExitRequest" component={ExitRequestScreen} />
            <Drawer.Screen name="Resorts" component={ResortsScreen} />
            <Drawer.Screen name="Bookings" component={BookingsScreen} />
            <Drawer.Screen name="Refrels" component={ReferralScreen} />
            <Drawer.Screen name="Support" component={SupportScreen} />
            <Drawer.Screen name="Profile" component={ProfileScreen} />            
        </Drawer.Navigator>
    );
}
