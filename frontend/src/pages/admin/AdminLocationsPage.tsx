import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import { createLocation, fetchLocations, type Location } from '@/services/api'

const AdminLocationsPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [locations, setLocations] = useState<Location[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadLocations = async () => {
    setError('')
    try {
      const response = await fetchLocations()
      setLocations(response.data.data ?? [])
    } catch (err) {
      setError(t('common.errors.generic'))
    }
  }

  useEffect(() => {
    void loadLocations()
  }, [])

  const handleCreate = async () => {
    if (!code || !name) {
      setError(t('common.errors.missingData'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await createLocation({
        code,
        name,
        address: address || undefined,
      })
      setCode('')
      setName('')
      setAddress('')
      await loadLocations()
    } catch (err) {
      setError(t('common.errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="flex flex-1 flex-col gap-6">
      <PageHeader
        variant="admin"
        title={t('admin.locations.title')}
        subtitle={t('admin.locations.subtitle')}
        align="left"
      />

      <Card density="cozy">
        <div className="space-y-4">
          <Input
            label={t('admin.locations.codeLabel')}
            placeholder={t('admin.locations.codePlaceholder')}
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <Input
            label={t('admin.locations.nameLabel')}
            placeholder={t('admin.locations.namePlaceholder')}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label={t('admin.locations.addressLabel')}
            placeholder={t('admin.locations.addressPlaceholder')}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button fullWidth onClick={handleCreate} disabled={loading}>
            {t('admin.locations.create')}
          </Button>
        </div>
      </Card>

      <Card title={t('admin.locations.existingTitle')} density="cozy">
        <div className="space-y-3">
          {locations.length === 0 ? (
            <p className="text-sm text-text-muted">{t('admin.locations.empty')}</p>
          ) : (
            locations.map((location) => (
              <div
                key={location.location_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border bg-surface/80 p-4"
              >
                <div>
                  <p className="text-base font-semibold">{location.code}</p>
                  <p className="text-sm text-text-muted">{location.name}</p>
                </div>
                <span className="rounded-pill bg-secondary px-4 py-2 text-xs font-semibold text-text">
                  {location.is_active
                    ? t('admin.locations.active')
                    : t('admin.locations.inactive')}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="secondary" fullWidth onClick={() => navigate('/admin')}>
          {t('common.actions.backToAdminHome')}
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
          {t('common.actions.backToHome')}
        </Button>
      </div>
    </section>
  )
}

export default AdminLocationsPage
