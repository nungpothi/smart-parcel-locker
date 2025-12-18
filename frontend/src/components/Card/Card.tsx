import clsx from 'clsx'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type CardDensity = 'spacious' | 'cozy'
type CardTone = 'default' | 'muted'

type CardProps<T extends ElementType = 'section'> = {
  as?: T
  title?: string
  description?: string
  children: ReactNode
  className?: string
  density?: CardDensity
  tone?: CardTone
}

const densityStyles: Record<CardDensity, string> = {
  spacious: 'p-8 sm:p-10',
  cozy: 'p-5 sm:p-6',
}

const toneStyles: Record<CardTone, string> = {
  default: 'bg-surface border border-border/70 shadow-panel',
  muted: 'bg-surface-alt border border-border/50 shadow-panel',
}

const Card = <T extends ElementType = 'section'>({
  as,
  title,
  description,
  children,
  className,
  density = 'spacious',
  tone = 'default',
  ...props
}: CardProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof CardProps<T>>) => {
  const Component = as ?? 'section'

  return (
    <Component
      className={clsx(
        'rounded-panel',
        toneStyles[tone],
        densityStyles[density],
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className="flex flex-col gap-2">
          {title && <h2 className="font-display text-2xl text-text">{title}</h2>}
          {description && (
            <p className="text-base text-text-muted">{description}</p>
          )}
        </div>
      )}
      <div className={clsx(title || description ? 'mt-6' : undefined)}>
        {children}
      </div>
    </Component>
  )
}

export default Card
