import React, { useCallback, useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Radius, Shadow, Spacing, Typography } from '@theme/index';
import { AlertButton, AlertConfig, ButtonStyle } from '@/types/AlertType';

// ─── Per-type visual tokens ───────────────────────────────────────────────────

interface TypeTokens {
    icon: string;
    iconColor: string;
    iconBg: string;
    accentBar: string;
    titleColor: string;
    defaultTitle: string;
}

const TYPE_TOKENS: Record<AlertConfig['type'], TypeTokens> = {
    success: {
        icon: 'check-circle-outline',
        iconColor: '#3ECF60',
        iconBg: '#0D2A12',
        accentBar: '#3ECF60',
        titleColor: '#3ECF60',
        defaultTitle: 'Success',
    },
    error: {
        icon: 'alert-circle-outline',
        iconColor: '#E05252',
        iconBg: '#2A0E0E',
        accentBar: '#E05252',
        titleColor: '#E05252',
        defaultTitle: 'Error',
    },
    warn: {
        icon: 'alert-outline',
        iconColor: '#F5C242',
        iconBg: '#2A1C08',
        accentBar: '#F5C242',
        titleColor: '#F5C242',
        defaultTitle: 'Warning',
    },
    info: {
        icon: 'information-outline',
        iconColor: '#4A90E2',
        iconBg: '#081828',
        accentBar: '#4A90E2',
        titleColor: '#4A90E2',
        defaultTitle: 'Info',
    },
    confirm: {
        icon: 'help-circle-outline',
        iconColor: '#C27AF5',
        iconBg: '#1E1030',
        accentBar: '#C27AF5',
        titleColor: '#C27AF5',
        defaultTitle: 'Confirm',
    },
    custom: {
        icon: 'bell-outline',
        iconColor: Colors.accentGreen,
        iconBg: '#0D2A12',
        accentBar: Colors.accentGreen,
        titleColor: Colors.accentGreen,
        defaultTitle: '',
    },
};

// ─── Button style map ─────────────────────────────────────────────────────────

interface ButtonColors {
    bg: string;
    text: string;
    border: string;
}

