import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  className?: string;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  const typeClasses = {
    default: 'text-[16px] leading-[24px]',
    defaultSemiBold: 'text-[16px] leading-[24px] font-semibold',
    title: 'text-[32px] font-bold leading-[32px]',
    subtitle: 'text-[20px] font-bold',
    link: 'leading-[30px] text-[16px] text-[#0a7ea4]',
  };

  return (
    <Text
      style={[{ color }, style]}
      className={`${typeClasses[type]} ${className || ''}`}
      {...rest}
    />
  );
}
