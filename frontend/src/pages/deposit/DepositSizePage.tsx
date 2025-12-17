import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { type DepositSize, useDepositStore } from '@/store/depositStore'

const sizeOptions: DepositSize[] = ['S', 'M', 'L']

const DepositSizePage = () => {
  const navigate = useNavigate()
  const { size, setSize } = useDepositStore()

  const handleConfirm = () => {
    if (!size) return
    navigate('/deposit/open')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <header className="text-center">
        <h1 className="font-display text-4xl">เลือกขนาดช่อง</h1>
      </header>

      <Card>
        <div className="grid gap-4 sm:grid-cols-3">
          {sizeOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSize(option)}
              className={clsx(
                'flex h-28 items-center justify-center rounded-3xl border-2 text-2xl font-semibold transition',
                size === option
                  ? 'border-accent bg-primary text-text shadow-soft'
                  : 'border-primary/50 bg-white text-text/70',
              )}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <Button fullWidth onClick={handleConfirm} disabled={!size}>
            ยืนยันขนาด
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default DepositSizePage
