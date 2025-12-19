import { Outlet } from 'react-router-dom'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'

const AdminLayout = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-base font-body text-text">
      <PageContainer
        as="div"
        width="wide"
        paddingX="roomy"
        paddingY="cozy"
        className="flex min-h-screen flex-col"
      >
        <div className="mb-6 flex items-center justify-between border-b border-border/70 pb-6">
          <PageHeader
            variant="admin"
            eyebrow={t('admin.home.title')}
            title={t('admin.home.subtitle')}
            align="left"
            className="mb-0"
          />
          <LanguageSwitcher variant="admin" />
        </div>
        <main className="flex flex-1 flex-col gap-6">
          <Outlet />
        </main>
      </PageContainer>
    </div>
  )
}

export default AdminLayout
