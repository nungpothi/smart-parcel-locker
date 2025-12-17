import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import {
  createLocker,
  fetchLockers,
  fetchLocations,
  type Locker,
  type Location,
} from '@/services/api'

const AdminLockersPage = () => {
  const navigate = useNavigate()
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
      setError('Failed to load lockers or locations.')
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleCreate = async () => {
    if (!locationId || !lockerCode) {
      setError('Location and locker code are required.')
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
      setError('Failed to create locker.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">Lockers</h1>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block text-left">
            <span className="text-sm font-semibold">Location</span>
            <select
              className="mt-2 w-full rounded-2xl border-2 border-primary/40 bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
              value={locationId}
              onChange={(event) => setLocationId(event.target.value)}
            >
              <option value="">Select location</option>
              {locations.map((location) => (
                <option key={location.location_id} value={location.location_id}>
                  {location.code} - {location.name}
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Locker Code"
            placeholder="LCK-001"
            value={lockerCode}
            onChange={(event) => setLockerCode(event.target.value)}
          />
          <Input
            label="Name (optional)"
            placeholder="Lobby Locker"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button fullWidth onClick={handleCreate} disabled={loading}>
            Create Locker
          </Button>
        </div>
      </Card>

      <Card title="Existing Lockers">
        <div className="space-y-3">
          {lockers.length === 0 ? (
            <p className="text-sm text-text/70">No lockers yet.</p>
          ) : (
            lockers.map((locker) => {
              const location = locationMap.get(locker.location_id)
              return (
                <div
                  key={locker.locker_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-white/80 p-4"
                >
                  <div>
                    <p className="text-base font-semibold">{locker.locker_code}</p>
                    <p className="text-sm text-text/70">
                      {location ? location.name : locker.location_id}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold">
                      {locker.status}
                    </span>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        navigate(`/admin/lockers/${locker.locker_id}/compartments`)
                      }
                    >
                      Manage Compartments
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="secondary" fullWidth onClick={() => navigate('/admin')}>
          Back to Admin Home
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </div>
    </main>
  )
}

export default AdminLockersPage
