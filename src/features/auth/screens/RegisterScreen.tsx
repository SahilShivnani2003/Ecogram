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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/RootStackParamList';
import { useRegister } from '../hooks/useRegister';
import { useAlert } from '@/context/AlertContext';
import { ApiError } from '@/types/ApiError';
import { User } from '@/features/profile/types/User';
import { CreateUser } from '../types/CreateUser';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
    name: string;
    email: string;
    phone: string;
    role: 'investor' | 'customer';
    referralCode: string;
    password: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
}

// ─── Validators ───────────────────────────────────────────────────────────────

function validateName(name: string): string | undefined {
    if (!name.trim()) return 'Full name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
}

function validateEmail(email: string): string | undefined {
    if (!email.trim()) return 'Email address is required';
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email.trim())) return 'Enter a valid email address';
    return undefined;
}

function validatePhone(phone: string): string | undefined {
    if (!phone.trim()) return undefined; // optional
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 10) return 'Enter a valid 10-digit phone number';
    return undefined;
}

function validatePassword(password: string): string | undefined {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
}

// ─── Role Option ──────────────────────────────────────────────────────────────

const ROLE_OPTIONS: { label: string; value: FormValues['role'] }[] = [
    { label: 'Investor — Invest in plans and earn returns', value: 'investor' },
    { label: 'Customer — Browse resorts and book stays', value: 'customer' },
];

