import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Colors, Radius, Shadow, Spacing, Typography} from '../theme/index';

export type EmptyVariant =
  | 'default'      
  | 'no-results'    
  | 'no-connection'
  | 'no-orders'     
  | 'no-data'       
  | 'no-products'   
  | 'no-activity'   
  | 'error'         
  | 'custom';       

export interface EmptyScreenProps {
    variant?: EmptyVariant;
    title?: string;
    subtitle?: string;
     actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  iconName?: string;
  inline?: boolean;
   style?: ViewStyle;
  hideDots?: boolean;
}

// ─── Preset map ──────────────────────────────────────────────────────────────

interface Preset {
  icon: string;
  title: string;
  subtitle: string;
  iconColor: string;
}

const PRESETS: Record<EmptyVariant, Preset> = {
  default: {
    icon: 'inbox-outline',
    title: 'Nothing here yet',
    subtitle: 'When content appears, you\'ll find it right here.',
    iconColor: Colors.accentGreen,
  },
  'no-results': {
    icon: 'magnify-close',
    title: 'No results found',
    subtitle: 'Try different keywords or adjust your filters.',
    iconColor: Colors.accentGreen,
  },
  'no-connection': {
    icon: 'wifi-off',
    title: 'No connection',
    subtitle: 'Check your network and try again.',
    iconColor: Colors.warning,
  },
  'no-orders': {
    icon: 'package-variant-closed',
    title: 'No orders yet',
    subtitle: 'Your orders will appear here once you make a purchase.',
    iconColor: Colors.accentGreen,
  },
  'no-data': {
    icon: 'chart-timeline-variant-shimmer',
    title: 'No data available',
    subtitle: 'Data will populate here as activity is recorded.',
    iconColor: Colors.accentLime,
  },
  'no-products': {
    icon: 'leaf-off',
    title: 'No products listed',
    subtitle: 'Add your first organic product to get started.',
    iconColor: Colors.accentGreen,
  },
  'no-activity': {
    icon: 'timeline-clock-outline',
    title: 'No activity yet',
    subtitle: 'Your recent actions and updates will show up here.',
    iconColor: Colors.accentGreen,
  },
  error: {
    icon: 'alert-circle-outline',
    title: 'Something went wrong',
    subtitle: 'We couldn\'t load this content. Please try again.',
    iconColor: Colors.error,
  },
  custom: {
    icon: 'help-circle-outline',
    title: 'Nothing to show',
    subtitle: '',
    iconColor: Colors.accentGreen,
  },
};

// ─── Animated dot ─────────────────────────────────────────────────────────────

const FloatingDot: React.FC<{
  size: number;
  color: string;
  delay: number;
  startX: number;
  startY: number;
}> = ({size, color, delay, startX, startY}) => {
  const y = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(y, {
            toValue: -12,
            duration: 2200,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(y, {
            toValue: 0,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.8,
            duration: 2200,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.4,
            duration: 2200,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ).start();
  }, [y, opacity, delay]);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: startX,
        top: startY,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        opacity,
        transform: [{translateY: y}],
      }}
    />
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const {width} = Dimensions.get('window');

