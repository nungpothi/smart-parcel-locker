import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import { useDepositStore } from '@/store/depositStore'

const DepositSuccessPage = () => {
  const navigate = useNavigate()
  const { resetDeposit } = useDepositStore()

  const handleBack = () => {
    resetDeposit()
    navigate('/')
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-10">
      <Card>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-3xl">
            ✅
          </div>
          <h1 className="font-display text-3xl">ฝากพัสดุสำเร็จ</h1>
          <p className="text-base text-text/80">
            ระบบได้ส่ง SMS ไปยังเบอร์ผู้รับและผู้ส่งแล้ว
          </p>
        </div>

        <div className="mt-8">
          <Button fullWidth onClick={handleBack}>
            กลับหน้าแรก
          </Button>
        </div>
      </Card>
    </main>
  )
}

export default DepositSuccessPage