function getButtonColors(style: ButtonStyle = 'primary', typeAccent: string): ButtonColors {
    switch (style) {
        case 'primary':
            return { bg: typeAccent, text: Colors.textInverse, border: typeAccent };
        case 'secondary':
            return { bg: Colors.bgElevated, text: Colors.textPrimary, border: Colors.border };
        case 'danger':
            return { bg: Colors.error, text: Colors.textPrimary, border: Colors.error };
        case 'ghost':
            return { bg: Colors.transparent, text: Colors.textSecondary, border: Colors.border };
    }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface AlertModalProps {
    config: AlertConfig;
    onBackdropPress: () => void;
    onButtonPress: (btn: AlertButton) => void;
    onDismiss: () => void;
    queueLength: number;
}

// ─── Progress bar (auto-dismiss indicator) ────────────────────────────────────

const ProgressBar: React.FC<{ durationMs: number; color: string }> = ({ durationMs, color }) => {
    const width = useRef(new Animated.Value(1)).current; // 1 → 0 (full → empty)
    const { width: SCREEN_WIDTH } = Dimensions.get('window');
    const BAR_WIDTH = SCREEN_WIDTH * 0.8 - Spacing.xl * 2;

    useEffect(() => {
        Animated.timing(width, {
            toValue: 0,
            duration: durationMs,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    }, []);

    const animatedWidth = width.interpolate({
        inputRange: [0, 1],
        outputRange: [0, BAR_WIDTH],
    });

    return (
        <View style={[pb.track, { width: BAR_WIDTH }]}>
            <Animated.View style={[pb.fill, { width: animatedWidth, backgroundColor: color }]} />
        </View>
    );
};

const pb = StyleSheet.create({
    track: {
        height: 3,
        backgroundColor: Colors.border,
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: Spacing.md,
        alignSelf: 'center',
    },
    fill: {
        height: 3,
        borderRadius: 2,
    },
});

// ─── Main Component ───────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_W * 0.88, 400);

const AlertModal: React.FC<AlertModalProps> = ({
    config,
    onBackdropPress,
    onButtonPress,
    onDismiss,
    queueLength,
}) => {
    const tokens = TYPE_TOKENS[config.type];

    // ── Animations ─────────────────────────────────────────────────────────
    const backdropOpacity = useRef(new Animated.Value(0)).current;
    const cardScale = useRef(new Animated.Value(0.78)).current;
    const cardOpacity = useRef(new Animated.Value(0)).current;
    const cardY = useRef(new Animated.Value(32)).current;
    const iconScale = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const accentBarW = useRef(new Animated.Value(0)).current;

    // Entrance
    useEffect(() => {
        Animated.parallel([
            // Backdrop fade
            Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
            // Card spring
            Animated.spring(cardScale, {
                toValue: 1,
                tension: 68,
                friction: 9,
                useNativeDriver: true,
            }),
            Animated.timing(cardOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
            Animated.spring(cardY, { toValue: 0, tension: 68, friction: 9, useNativeDriver: true }),
            // Icon bounce
            Animated.sequence([
                Animated.delay(120),
                Animated.spring(iconScale, {
                    toValue: 1.15,
                    tension: 80,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.spring(iconScale, {
                    toValue: 1,
                    tension: 120,
                    friction: 8,
                    useNativeDriver: true,
                }),
            ]),
            // Icon wiggle (warn/error only)
            config.type === 'error' || config.type === 'warn'
                ? Animated.sequence([
                      Animated.delay(200),
                      Animated.timing(iconRotate, {
                          toValue: 1,
                          duration: 60,
                          useNativeDriver: true,
                      }),
                      Animated.timing(iconRotate, {
                          toValue: -1,
                          duration: 60,
                          useNativeDriver: true,
                      }),
                      Animated.timing(iconRotate, {
                          toValue: 1,
                          duration: 60,
                          useNativeDriver: true,
                      }),
                      Animated.timing(iconRotate, {
                          toValue: 0,
                          duration: 60,
                          useNativeDriver: true,
                      }),
                  ])
                : Animated.delay(0),
            // Accent bar grow
            Animated.timing(accentBarW, {
                toValue: 1,
                duration: 380,
                delay: 80,
                easing: Easing.out(Easing.quad),
                useNativeDriver: false,
            }),
        ]).start();
    }, []);

    // Exit animation helper
    const animateOut = useCallback(
        (cb: () => void) => {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(cardOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
                Animated.timing(cardScale, { toValue: 0.88, duration: 180, useNativeDriver: true }),
            ]).start(cb);
        },
        [backdropOpacity, cardOpacity, cardScale],
    );

    const handleBackdropPress = () => animateOut(onBackdropPress);
    const handleButtonPress = (btn: AlertButton) => {
        if (!btn.preventClose) {
            animateOut(() => onButtonPress(btn));
        } else {
            onButtonPress(btn);
        }
    };

    // ── Derived values ──────────────────────────────────────────────────────

    const iconRotateDeg = iconRotate.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-12deg', '0deg', '12deg'],
    });

    const resolvedIcon = config.customIcon ?? tokens.icon;

    // Auto-dismiss duration
    const autoDismissMs =
        config.autoDismissMs !== undefined
            ? config.autoDismissMs
            : config.type === 'success' || config.type === 'info'
            ? 3000
            : 0;

    // Buttons — default single OK for non-confirm types with no buttons
    const buttons: AlertButton[] =
        config.buttons && config.buttons.length > 0
            ? config.buttons
            : config.type === 'confirm'
            ? [
                  { label: 'Cancel', style: 'ghost' },
                  { label: 'OK', style: 'primary' },
              ]
            : [{ label: 'OK', style: 'primary' }];

    // Layout: if only 1 button or any has fullWidth → stack vertically
    const isVertical = buttons.length === 1 || buttons.some(b => b.fullWidth);

    // Accent bar animated width
    const accentBarAnimatedW = accentBarW.interpolate({
        inputRange: [0, 1],
        outputRange: [0, CARD_WIDTH - Spacing.xl * 2],
    });

    return (
        <Modal
            transparent
            animationType="none"
            visible
            statusBarTranslucent
            onRequestClose={() => handleBackdropPress()}
        >
            {/* ── Backdrop ── */}
            <TouchableWithoutFeedback onPress={handleBackdropPress}>
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]} />
            </TouchableWithoutFeedback>

            {/* ── Card ── */}
            <View style={styles.centerer} pointerEvents="box-none">
                <Animated.View
                    style={[
                        styles.card,
                        {
                            opacity: cardOpacity,
                            transform: [{ scale: cardScale }, { translateY: cardY }],
                        },
                    ]}
                >
                    {/* Accent top bar */}
                    <View style={styles.accentBarTrack}>
                        <Animated.View
                            style={[
                                styles.accentBar,
                                {
                                    width: accentBarAnimatedW,
                                    backgroundColor: tokens.accentBar,
                                },
                            ]}
                        />
                    </View>

                    {/* Body */}
                    <View style={styles.body}>
                        {/* Queue badge */}
                        {queueLength > 1 && (
                            <View style={styles.queueBadge}>
                                <Icon name="layers-outline" size={11} color={Colors.textMuted} />
                                <Text style={styles.queueText}>{queueLength} pending</Text>
                            </View>
                        )}

                        {/* Icon */}
                        <Animated.View
                            style={[
                                styles.iconWrap,
                                {
                                    backgroundColor: tokens.iconBg,
                                    transform: [{ scale: iconScale }, { rotate: iconRotateDeg }],
                                },
                            ]}
                        >
                            <Icon name={resolvedIcon} size={32} color={tokens.iconColor} />
                        </Animated.View>

                        {/* Title */}
                        {config.title !== undefined && (
                            <Text style={[styles.title, { color: tokens.titleColor }]}>
                                {config.title || tokens.defaultTitle}
                            </Text>
                        )}

                        {/* Message */}
                        <Text style={styles.message}>{config.message}</Text>

                        {/* Custom children */}
                        {config.children && (
                            <View style={styles.childrenWrap}>{config.children}</View>
                        )}

                        {/* Auto-dismiss progress */}
                        {autoDismissMs > 0 && (
                            <ProgressBar durationMs={autoDismissMs} color={tokens.accentBar} />
                        )}
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* ── Buttons ── */}
                    <View style={[styles.btnRow, isVertical && styles.btnRowVertical]}>
                        {buttons.map((btn, idx) => {
                            const btnColors = getButtonColors(btn.style, tokens.accentBar);
                            return (
                                <TouchableOpacity
                                    key={`${btn.label}_${idx}`}
                                    style={[
                                        styles.btn,
                                        isVertical ? styles.btnFull : styles.btnFlex,
                                        {
                                            backgroundColor: btnColors.bg,
                                            borderColor: btnColors.border,
                                        },
                                        idx > 0 && !isVertical && styles.btnMarginLeft,
                                        idx > 0 && isVertical && styles.btnMarginTop,
                                    ]}
                                    onPress={() => handleButtonPress(btn)}
                                    activeOpacity={0.78}
                                >
                                    {btn.icon && (
                                        <Icon
                                            name={btn.icon}
                                            size={15}
                                            color={btnColors.text}
                                            style={styles.btnIcon}
                                        />
                                    )}
                                    <Text style={[styles.btnText, { color: btnColors.text }]}>
                                        {btn.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    // Backdrop
    backdrop: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0,0,0,0.72)',
    },

    // Centerer
    centerer: {
        ...StyleSheet.absoluteFill,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },

    // Card
    card: {
        width: CARD_WIDTH,
        backgroundColor: Colors.bgCard,
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
        ...Shadow.card,
        // Extra elevation glow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.55,
        shadowRadius: 24,
        elevation: 20,
    },

    // Accent top bar
    accentBarTrack: {
        height: 3,
        backgroundColor: Colors.border,
        overflow: 'hidden',
    },
    accentBar: {
        height: 3,
        borderRadius: 2,
    },

    // Body
    body: {
        padding: Spacing.xl,
        alignItems: 'center',
    },

    // Queue badge
    queueBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        alignSelf: 'flex-end',
        backgroundColor: Colors.bgElevated,
        borderRadius: Radius.full,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 3,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    queueText: {
        color: Colors.textMuted,
        fontSize: 10,
        fontWeight: Typography.fontWeightMedium,
    },

    // Icon
    iconWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
        borderWidth: 1,
        borderColor: Colors.border,
    },

    // Text
    title: {
        fontSize: Typography.fontSizeLG,
        fontWeight: Typography.fontWeightBold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
        letterSpacing: -0.2,
    },
    message: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSizeSM,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: CARD_WIDTH - Spacing.xl * 2 - Spacing.xl,
    },

    // Children slot
    childrenWrap: {
        width: '100%',
        marginTop: Spacing.md,
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.xl,
    },

    // Buttons
    btnRow: {
        flexDirection: 'row',
        padding: Spacing.lg,
        paddingTop: Spacing.md,
    },
    btnRowVertical: {
        flexDirection: 'column',
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: Radius.md,
        borderWidth: 1,
        paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        paddingHorizontal: Spacing.lg,
        minHeight: 46,
    },
    btnFlex: {
        flex: 1,
    },
    btnFull: {
        width: '100%',
    },
    btnMarginLeft: {
        marginLeft: Spacing.sm,
    },
    btnMarginTop: {
        marginTop: Spacing.sm,
    },
    btnIcon: {
        marginRight: Spacing.xs,
    },
    btnText: {
        fontSize: Typography.fontSizeSM,
        fontWeight: Typography.fontWeightBold,
        letterSpacing: 0.2,
    },
});

export default AlertModal;