const EmptyScreen: React.FC<EmptyScreenProps> = ({
  variant = 'default',
  title,
  subtitle,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  iconName,
  inline = false,
  style,
  hideDots = false,
}) => {
  const preset = PRESETS[variant];
  const resolvedIcon = variant === 'custom' ? (iconName ?? 'help-circle-outline') : preset.icon;
  const resolvedTitle = title ?? preset.title;
  const resolvedSubtitle = subtitle ?? preset.subtitle;
  const resolvedIconColor = preset.iconColor;

  // Entry animation
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentScale = useRef(new Animated.Value(0.88)).current;
  const ringScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {toValue: 1, duration: 600, useNativeDriver: true}),
      Animated.spring(contentScale, {toValue: 1, tension: 65, friction: 8, useNativeDriver: true}),
      Animated.spring(ringScale, {toValue: 1, tension: 50, friction: 7, delay: 100, useNativeDriver: true}),
    ]).start();
  }, [contentOpacity, contentScale, ringScale]);

  const dots = [
    {size: 6, color: Colors.accentGreen, delay: 0, startX: 40, startY: 30},
    {size: 4, color: Colors.accentLime, delay: 400, startX: width * 0.7, startY: 20},
    {size: 8, color: Colors.accentMuted, delay: 800, startX: 25, startY: 110},
    {size: 5, color: Colors.accentGreen, delay: 1200, startX: width * 0.8, startY: 100},
    {size: 3, color: Colors.accentLime, delay: 600, startX: width * 0.5, startY: 10},
  ];

  const inner = (
    <Animated.View
      style={[
        inline ? styles.inlineInner : styles.fullInner,
        {opacity: contentOpacity, transform: [{scale: contentScale}]},
      ]}>

      {/* Floating dots */}
      {!hideDots && !inline && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {dots.map((d, i) => (
            <FloatingDot key={i} {...d} />
          ))}
        </View>
      )}

      {/* Icon area */}
      <Animated.View style={[styles.ringOuter, {transform: [{scale: ringScale}]}]}>
        <View style={styles.ringMid}>
          <View style={[styles.iconCircle, {borderColor: resolvedIconColor + '40'}]}>
            <Icon name={resolvedIcon} size={inline ? 34 : 44} color={resolvedIconColor} />
          </View>
        </View>

        {/* Corner accent dots on the ring */}
        {[...Array(4)].map((_, i) => {
          const angle = (i * 90 * Math.PI) / 180;
          const r = 58;
          return (
            <View
              key={i}
              style={[
                styles.ringAccentDot,
                {
                  left: 58 + Math.cos(angle) * r - 3,
                  top: 58 + Math.sin(angle) * r - 3,
                  backgroundColor: i === 0 ? resolvedIconColor : Colors.accentMuted,
                },
              ]}
            />
          );
        })}
      </Animated.View>

      {/* Copy */}
      <Text style={[styles.title, inline && styles.titleInline]}>{resolvedTitle}</Text>
      {resolvedSubtitle ? (
        <Text style={[styles.subtitle, inline && styles.subtitleInline]}>
          {resolvedSubtitle}
        </Text>
      ) : null}

      {/* Actions */}
      {(onAction || onSecondary) && (
        <View style={styles.actions}>
          {onAction && actionLabel && (
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={onAction}
              activeOpacity={0.8}>
              <Text style={styles.primaryBtnText}>{actionLabel}</Text>
              {variant !== 'error' && (
                <Icon name="arrow-right" size={16} color={Colors.textInverse} />
              )}
            </TouchableOpacity>
          )}
          {onSecondary && secondaryLabel && (
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={onSecondary}
              activeOpacity={0.75}>
              <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Variant tag */}
      <View style={styles.variantTag}>
        <Icon name="circle-small" size={14} color={Colors.textMuted} />
        <Text style={styles.variantTagText}>{variant}</Text>
      </View>
    </Animated.View>
  );

  if (inline) {
    return (
      <View style={[styles.inlineContainer, style]}>
        {inner}
      </View>
    );
  }

  return (
    <View style={[styles.fullContainer, style]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bgDeep} />
      {inner}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Full-screen
  fullContainer: {
    flex: 1,
    backgroundColor: Colors.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  fullInner: {
    alignItems: 'center',
    width: '100%',
  },

  // Inline / card
  inlineContainer: {
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    ...Shadow.subtle,
  },
  inlineInner: {
    alignItems: 'center',
    width: '100%',
  },

  // Icon rings
  ringOuter: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  ringMid: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgCard,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
  },
  ringAccentDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Text
  title: {
    color: Colors.textPrimary,
    fontSize: Typography.fontSizeXL,
    fontWeight: Typography.fontWeightBold,
    textAlign: 'center',
    letterSpacing: Typography.letterSpacingTight,
    marginBottom: Spacing.sm,
  },
  titleInline: {
    fontSize: Typography.fontSizeLG,
  },
  subtitle: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeMD,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.78,
    marginBottom: Spacing.xl,
  },
  subtitleInline: {
    fontSize: Typography.fontSizeSM,
    maxWidth: '90%',
  },

  // Actions
  actions: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentGreen,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    ...Shadow.subtle,
  },
  primaryBtnText: {
    color: Colors.textInverse,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightBold,
  },
  secondaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
  },
  secondaryBtnText: {
    color: Colors.textSecondary,
    fontSize: Typography.fontSizeMD,
    fontWeight: Typography.fontWeightMedium,
  },

  // Variant tag (debug label at bottom)
  variantTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    gap: 2,
    opacity: 0.45,
  },
  variantTagText: {
    color: Colors.textMuted,
    fontSize: Typography.fontSizeXS,
    letterSpacing: Typography.letterSpacingWide,
    textTransform: 'uppercase',
    fontWeight: Typography.fontWeightMedium,
  },
});

export default EmptyScreen;