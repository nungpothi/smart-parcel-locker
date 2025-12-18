import clsx from 'clsx'
import type { InputHTMLAttributes } from 'react'

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

const Input = ({ label, error, className, ...props }: InputProps) => {
  return (
    <label className="field-stack">
      {label && <span className="field-label">{label}</span>}
      <input
        className={clsx(
          'form-control',
          error && 'form-control--error',
          className,
        )}
        {...props}
      />
      <span className={clsx('field-support', error && 'field-error')}>
        {error ?? ' '}
      </span>
    </label>
  )
}

export default Input
