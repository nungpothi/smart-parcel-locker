import { Outlet } from 'react-router-dom'
import PageContainer from '@/components/PageContainer'

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-base font-body text-lg leading-relaxed text-text">
      <PageContainer
        as="div"
        width="default"
        paddingX="roomy"
        paddingY="roomy"
        className="flex min-h-screen flex-col"
      >
        <main className="flex flex-1 flex-col gap-8">
          <Outlet />
        </main>
      </PageContainer>
    </div>
  )
}

export default PublicLayout
