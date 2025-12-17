import { useForm } from 'react-hook-form'
import Button from '@/components/Button'
import Input from '@/components/Input'

type PickupPhoneValues = {
  phone: string
}

type PickupPhoneFormProps = {
  onSubmit: (phone: string) => void
}

const PickupPhoneForm = ({ onSubmit }: PickupPhoneFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PickupPhoneValues>({
    defaultValues: { phone: '' },
  })

  const submitHandler = (values: PickupPhoneValues) => {
    onSubmit(values.phone)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitHandler)}>
      <Input
        label="Phone number"
        placeholder="Enter your phone number"
        {...register('phone', { required: 'Phone number is required' })}
        error={errors.phone?.message}
      />
      <Button type="submit" fullWidth>
        Request OTP
      </Button>
    </form>
  )
}

export default PickupPhoneForm
