import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { showModal } from '@/components/Modal'
import DepositFlowForm from '@/flows/deposit/DepositFlow'

const DepositFlow = () => {
  const navigate = useNavigate()

  const handleComplete = async () => {
    await showModal({
      title: 'Deposit Started',
      text: 'Your deposit is ready for locker selection.',
      icon: 'success',
      confirmText: 'Continue',
    })
    navigate('/')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">
          Deposit Flow
        </p>
        <h1 className="mt-3 font-display text-4xl">Deposit a Parcel</h1>
        <p className="mt-2 text-base text-text/80">
          Enter a phone number and choose a locker size.
        </p>
      </header>

      <Card>
        <DepositFlowForm onComplete={handleComplete} />
      </Card>

      <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
        Back to Welcome
      </Button>
    </main>
  )
}

export default DepositFlow
