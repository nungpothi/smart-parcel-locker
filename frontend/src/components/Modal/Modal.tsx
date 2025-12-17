import { useEffect } from 'react'
import Swal from 'sweetalert2'
import type { SweetAlertIcon } from 'sweetalert2'

type ModalProps = {
  open: boolean
  title: string
  text?: string
  icon?: SweetAlertIcon
  confirmText?: string
  onClose?: () => void
}

const modalClasses = {
  popup: 'rounded-panel border border-border bg-surface text-left text-text shadow-panel',
  confirmButton:
    'rounded-pill bg-primary px-6 py-3 text-base font-semibold text-text shadow-lift',
}

const Modal = ({
  open,
  title,
  text,
  icon = 'info',
  confirmText = 'OK',
  onClose,
}: ModalProps) => {
  useEffect(() => {
    if (!open) return

    Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: confirmText,
      buttonsStyling: false,
      customClass: modalClasses,
    }).then(() => {
      onClose?.()
    })
  }, [open, title, text, icon, confirmText, onClose])

  return null
}

export const showModal = (options: Omit<ModalProps, 'open'>) => {
  return Swal.fire({
    title: options.title,
    text: options.text,
    icon: options.icon ?? 'info',
    confirmButtonText: options.confirmText ?? 'OK',
    buttonsStyling: false,
    customClass: modalClasses,
  })
}

export default Modal
