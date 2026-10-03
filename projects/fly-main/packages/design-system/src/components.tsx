import type { CSSProperties } from 'react';

type Variant = 'primary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const sizeStyles: Record<Size, CSSProperties> = {
  sm: { padding: '8px 14px', fontSize: 12 },
  md: {},
  lg: { padding: '18px 40px', fontSize: 16 },
};

export function Button({ variant = 'primary', size = 'md', style, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      style={sizeStyles[size] ? { ...sizeStyles[size], ...style } : style}
      className={`fk-btn fk-btn--${variant}`}
    />
  );
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, ...rest }: CardProps) {
  return (
    <div className="fk-card" {...rest}>
      {children}
    </div>
  );
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
}

export function Badge({ rarity, ...rest }: BadgeProps) {
  return (
    <span className={`fk-badge fk-badge--${rarity.toLowerCase()}`} {...rest}>
      {rarity}
    </span>
  );
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input(props: InputProps) {
  return <input className="fk-input" {...props} />;
}
