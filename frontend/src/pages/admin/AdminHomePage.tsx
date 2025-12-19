import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'

const AdminHomePage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <section className="flex flex-1 flex-col gap-6">
      <PageHeader
        variant="admin"
        title={t('admin.home.title')}
        subtitle={t('admin.home.subtitle')}
        align="left"
      />

      <Card density="cozy">
        <div className="space-y-4">
          <Button fullWidth onClick={() => navigate('/admin/locations')}>
            {t('admin.home.locations')}
          </Button>
          <Button fullWidth onClick={() => navigate('/admin/lockers')}>
            {t('admin.home.lockers')}
          </Button>
          <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
            {t('common.actions.backToHome')}
          </Button>
        </div>
      </Card>
    </section>
  )
}

export default AdminHomePage
