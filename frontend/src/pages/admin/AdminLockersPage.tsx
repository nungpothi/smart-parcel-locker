import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
import {
  createLocker,
  fetchLockers,
  fetchLocations,
  type Locker,
  type Location,
} from '@/services/api'

const AdminLockersPage = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [locations, setLocations] = useState<Location[]>([])
  const [lockers, setLockers] = useState<Locker[]>([])
  const [locationId, setLocationId] = useState('')
  const [lockerCode, setLockerCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const locationMap = useMemo(() => {
    return new Map(locations.map((location) => [location.location_id, location]))
  }, [locations])

  const loadData = async () => {
    setError('')
    try {
      const [locationsResponse, lockersResponse] = await Promise.all([
        fetchLocations(),
        fetchLockers(),
      ])
      setLocations(locationsResponse.data.data ?? [])
      setLockers(lockersResponse.data.data ?? [])
    } catch (err) {
      setError(t('common.errors.generic'))
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleCreate = async () => {
    if (!locationId || !lockerCode) {
      setError(t('common.errors.missingData'))
      return
    }
    setLoading(true)
    setError('')
    try {
      await createLocker({
        location_id: locationId,
        locker_code: lockerCode,
        name: name || undefined,
      })
      setLockerCode('')
      setName('')
      await loadData()
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
        title={t('admin.lockers.title')}
        subtitle={t('admin.lockers.subtitle')}
        align="left"
      />

      <Card density="cozy">
        <div className="stack-admin-section">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-left">
              <span className="text-sm font-semibold text-text-muted">
                {t('admin.lockers.locationLabel')}
              </span>
              <select
                className="admin-select mt-2"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
              >
                <option value="">{t('admin.lockers.locationPlaceholder')}</option>
                {locations.map((location) => (
                  <option key={location.location_id} value={location.location_id}>
                    {location.code} - {location.name}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label={t('admin.lockers.lockerCodeLabel')}
              placeholder={t('admin.lockers.lockerCodePlaceholder')}
              value={lockerCode}
              onChange={(event) => setLockerCode(event.target.value)}
              className="admin-control"
            />
            <Input
              label={t('admin.lockers.nameLabel')}
              placeholder={t('admin.lockers.namePlaceholder')}
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="admin-control sm:col-span-2"
            />
          </div>

          {error && <p className="text-sm text-danger">{error}</p>}

          <div className="stack-admin-actions sm:flex-row sm:items-center">
            <Button size="md" onClick={handleCreate} disabled={loading}>
              {t('admin.lockers.create')}
            </Button>
          </div>
        </div>
      </Card>

      <div className="p-2 sm:p-3">
        <Card title={t('admin.lockers.existingTitle')} density="cozy">
          <div className="stack-admin-section">
            {lockers.length === 0 ? (
              <div className="rounded-control border border-dashed border-border/80 bg-surface/60 p-4 text-sm text-text-muted">
                {t('admin.lockers.empty')}
              </div>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-border bg-surface/80">
                <table className="w-full border-collapse text-left text-sm text-text">
                  <thead className="bg-surface-alt text-xs font-semibold uppercase tracking-[0.08em] text-text-subtle">
                    <tr>
                      <th className="px-4 py-3">
                        {t('admin.lockers.lockerCodeLabel')}
                      </th>
                      <th className="px-4 py-3">{t('admin.lockers.nameLabel')}</th>
                      <th className="px-4 py-3">
                        {t('admin.lockers.locationLabel')}
                      </th>
                      <th className="px-4 py-3 text-right">
                        {t('admin.lockers.statusLabel')}
                      </th>
                      <th className="px-4 py-3 text-right">
                        {t('admin.lockers.actionsLabel')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {lockers.map((locker) => {
                      const location = locationMap.get(locker.location_id)
                      return (
                        <tr key={locker.locker_id} className="bg-surface/80">
                          <td className="px-4 py-3 text-base font-semibold">
                            {locker.locker_code}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-muted">
                            {locker.name || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-text-muted">
                            {location
                              ? `${location.code} — ${location.name}`
                              : locker.location_id}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="rounded-pill bg-secondary px-4 py-2 text-xs font-semibold text-text">
                              {locker.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="secondary"
                              size="md"
                              onClick={() =>
                                navigate(
                                  `/admin/lockers/${locker.locker_id}/compartments`,
                                )
                              }
                            >
                              {t('admin.lockers.manageCompartments')}
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
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

export default AdminLockersPage
