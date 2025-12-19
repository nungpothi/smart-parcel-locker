import { Outlet } from 'react-router-dom'
import LanguageSwitcher from '@/components/LanguageSwitcher'
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
        <header className="mb-6 flex justify-end">
          <LanguageSwitcher variant="public" />
        </header>
        <main className="flex flex-1 flex-col gap-8">
          <Outlet />
        </main>
      </PageContainer>
    </div>
  )
}

export default PublicLayout
