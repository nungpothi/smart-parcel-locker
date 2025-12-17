import { useForm } from 'react-hook-form'
import Button from '@/components/Button'
import Input from '@/components/Input'

type PickupCodeValues = {
  token: string
}

type PickupCodeFormProps = {
  onSubmit: (token: string) => void
}

const PickupCodeForm = ({ onSubmit }: PickupCodeFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PickupCodeValues>({
    defaultValues: { token: '' },
  })

  const submitHandler = (values: PickupCodeValues) => {
    onSubmit(values.token)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submitHandler)}>
      <Input
        label="Pickup token"
        placeholder="Enter the code from your SMS"
        {...register('token', { required: 'Pickup token is required' })}
        error={errors.token?.message}
      />
      <Button type="submit" fullWidth>
        Find Parcels
      </Button>
    </form>
  )
}

export default PickupCodeForm
