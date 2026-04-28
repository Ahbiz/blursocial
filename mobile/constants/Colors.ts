export const Colors = {
  bg: {
    primary: '#0B0D0F',
    secondary: '#12161A',
    tertiary: '#1A2027',
    elevated: '#1F2933',
  },
  text: {
    primary: '#F0F4F8',
    secondary: '#9FB3C8',
    tertiary: '#627D98',
  },
  accent: {
    primary: '#FF6B9D',
    secondary: '#C44569',
    glow: 'rgba(255, 107, 157, 0.15)',
  },
  border: {
    primary: 'rgba(255, 255, 255, 0.08)',
    secondary: 'rgba(255, 255, 255, 0.04)',
  },
  status: {
    success: '#4ECDC4',
    error: '#FF6B6B',
    warning: '#FFE66D',
    info: '#6B9DFF',
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 32,
    elevation: 8,
  },
  glow: {
    shadowColor: Colors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 6,
  },
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
