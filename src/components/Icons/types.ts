export type IconName = 'bell' | 'favorite';

export type IconProps = {
  color?: string;
  size: string | number;
  icon: IconName;
  className?: string;
};