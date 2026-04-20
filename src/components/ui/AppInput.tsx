import React, { useRef, useState } from 'react';
import {
    Animated,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Radius, Spacing, Typography } from '@theme/index';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppInputProps extends TextInputProps {
    label?: string;
    required?: boolean;
    icon?: string; // MaterialCommunityIcons name
    rightIcon?: string; // Static right icon
    onRightIconPress?: () => void;
    error?: string | null;
    helperText?: string;
    disabled?: boolean;
    containerStyle?: ViewStyle;
    inputStyle?: ViewStyle;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AppInput: React.FC<AppInputProps> = ({
    label,
    required = false,
    icon,
    rightIcon,
    onRightIconPress,
    error,
    helperText,
    disabled = false,
    secureTextEntry,
    containerStyle,
    inputStyle,
    onFocus,
    onBlur,
    ...rest
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const borderAnim = useRef(new Animated.Value(0)).current;
    const labelAnim = useRef(new Animated.Value(0)).current;

    const handleFocus = (e: any) => {
        setIsFocused(true);
        Animated.parallel([
            Animated.timing(borderAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
            Animated.timing(labelAnim, { toValue: 1, duration: 180, useNativeDriver: false }),
        ]).start();
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        Animated.parallel([
            Animated.timing(borderAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
            Animated.timing(labelAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
        ]).start();
        onBlur?.(e);
    };

    const borderColor = borderAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [
            error ? Colors.error : Colors.border,
            error ? Colors.error : Colors.accentGreen,
        ],
    });

    const resolvedSecure = secureTextEntry && !isPasswordVisible;
    const showPasswordToggle = secureTextEntry;

    const resolvedRightIcon = showPasswordToggle
        ? isPasswordVisible
            ? 'eye-off-outline'
            : 'eye-outline'
        : rightIcon;

    const resolvedRightPress = showPasswordToggle
        ? () => setIsPasswordVisible(v => !v)
        : onRightIconPress;

    const iconColor = error ? Colors.error : isFocused ? Colors.accentGreen : Colors.textMuted;

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Label */}
            {label && (
                <View style={styles.labelRow}>
                    <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
                    {required && <Text style={styles.required}> *</Text>}
                </View>
            )}

            {/* Input wrapper */}
            <Animated.View
                style={[
                    styles.inputWrapper,
                    { borderColor },
                    isFocused && styles.inputWrapperFocused,
                    error ? styles.inputWrapperError : null,
                    disabled && styles.inputWrapperDisabled,
                    inputStyle,
                ]}
            >
                {/* Left icon */}
                {icon && <Icon name={icon} size={18} color={iconColor} style={styles.leftIcon} />}

                {/* Text input */}
                <TextInput
                    style={[styles.input, !icon && styles.inputNoIcon]}
                    placeholderTextColor={Colors.textMuted}
                    selectionColor={Colors.accentGreen}
                    cursorColor={Colors.accentGreen}
                    editable={!disabled}
                    secureTextEntry={resolvedSecure}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...rest}
                />

                {/* Right icon */}
                {resolvedRightIcon && (
                    <TouchableOpacity
                        onPress={resolvedRightPress}
                        disabled={!resolvedRightPress}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={styles.rightIconBtn}
                    >
                        <Icon
                            name={resolvedRightIcon}
                            size={18}
                            color={isFocused ? Colors.accentGreen : Colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </Animated.View>

            {/* Error / helper */}
            {(error || helperText) && (
                <View style={styles.feedbackRow}>
                    {error ? (
                        <>
                            <Icon name="alert-circle-outline" size={12} color={Colors.error} />
                            <Text style={styles.errorText}>{error}</Text>
                        </>
                    ) : (
                        <Text style={styles.helperText}>{helperText}</Text>
                    )}
                </View>
            )}
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.md,
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs + 2,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightMedium,
    },
    labelDisabled: {
        opacity: 0.5,
    },
    required: {
        color: Colors.error,
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0D2210',
        borderWidth: 1.5,
        borderRadius: Radius.md,
        paddingHorizontal: Spacing.md,
        minHeight: 50,
    },
    inputWrapperFocused: {
        backgroundColor: '#0F2A13',
    },
    inputWrapperError: {
        borderColor: Colors.error,
        backgroundColor: '#1C0E0E',
    },
    inputWrapperDisabled: {
        opacity: 0.45,
    },
    leftIcon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: Typography.fontSizeMD,
        paddingVertical: Platform.OS === 'ios' ? 13 : 9,
        includeFontPadding: false,
    },
    inputNoIcon: {
        // no extra padding needed
    },
    rightIconBtn: {
        marginLeft: Spacing.sm,
        padding: Spacing.xs,
    },
    feedbackRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginTop: Spacing.xs,
        paddingHorizontal: 2,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.fontSizeXS,
        fontWeight: Typography.fontWeightMedium,
        flex: 1,
    },
    helperText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSizeXS,
    },
});

export default AppInput;
