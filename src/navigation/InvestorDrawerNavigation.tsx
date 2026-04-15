import EmptyScreen from '@/components/EmptyScreen';
import { InvestorDrawerParamList } from '@/types/InvestorDrawerParamList';
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator<InvestorDrawerParamList>();

export default function InvestorDrawerNavigation() {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Home" component={EmptyScreen} />
        </Drawer.Navigator>
    );
}