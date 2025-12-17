import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'

type AdminLoginValues = {
  staffId: string
  pin: string
}

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginValues>({
    defaultValues: { staffId: '', pin: '' },
  })

  const onSubmit = () => {
    navigate('/admin/parcels')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Admin Access
        </p>
        <h1 className="mt-3 font-display text-4xl">Admin Login</h1>
        <p className="mt-2 text-base text-text/80">
          Enter your staff credentials to continue.
        </p>
      </header>

      <Card>
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Staff ID"
            placeholder="Enter staff ID"
            {...register('staffId', { required: 'Staff ID is required' })}
            error={errors.staffId?.message}
          />
          <Input
            label="PIN"
            placeholder="Enter PIN"
            type="password"
            {...register('pin', { required: 'PIN is required' })}
            error={errors.pin?.message}
          />
          <Button type="submit" fullWidth>
            Sign In
          </Button>
        </form>
      </Card>

      <Button variant="secondary" fullWidth onClick={() => navigate('/')}
      >
        Back to Welcome
      </Button>
    </main>
  )
}

export default AdminLoginPage