type RegisterScreenProps = NativeStackScreenProps<RootStackParamList, 'Register'>;

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
    const alert = useAlert();
    const { mutate: register } = useRegister();

    const [values, setValues] = useState<FormValues>({
        name: '',
        email: '',
        phone: '',
        role: 'investor',
        referralCode: '',
        password: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');
    const [roleOpen, setRoleOpen] = useState(false);

    // ── Animations ────────────────────────────────────────────────────────────
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

    // ── Helpers ───────────────────────────────────────────────────────────────

    const validatorFor = (field: keyof FormErrors) => {
        switch (field) {
            case 'name':
                return validateName;
            case 'email':
                return validateEmail;
            case 'phone':
                return validatePhone;
            case 'password':
                return validatePassword;
        }
    };

    const handleChange = (field: keyof FormValues) => (text: string) => {
        setValues(v => ({ ...v, [field]: text }));
        setServerError('');
        if (touched[field] && field !== 'role' && field !== 'referralCode') {
            const validator = validatorFor(field as keyof FormErrors);
            if (validator) setErrors(e => ({ ...e, [field]: validator(text) }));
        }
    };

    const handleBlur = (field: keyof FormErrors) => () => {
        setTouched(t => ({ ...t, [field]: true }));
        const validator = validatorFor(field);
        if (validator) setErrors(e => ({ ...e, [field]: validator(values[field]) }));
    };

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

    const handleSubmit = () => {
        setTouched({ name: true, email: true, phone: true, password: true });
        const nameErr = validateName(values.name);
        const emailErr = validateEmail(values.email);
        const phoneErr = validatePhone(values.phone);
        const passErr = validatePassword(values.password);
        setErrors({ name: nameErr, email: emailErr, phone: phoneErr, password: passErr });

        if (nameErr || emailErr || phoneErr || passErr) {
            shake();
            return;
        }

        Animated.sequence([
            Animated.timing(btnScale, { toValue: 0.96, duration: 80, useNativeDriver: true }),
            Animated.timing(btnScale, { toValue: 1, duration: 80, useNativeDriver: true }),
        ]).start();

        setLoading(true);
        setServerError('');

        const payload:CreateUser = {
            name: values.name.trim(),
            email: values.email.trim(),
            phone: values.phone.trim() ,
            role: values.role,
            referralCode: values.referralCode.trim(),
            password: values.password,
        };

        register(payload, {
            onSuccess: () => {
                setLoading(false);
                alert.success('Account created! Please sign in.');
                navigation.replace('Login');
            },
            onError: (error: ApiError) => {
                setLoading(false);
                const msg = error.message || 'Registration failed. Please try again.';
                setServerError(msg);
                alert.error(msg);
            },
        });
    };

    // ── Role picker ───────────────────────────────────────────────────────────

    const selectedRole = ROLE_OPTIONS.find(r => r.value === values.role)!;

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
                    <Text style={styles.cardTitle}>Create account</Text>
                    <Text style={styles.cardSubtitle}>Join the Ecogram investor community</Text>

                    {/* Server error */}
                    {serverError ? (
                        <View style={styles.serverErrorBox}>
                            <Icon name="alert-circle" size={16} color={Colors.error} />
                            <Text style={styles.serverErrorText}>{serverError}</Text>
                        </View>
                    ) : null}

                    {/* Full Name */}
                    <AppInput
                        label="Full Name"
                        icon="account-outline"
                        required
                        placeholder="Rahul Sharma"
                        autoCapitalize="words"
                        value={values.name}
                        onChangeText={handleChange('name')}
                        onBlur={handleBlur('name')}
                        error={touched.name ? errors.name : undefined}
                        returnKeyType="next"
                    />

                    {/* Email */}
                    <AppInput
                        label="Email address"
                        icon="email-outline"
                        required
                        placeholder="investor@example.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={values.email}
                        onChangeText={handleChange('email')}
                        onBlur={handleBlur('email')}
                        error={touched.email ? errors.email : undefined}
                        returnKeyType="next"
                    />

                    {/* Phone */}
                    <AppInput
                        label="Phone (optional)"
                        icon="phone-outline"
                        placeholder="+91 98765 43210"
                        keyboardType="phone-pad"
                        value={values.phone}
                        onChangeText={handleChange('phone')}
                        onBlur={handleBlur('phone')}
                        error={touched.phone ? errors.phone : undefined}
                        returnKeyType="next"
                    />

                    {/* Register as — custom inline picker */}
                    <View style={styles.fieldGroup}>
                        <Text style={styles.fieldLabel}>
                            Register as <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.rolePicker}
                            onPress={() => setRoleOpen(o => !o)}
                            activeOpacity={0.8}
                        >
                            <Icon name="account-tie-outline" size={18} color={Colors.textMuted} />
                            <Text style={styles.rolePickerText} numberOfLines={1}>
                                {selectedRole.label}
                            </Text>
                            <Icon
                                name={roleOpen ? 'chevron-up' : 'chevron-down'}
                                size={18}
                                color={Colors.textMuted}
                            />
                        </TouchableOpacity>

                        {roleOpen && (
                            <View style={styles.roleDropdown}>
                                {ROLE_OPTIONS.map(opt => (
                                    <TouchableOpacity
                                        key={opt.value}
                                        style={[
                                            styles.roleOption,
                                            opt.value === values.role && styles.roleOptionActive,
                                        ]}
                                        onPress={() => {
                                            setValues(v => ({ ...v, role: opt.value }));
                                            setRoleOpen(false);
                                        }}
                                        activeOpacity={0.75}
                                    >
                                        <Icon
                                            name={
                                                opt.value === 'investor'
                                                    ? 'trending-up'
                                                    : 'home-outline'
                                            }
                                            size={16}
                                            color={
                                                opt.value === values.role
                                                    ? Colors.accentGreen
                                                    : Colors.textMuted
                                            }
                                        />
                                        <Text
                                            style={[
                                                styles.roleOptionText,
                                                opt.value === values.role &&
                                                    styles.roleOptionTextActive,
                                            ]}
                                        >
                                            {opt.label}
                                        </Text>
                                        {opt.value === values.role && (
                                            <Icon
                                                name="check"
                                                size={14}
                                                color={Colors.accentGreen}
                                            />
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Referral Code */}
                    <AppInput
                        label="Referral Code (optional)"
                        icon="ticket-outline"
                        placeholder="ECO1234ABCD"
                        autoCapitalize="characters"
                        autoCorrect={false}
                        value={values.referralCode}
                        onChangeText={handleChange('referralCode')}
                        returnKeyType="next"
                    />

                    {/* Password */}
                    <AppInput
                        label="Password"
                        icon="lock-outline"
                        required
                        placeholder="••••••••"
                        secureTextEntry
                        value={values.password}
                        onChangeText={handleChange('password')}
                        onBlur={handleBlur('password')}
                        error={touched.password ? errors.password : undefined}
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                    />

                    {/* Submit */}
                    <Animated.View
                        style={[{ transform: [{ scale: btnScale }] }, styles.submitWrap]}
                    >
                        <TouchableOpacity
                            style={[styles.registerBtn, loading && styles.registerBtnDisabled]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <View style={styles.btnRow}>
                                    <Icon name="loading" size={20} color={Colors.textInverse} />
                                    <Text style={styles.registerBtnText}>Creating account…</Text>
                                </View>
                            ) : (
                                <View style={styles.btnRow}>
                                    <Icon
                                        name="account-plus-outline"
                                        size={20}
                                        color={Colors.textInverse}
                                    />
                                    <Text style={styles.registerBtnText}>Create Account</Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Security note */}
                    <View style={styles.securityNote}>
                        <Icon name="shield-check-outline" size={14} color={Colors.accentGreen} />
                        <Text style={styles.securityText}>
                            256-bit encrypted · Your data is safe
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Sign-in footer ── */}
                <View style={styles.signinRow}>
                    <Text style={styles.signinPrompt}>Already have an account? </Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Login')}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.signinLink}>Sign In</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.footer}>© 2025 ABN Ecogram · Green Fields</Text>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.bgDeep },
    scroll: { flexGrow: 1, alignItems: 'center', paddingBottom: Spacing.xxxl },

    // Top area
    topArea: {
        alignItems: 'center',
        paddingTop: 64,
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
    logoWrap: { marginBottom: Spacing.md },
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

    // Role picker
    fieldGroup: { marginBottom: Spacing.md },
    fieldLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightMedium,
        marginBottom: Spacing.xs,
    },
    required: { color: Colors.error },
    rolePicker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: 13,
    },
    rolePickerText: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeSM,
    },
    roleDropdown: {
        marginTop: Spacing.xs,
        backgroundColor: Colors.bgElevated,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: Radius.md,
        overflow: 'hidden',
    },
    roleOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    roleOptionActive: { backgroundColor: '#0F3A1A' },
    roleOptionText: {
        flex: 1,
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
    },
    roleOptionTextActive: {
        color: Colors.accentGreen,
        fontWeight: Typography.fontWeightSemiBold,
    },

    // Submit
    submitWrap: { marginTop: Spacing.sm },
    registerBtn: {
        backgroundColor: Colors.accentGreen,
        borderRadius: Radius.md,
        paddingVertical: 15,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.subtle,
    },
    registerBtnDisabled: { opacity: 0.65 },
    btnRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    registerBtnText: {
        color: Colors.textInverse,
        fontSize: Typography.fontSizeMD,
        fontWeight: Typography.fontWeightBold,
        letterSpacing: 0.3,
    },

    // Security note
    securityNote: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.lg,
    },
    securityText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightMedium,
    },

    // Sign-in row
    signinRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xl },
    signinPrompt: { color: Colors.textSecondary, fontSize: Typography.fontSizeSM },
    signinLink: {
        color: Colors.accentGreen,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
    },

    footer: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
        marginTop: Spacing.xl,
        opacity: 0.5,
    },
});

export default RegisterScreen;
