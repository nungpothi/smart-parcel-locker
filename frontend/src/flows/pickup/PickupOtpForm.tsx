import { useForm } from 'react-hook-form'
import Button from '@/components/Button'
import Input from '@/components/Input'

type PickupOtpValues = {
  otp: string
}

type PickupOtpFormProps = {
  onSubmit: (otp: string) => void
}

const PickupOtpForm = ({ onSubmit }: PickupOtpFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PickupOtpValues>({
    defaultValues: { otp: '' },
  })

  const submitHandler = (values: PickupOtpValues) => {
    onSubmit(values.otp)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitHandler)}>
      <Input
        label="One-time passcode"
        placeholder="Enter the OTP"
        {...register('otp', { required: 'OTP is required' })}
        error={errors.otp?.message}
      />
      <Button type="submit" fullWidth>
        Verify OTP
      </Button>
    </form>
  )
}

export default PickupOtpForm
