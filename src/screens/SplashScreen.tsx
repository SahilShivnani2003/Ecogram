import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StatusBar, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing, Typography } from '@theme/index';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useAuthStore } from '@/store/useAuthStore';

const { width, height } = Dimensions.get('window');

type splashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen = ({ navigation }: splashScreenProps) => {
    // ── Animation refs ──────────────────────────────────────────────────────────
    const bgScale = useRef(new Animated.Value(1.08)).current;
    const logoScale = useRef(new Animated.Value(0)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const ringScale1 = useRef(new Animated.Value(0.4)).current;
    const ringOpacity1 = useRef(new Animated.Value(0)).current;
    const ringScale2 = useRef(new Animated.Value(0.4)).current;
    const ringOpacity2 = useRef(new Animated.Value(0)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;
    const textY = useRef(new Animated.Value(20)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const loadBarWidth = useRef(new Animated.Value(0)).current;
    const screenOpacity = useRef(new Animated.Value(1)).current;
    const glowOpacity = useRef(new Animated.Value(0.15)).current;
    const { loadAuth } = useAuthStore();

    const handleStartNavigation = async () => {
        await loadAuth();

        const { isAuthenticated, user } = useAuthStore.getState();

        if (isAuthenticated) {
            if (user?.role === 'investor') {
                navigation.replace('Investor');
            } else {
                console.log('Customer login');
            }
        } else {
            navigation.replace('Login');
        }
    };
    useEffect(() => {
        // Glow pulse
        Animated.loop(
            Animated.sequence([
                Animated.timing(glowOpacity, {
                    toValue: 0.45,
                    duration: 1800,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity, {
                    toValue: 0.15,
                    duration: 1800,
                    useNativeDriver: true,
                }),
            ]),
        ).start();

        // Main entrance sequence
        Animated.sequence([
            // 1. BG zoom-in settle
            Animated.timing(bgScale, {
                toValue: 1,
                duration: 700,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),

            // 2. Rings + Logo burst
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 60,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
                Animated.sequence([
                    Animated.delay(80),
                    Animated.parallel([
                        Animated.timing(ringScale1, {
                            toValue: 1,
                            duration: 500,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                        Animated.timing(ringOpacity1, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
                Animated.sequence([
                    Animated.delay(160),
                    Animated.parallel([
                        Animated.timing(ringScale2, {
                            toValue: 1,
                            duration: 600,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: true,
                        }),
                        Animated.timing(ringOpacity2, {
                            toValue: 0.45,
                            duration: 500,
                            useNativeDriver: true,
                        }),
                    ]),
                ]),
            ]),

            // 3. Text slide up
            Animated.parallel([
                Animated.timing(textOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
                Animated.timing(textY, {
                    toValue: 0,
                    duration: 380,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),

            // 4. Tagline
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 320,
                delay: 80,
                useNativeDriver: true,
            }),

            // 5. Progress bar
            Animated.timing(loadBarWidth, {
                toValue: width * 0.55,
                duration: 900,
                easing: Easing.inOut(Easing.quad),
                useNativeDriver: false,
            }),

            // 6. Hold
            Animated.delay(300),

            // 7. Fade out entire screen
            Animated.timing(screenOpacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start(() => {
            handleStartNavigation();
        });
    }, []);

    return (
        <Animated.View style={[styles.root, { opacity: screenOpacity }]}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />

            {/* Animated background */}
            <Animated.View style={[styles.bg, { transform: [{ scale: bgScale }] }]} />

            {/* Glow blob */}
            <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

            {/* Outer decorative ring */}
            <Animated.View
                style={[
                    styles.ring,
                    styles.ringOuter,
                    {
                        opacity: ringOpacity2,
                        transform: [{ scale: ringScale2 }],
                    },
                ]}
            />

            {/* Inner ring */}
            <Animated.View
                style={[
                    styles.ring,
                    styles.ringInner,
                    {
                        opacity: ringOpacity1,
                        transform: [{ scale: ringScale1 }],
                    },
                ]}
            />

            {/* Logo circle */}
            <Animated.View
                style={[
                    styles.logoCircle,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Icon name="leaf" size={46} color={Colors.accentGreen} />
            </Animated.View>

            {/* Brand name */}
            <Animated.View
                style={{
                    opacity: textOpacity,
                    transform: [{ translateY: textY }],
                    alignItems: 'center',
                    marginTop: Spacing.xl,
                }}
            >
                <Text style={styles.brandName}>ABN Ecogram</Text>
                <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
                    Green Fields · Investor Portal
                </Animated.Text>
            </Animated.View>

            {/* Bottom area */}
            <View style={styles.bottom}>
                {/* Progress bar */}
                <View style={styles.loadTrack}>
                    <Animated.View style={[styles.loadFill, { width: loadBarWidth }]} />
                </View>
                <Text style={styles.loadingText}>Initialising secure session…</Text>

                {/* Version */}
                <Text style={styles.version}>v1.0.0</Text>
            </View>
        </Animated.View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const RING_INNER = 136;
const RING_OUTER = 190;
const LOGO = 88;

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.bgDeep,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bg: {
        ...StyleSheet.absoluteFill,
        backgroundColor: Colors.bgDeep,
    },
    glow: {
        position: 'absolute',
        width: 340,
        height: 340,
        borderRadius: 170,
        backgroundColor: Colors.accentGreen,
        transform: [{ scaleY: 0.3 }],
        opacity: 0.15,
    },

    // Rings
    ring: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 1.5,
    },
    ringOuter: {
        width: RING_OUTER,
        height: RING_OUTER,
        borderColor: Colors.accentMuted,
        borderStyle: 'dashed',
    },
    ringInner: {
        width: RING_INNER,
        height: RING_INNER,
        borderColor: Colors.accentGreen,
    },

    // Logo
    logoCircle: {
        width: LOGO,
        height: LOGO,
        borderRadius: LOGO / 2,
        backgroundColor: Colors.bgElevated,
        borderWidth: 2,
        borderColor: Colors.accentGreen,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: Colors.accentGreen,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 18,
        elevation: 12,
    },

    // Text
    brandName: {
        color: Colors.textPrimary,
        fontSize: Typography.fontSize2XL,
        fontWeight: Typography.fontWeightExtraBold,
        letterSpacing: -0.5,
        marginBottom: Spacing.xs,
    },
    tagline: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        fontWeight: Typography.fontWeightMedium,
    },

    // Bottom
    bottom: {
        position: 'absolute',
        bottom: 56,
        alignItems: 'center',
        width: '100%',
        gap: Spacing.sm,
    },
    loadTrack: {
        width: width * 0.55,
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.border,
        overflow: 'hidden',
    },
    loadFill: {
        height: 3,
        borderRadius: 2,
        backgroundColor: Colors.accentGreen,
    },
    loadingText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        letterSpacing: 0.5,
        marginTop: Spacing.xs,
    },
    version: {
        color: Colors.textMuted,
        fontSize: 10,
        opacity: 0.5,
        marginTop: Spacing.xs,
    },
});

export default SplashScreen;
