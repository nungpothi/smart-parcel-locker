import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <label className="block w-full text-left">
      {label && (
        <span className="text-sm font-semibold text-text-muted">{label}</span>
      )}
      <input
        className={clsx(
          'mt-2 min-h-[52px] w-full rounded-control border px-4 py-3 text-lg text-text placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-ring/30',
          error
            ? 'border-danger ring-2 ring-danger-soft'
            : 'border-border focus:border-primary-strong',
          className,
        )}
        {...props}
      />
      {error && (
        <span className="mt-2 block text-sm text-danger">{error}</span>
      )}
    </label>
  )
}

export default Input
