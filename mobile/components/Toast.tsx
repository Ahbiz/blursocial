import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react-native';
import { Colors, Radius, Spacing, Shadows } from '@/constants/Colors';
import { ToastMessage } from '@/types';
import * as Haptics from 'expo-haptics';

interface ToastProps {
  toast: ToastMessage;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    Haptics.notificationAsync(
      toast.type === 'success'
        ? Haptics.NotificationFeedbackType.Success
        : toast.type === 'error'
        ? Haptics.NotificationFeedbackType.Error
        : Haptics.NotificationFeedbackType.Warning
    );

    translateY.value = withSpring(0, {
      damping: 15,
      stiffness: 150,
    });
    opacity.value = withTiming(1, { duration: 200 });

    return () => {
      translateY.value = withTiming(-100, { duration: 200 });
      opacity.value = withTiming(0, { duration: 200 });
    };
  }, []);

  const handleClose = () => {
    translateY.value = withTiming(-100, { duration: 200 }, () => {
      runOnJS(onRemove)(toast.id);
    });
    opacity.value = withTiming(0, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const getIcon = () => {
    const iconProps = { size: 20, strokeWidth: 2.5 };
    switch (toast.type) {
      case 'success':
        return <CheckCircle {...iconProps} color={Colors.status.success} />;
      case 'error':
        return <XCircle {...iconProps} color={Colors.status.error} />;
      case 'warning':
        return <AlertTriangle {...iconProps} color={Colors.status.warning} />;
      default:
        return <Info {...iconProps} color={Colors.status.info} />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return `${Colors.status.success}15`;
      case 'error':
        return `${Colors.status.error}15`;
      case 'warning':
        return `${Colors.status.warning}15`;
      default:
        return `${Colors.status.info}15`;
    }
  };

  const getBorderColor = () => {
    switch (toast.type) {
      case 'success':
        return `${Colors.status.success}40`;
      case 'error':
        return `${Colors.status.error}40`;
      case 'warning':
        return `${Colors.status.warning}40`;
      default:
        return `${Colors.status.info}40`;
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      <View style={styles.iconContainer}>{getIcon()}</View>
      <Text style={styles.message} numberOfLines={2}>
        {toast.message}
      </Text>
      <Pressable
        onPress={handleClose}
        style={styles.closeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={18} color={Colors.text.secondary} strokeWidth={2} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    ...Shadows.md,
  },
  iconContainer: {
    marginRight: Spacing.sm + 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: Colors.text.primary,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
});

export default Toast;
