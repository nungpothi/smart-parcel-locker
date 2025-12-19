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
    <section className="flex flex-1 flex-col stack-admin-page">
      <PageHeader
        variant="admin"
        title={t('admin.locations.title')}
        subtitle={t('admin.locations.subtitle')}
        align="left"
      />

      <Card density="cozy">
        <div className="stack-admin-section">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={t('admin.locations.codeLabel')}
              placeholder={t('admin.locations.codePlaceholder')}
              value={code}
              onChange={(event) => setCode(event.target.value)}
              className="admin-control"
            />
            <Input
              label={t('admin.locations.nameLabel')}
              placeholder={t('admin.locations.namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="admin-control"
            />
            <Input
              label={t('admin.locations.addressLabel')}
              placeholder={t('admin.locations.addressPlaceholder')}
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              className="admin-control sm:col-span-2"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="stack-admin-actions sm:flex-row sm:items-center">
            <Button size="md" onClick={handleCreate} disabled={loading}>
              {t('admin.locations.create')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="p-2 sm:p-3">
        <Card title={t('admin.locations.existingTitle')} density="cozy">
          <div className="stack-admin-section">
            {locations.length === 0 ? (
              <div className="rounded-control border border-dashed border-border/80 bg-surface/60 p-4 text-sm text-text-muted">
                {t('admin.locations.empty')}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-border bg-surface/80">
                <table className="w-full border-collapse text-left text-sm text-text">
                  <thead className="bg-surface-alt text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle">
                    <tr>
                      <th className="px-4 py-3">{t('admin.locations.codeLabel')}</th>
                      <th className="px-4 py-3">{t('admin.locations.nameLabel')}</th>
                      <th className="px-4 py-3">{t('admin.locations.addressLabel')}</th>
                      <th className="px-4 py-3 text-right">
                        {t('admin.locations.statusLabel')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {locations.map((location) => (
                      <tr key={location.location_id} className="bg-surface/80">
                        <td className="px-4 py-3 text-base font-semibold">
                          {location.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {location.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-text-muted">
                          {location.address || '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="rounded-pill bg-secondary px-4 py-2 text-xs font-semibold text-text">
                            {location.is_active
                              ? t('admin.locations.active')
                              : t('admin.locations.inactive')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="stack-admin-actions sm:flex-row sm:items-center sm:justify-between">
        <Button
          size="md"
          variant="secondary"
          onClick={() => navigate('/admin')}
        >
          {t('common.actions.backToAdminHome')}
        </Button>
        <Button
          size="md"
          variant="secondary"
          onClick={() => navigate('/')}
        >
          {t('common.actions.backToHome')}
        </Button>
      </div>
    </section>
  )
}

export default AdminLocationsPage
