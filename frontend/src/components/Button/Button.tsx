import clsx from 'clsx'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger'
type ButtonSize = 'md' | 'lg' | 'xl'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  children: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-text shadow-lift hover:bg-primary/90 active:bg-primary/80 focus-visible:outline-ring disabled:bg-border/60 disabled:text-text-muted',
  secondary:
    'bg-secondary text-text shadow-panel hover:bg-primary/20 active:bg-primary/30 focus-visible:outline-ring disabled:bg-border/30 disabled:text-text-muted',
  outline:
    'border-2 border-border bg-surface text-text hover:bg-surface-alt/80 active:bg-surface-alt focus-visible:outline-ring disabled:border-border/80 disabled:bg-surface disabled:text-text-muted',
  danger:
    'bg-danger text-text shadow-lift hover:bg-danger/90 active:bg-danger/80 focus-visible:outline-danger disabled:bg-danger/40 disabled:text-text-muted',
}

const sizeStyles: Record<ButtonSize, string> = {
  md: 'min-h-[44px] px-4 text-base',
  lg: 'min-h-[56px] px-6 text-lg',
  xl: 'min-h-[64px] px-8 text-xl',
}

const Button = ({
  variant = 'primary',
  size = 'lg',
  fullWidth = false,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center rounded-pill font-semibold transition active:translate-y-[1px] disabled:cursor-not-allowed disabled:shadow-none',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
        sizeStyles[size],
        variantStyles[variant],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
