import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { useDepositStore } from '@/store/depositStore'

type DepositFlowProps = {
  onComplete?: () => void
}

const depositSchema = z.object({
  primaryPhone: z.string().min(10, 'Enter a valid phone number'),
  secondaryPhone: z.string().optional().or(z.literal('')),
  size: z.enum(['small', 'medium', 'large']),
})

type DepositFormValues = z.infer<typeof depositSchema>

const DepositFlow = ({ onComplete }: DepositFlowProps) => {
  const {
    primaryPhone,
    secondaryPhone,
    size,
    setPrimaryPhone,
    setSecondaryPhone,
    setSize,
  } = useDepositStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      primaryPhone,
      secondaryPhone,
      size: size || 'small',
    },
  })

  const onSubmit = (data: DepositFormValues) => {
    setPrimaryPhone(data.primaryPhone)
    setSecondaryPhone(data.secondaryPhone ?? '')
    setSize(data.size)
    onComplete?.()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Input
        label="Primary phone"
        placeholder="Enter primary phone"
        {...register('primaryPhone')}
        error={errors.primaryPhone?.message}
      />
      <Input
        label="Secondary phone (optional)"
        placeholder="Enter secondary phone"
        {...register('secondaryPhone')}
        error={errors.secondaryPhone?.message}
      />
      <label className="block text-left">
        <span className="text-sm font-semibold">Parcel size</span>
        <select
          className="mt-2 w-full rounded-2xl border-2 border-primary/40 bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
          {...register('size')}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </select>
      </label>
      <Button type="submit" fullWidth>
        Continue to Locker Selection
      </Button>
    </form>
  )
}

export default DepositFlow
