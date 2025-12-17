import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <label className="block w-full text-left">
      {label && <span className="text-sm font-semibold">{label}</span>}
      <input
        className={clsx(
          'mt-2 w-full rounded-2xl border-2 px-4 py-3 text-base focus:outline-none',
          error
            ? 'border-red-300 ring-2 ring-red-200'
            : 'border-primary/40 focus:border-primary',
          className,
        )}
        {...props}
      />
      {error && <span className="mt-2 block text-sm text-red-600">{error}</span>}
    </label>
  )
}

export default Input
