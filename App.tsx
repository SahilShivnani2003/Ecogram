import InvestorDrawerNavigation from '@/navigation/InvestorDrawerNavigation';
import { StatusBar, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

function App() {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <SafeAreaProvider>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <SafeAreaView style={styles.container}>
                <InvestorDrawerNavigation />
            </SafeAreaView>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
