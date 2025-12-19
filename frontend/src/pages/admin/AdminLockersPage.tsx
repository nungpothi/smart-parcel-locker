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
            className="admin-control"
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button size="md" fullWidth onClick={handleCreate} disabled={loading}>
            {t('admin.lockers.create')}
          </Button>
        </div>
      </Card>

      <Card title={t('admin.lockers.existingTitle')} density="cozy">
        <div className="stack-admin-section">
          {lockers.length === 0 ? (
            <p className="text-sm text-text-muted">{t('admin.lockers.empty')}</p>
          ) : (
            lockers.map((locker) => {
              const location = locationMap.get(locker.location_id)
              return (
                <div
                  key={locker.locker_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-control border border-border bg-surface/80 p-4"
                >
                  <div>
                    <p className="text-base font-semibold">{locker.locker_code}</p>
                    <p className="text-sm text-text-muted">
                      {location ? location.name : locker.location_id}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-pill bg-secondary px-4 py-2 text-xs font-semibold text-text">
                      {locker.status}
                    </span>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={() =>
                        navigate(`/admin/lockers/${locker.locker_id}/compartments`)
                      }
                    >
                      {t('admin.lockers.manageCompartments')}
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      <div className="stack-admin-actions">
        <Button
          size="md"
          variant="secondary"
          fullWidth
          onClick={() => navigate('/admin')}
        >
          {t('common.actions.backToAdminHome')}
        </Button>
        <Button
          size="md"
          variant="secondary"
          fullWidth
          onClick={() => navigate('/')}
        >
          {t('common.actions.backToHome')}
        </Button>
      </div>
    </section>
  )
}

export default AdminLockersPage
