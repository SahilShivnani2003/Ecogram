import React, { useRef, useState } from 'react';
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppInput from '@components/ui/AppInput';
import { Colors, Radius, Shadow, Spacing, Typography } from '@theme/index';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
    email: string;
    password: string;
}

interface FormErrors {
    email?: string;
    password?: string;
}

interface LoginScreenProps {
    /** Called with form values on successful validation */
    onLogin?: (values: FormValues) => Promise<void> | void;
    /** Navigate to Forgot Password */
    onForgotPassword?: () => void;
    /** Navigate to Sign Up / Register */
    onSignUp?: () => void;
}

// ─── Validators ───────────────────────────────────────────────────────────────

function validateEmail(email: string): string | undefined {
    if (!email.trim()) return 'Email is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return 'Enter a valid email address';
    return undefined;
}

function validatePassword(password: string): string | undefined {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onForgotPassword, onSignUp }) => {
    const [values, setValues] = useState<FormValues>({ email: '', password: '' });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    // Animation refs
    const cardY = useRef(new Animated.Value(40)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.7)).current;
    const shakeX = useRef(new Animated.Value(0)).current;
    const btnScale = useRef(new Animated.Value(1)).current;

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                tension: 65,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, {
                toValue: 1,
                duration: 500,
                delay: 200,
                useNativeDriver: true,
            }),
            Animated.spring(cardY, {
                toValue: 0,
                tension: 55,
                friction: 8,
                delay: 200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ── Field change ──────────────────────────────────────────────────────────

    const handleChange = (field: keyof FormValues) => (text: string) => {
        setValues(v => ({ ...v, [field]: text }));
        setServerError('');
        if (touched[field]) {
            const validator = field === 'email' ? validateEmail : validatePassword;
            setErrors(e => ({ ...e, [field]: validator(text) }));
        }
    };

    const handleBlurField = (field: keyof FormValues) => () => {
        setTouched(t => ({ ...t, [field]: true }));
        const validator = field === 'email' ? validateEmail : validatePassword;
        setErrors(e => ({ ...e, [field]: validator(values[field]) }));
    };

    // ── Shake animation ───────────────────────────────────────────────────────

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeX, { toValue: -10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeX, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    // ── Submit ────────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        setTouched({ email: true, password: true });
        const emailErr = validateEmail(values.email);
        const passErr = validatePassword(values.password);
        setErrors({ email: emailErr, password: passErr });

        if (emailErr || passErr) {
            shake();
            return;
        }

        // Button press scale
        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);
        setServerError('');
        try {
            await onLogin?.(values);
        } catch (err: any) {
            setServerError(err?.message ?? 'Login failed. Please try again.');
            shake();
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = loading;

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />

            <ScrollView
                contentContainerStyle={styles.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Top brand area ── */}
                <View style={styles.topArea}>
                    {/* Glow */}
                    <View style={styles.glowTop} />

                    <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
                        <View style={styles.logoRing}>
                            <View style={styles.logoInner}>
                                <Icon name="leaf" size={32} color={Colors.accentGreen} />
                            </View>
                        </View>
                    </Animated.View>

                    <Text style={styles.brandName}>ABN Ecogram</Text>
                    <Text style={styles.portalTag}>Investor Portal</Text>
                </View>

                {/* ── Card ── */}
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: cardOpacity,
                            transform: [{ translateY: cardY }, { translateX: shakeX }],
                        },
                    ]}
                >
                    <Text style={styles.cardTitle}>Welcome back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to your investor account</Text>

                    {/* Server error */}
                    {serverError ? (
                        <View style={styles.serverErrorBox}>
                            <Icon name="alert-circle" size={16} color={Colors.error} />
                            <Text style={styles.serverErrorText}>{serverError}</Text>
                        </View>
                    ) : null}

                    {/* Fields */}
                    <AppInput
                        label="Email Address"
                        icon="email-outline"
                        required
                        placeholder="investor@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlurField('email')}
                        error={touched.email ? errors.email : undefined}
                        returnKeyType="next"
                    />

                    <AppInput
                        label="Password"
                        icon="lock-outline"
                        required
                        placeholder="••••••••"
                        secureTextEntry
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlurField('password')}
                        error={touched.password ? errors.password : undefined}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                    />

                    {/* Forgot */}
                    <TouchableOpacity
                        style={styles.forgotRow}
                        onPress={onForgotPassword}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.forgotText}>Forgot password?</Text>
                    </TouchableOpacity>

                    {/* Submit */}
                    <Animated.View style={{ transform: [{ scale: btnScale }] }}>
                        <TouchableOpacity
                            style={[styles.loginBtn, isDisabled && styles.loginBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={isDisabled}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.loadingRow}>
                                    <Icon
                                        name="loading"
                                        size={20}
                                        color={Colors.textInverse}
                                        style={styles.spinIcon}
                                    />
                                    <Text style={styles.loginBtnText}>Signing in…</Text>
                                </View>
                            ) : (
                                <View style={styles.loadingRow}>
                                    <Text style={styles.loginBtnText}>Sign In</Text>
                                    <Icon name="arrow-right" size={18} color={Colors.textInverse} />
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Divider */}
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    {/* Security note */}
                    <View style={styles.securityNote}>
                        <Icon name="shield-check-outline" size={14} color={Colors.accentGreen} />
                        <Text style={styles.securityText}>
                            256-bit encrypted · Your data is safe
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Sign-up footer ── */}
                <View style={styles.signupRow}>
                    <Text style={styles.signupPrompt}>New investor? </Text>
                    <TouchableOpacity onPress={onSignUp} activeOpacity={0.7}>
                        <Text style={styles.signupLink}>Create Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>© 2025 ABN Ecogram · Green Fields</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: Colors.bgDeep,
    },
    scroll: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: Spacing.xxxl,
    },

    // Top area
    topArea: {
        alignItems: 'center',
        paddingTop: 72,
        paddingBottom: Spacing.xl,
        width: '100%',
        position: 'relative',
    },
    glowTop: {
        position: 'absolute',
        top: 20,
        width: 260,
        height: 180,
        borderRadius: 130,
        backgroundColor: Colors.accentGreen,
        opacity: 0.07,
        transform: [{ scaleY: 0.4 }],
    },
    logoWrap: {
        marginBottom: Spacing.md,
    },
    logoRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 1.5,
        borderColor: Colors.accentMuted,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.bgCard,
        ...Shadow.card,
    },
    logoInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: Colors.bgElevated,
        alignItems: 'center',
        justifyContent: 'center',
    },
    brandName: {
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightExtraBold,
        letterSpacing: -0.3,
    },
    portalTag: {
        color: Colors.accentGreen,
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginTop: 2,
    },

    // Card
    card: {
        backgroundColor: Colors.bgCard,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.xl,
        padding: Spacing.xl,
        width: '90%',
        maxWidth: 420,
        ...Shadow.card,
    },
    cardTitle: {
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeXL,
        fontWeight: Typography.fontWeightBold,
        marginBottom: Spacing.xs,
    },
    cardSubtitle: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        marginBottom: Spacing.xl,
    },

    // Server error
    serverErrorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: '#2A0E0E',
        borderWidth: 1,
        borderColor: Colors.error,
        borderRadius: Radius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    serverErrorText: {
        color: Colors.error,
        fontSize: Typography.fontSizeSM,
        flex: 1,
    },

    // Forgot
    forgotRow: {
        alignSelf: 'flex-end',
        marginTop: -Spacing.xs,
        marginBottom: Spacing.lg,
    },
    forgotText: {
        color: Colors.accentGreen,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightMedium,
    },

    // Login button
    loginBtn: {
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.subtle,
    },
    loginBtnDisabled: {
        opacity: 0.65,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    loginBtnText: {
        color: Colors.textInverse,
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        letterSpacing: 0.3,
    },
    spinIcon: {
        // In prod, use an actual animated spinner or ActivityIndicator
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.lg,
        gap: Spacing.md,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: Colors.border,
    },
    dividerText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightSemiBold,
        letterSpacing: 1.5,
    },

    // Security
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
    },
    securityText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightMedium,
    },

    // Sign-up row
    signupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xl,
    },
    signupPrompt: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
    },
    signupLink: {
        color: Colors.accentGreen,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
    },

    // Footer
    footer: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        marginTop: Spacing.xl,
        opacity: 0.5,
    },
});

export default LoginScreen;
