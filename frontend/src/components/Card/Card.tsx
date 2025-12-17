import clsx from 'clsx'
import type { ReactNode } from 'react'

type CardProps = {
  title?: string
  children: ReactNode
  className?: string
}

const Card = ({ title, children, className }: CardProps) => {
  return (
    <section
      className={clsx(
        'rounded-panel border border-border/70 bg-surface p-6 shadow-panel sm:p-8',
        className,
      )}
    >
      {title && <h2 className="font-display text-2xl">{title}</h2>}
      <div className={clsx(title && 'mt-4')}>{children}</div>
    </section>
  )
}

export default Card
