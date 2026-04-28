import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing } from '@/constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = useSharedValue(Colors.border.primary);

  const handleFocus = () => {
    setIsFocused(true);
    borderColor.value = withTiming(Colors.accent.primary, { duration: 200 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderColor.value = withTiming(
      error ? Colors.status.error : Colors.border.primary,
      { duration: 200 }
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: borderColor.value,
  }));

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputContainer, animatedStyle, error && styles.errorBorder]}>
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    backgroundColor: Colors.bg.secondary,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    fontSize: 16,
    fontFamily: 'Manrope_400Regular',
    color: Colors.text.primary,
  },
  errorBorder: {
    borderColor: Colors.status.error,
  },
  errorText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    color: Colors.status.error,
    marginTop: Spacing.xs,
  },
});

export default Input;
