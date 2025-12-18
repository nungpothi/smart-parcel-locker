import clsx from 'clsx'
import type { ReactNode } from 'react'

type PageHeaderVariant = 'public' | 'admin'
type PageHeaderAlign = 'left' | 'center'

type PageHeaderProps = {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: ReactNode
  variant?: PageHeaderVariant
  align?: PageHeaderAlign
  className?: string
}

const variantTitleClasses: Record<PageHeaderVariant, string> = {
  public: 'font-display text-4xl sm:text-5xl',
  admin: 'font-display text-3xl sm:text-4xl',
}

const variantSubtitleClasses: Record<PageHeaderVariant, string> = {
  public: 'text-lg text-text-muted',
  admin: 'text-base text-text-muted',
}

const variantRootGapClasses: Record<PageHeaderVariant, string> = {
  public: 'gap-3 sm:gap-4',
  admin: 'gap-2',
}

const variantTextBlockGapClasses: Record<PageHeaderVariant, string> = {
  public: 'gap-3 sm:gap-4',
  admin: 'gap-2',
}

const eyebrowClasses: Record<PageHeaderVariant, string> = {
  public: 'text-sm font-semibold uppercase tracking-[0.2em] text-text-subtle',
  admin: 'text-xs font-semibold uppercase tracking-[0.28em] text-text-subtle',
}

const PageHeader = ({
  title,
  subtitle,
  eyebrow,
  actions,
  variant = 'public',
  align,
  className,
}: PageHeaderProps) => {
  const alignment: PageHeaderAlign =
    align ?? (variant === 'public' ? 'center' : 'left')

  return (
    <header
      className={clsx(
        'flex w-full flex-col',
        variantRootGapClasses[variant],
        alignment === 'center' ? 'items-center text-center' : 'items-start',
        className,
      )}
    >
      <div className="flex w-full flex-col gap-1">
        {eyebrow && <p className={eyebrowClasses[variant]}>{eyebrow}</p>}
        <div className="flex w-full flex-wrap items-end justify-between gap-4">
          <div
            className={clsx(
              'flex flex-col',
              variantTextBlockGapClasses[variant],
              alignment === 'center' && 'w-full items-center',
            )}
          >
            <h1 className={variantTitleClasses[variant]}>{title}</h1>
            {subtitle && (
              <p className={variantSubtitleClasses[variant]}>{subtitle}</p>
            )}
          </div>
          {actions && (
            <div
              className={clsx(
                'flex flex-wrap items-center gap-3',
                alignment === 'center' && 'justify-center',
              )}
            >
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default PageHeader
