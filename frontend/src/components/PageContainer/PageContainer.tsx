import clsx from 'clsx'
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react'

type PageWidth = 'narrow' | 'default' | 'wide'
type HorizontalPadding = 'standard' | 'roomy'
type VerticalPadding = 'none' | 'cozy' | 'roomy'

type PageContainerProps<T extends ElementType = 'div'> = {
  as?: T
  width?: PageWidth
  paddingX?: HorizontalPadding
  paddingY?: VerticalPadding
  children: ReactNode
  className?: string
}

const widthClasses: Record<PageWidth, string> = {
  narrow: 'max-w-3xl',
  default: 'max-w-4xl',
  wide: 'max-w-6xl',
}

const paddingXClasses: Record<HorizontalPadding, string> = {
  standard: 'px-5 sm:px-8',
  roomy: 'px-6 sm:px-10',
}

const paddingYClasses: Record<VerticalPadding, string> = {
  none: 'py-0',
  cozy: 'py-6 sm:py-8',
  roomy: 'py-10 sm:py-12',
}

const PageContainer = <T extends ElementType = 'div'>({
  as,
  width = 'default',
  paddingX = 'roomy',
  paddingY = 'roomy',
  children,
  className,
  ...props
}: PageContainerProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof PageContainerProps<T>>) => {
  const Component = as ?? 'div'

  return (
    <Component
      className={clsx(
        'mx-auto w-full',
        widthClasses[width],
        paddingXClasses[paddingX],
        paddingYClasses[paddingY],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

export default PageContainer
