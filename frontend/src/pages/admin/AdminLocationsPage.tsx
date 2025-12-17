import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import { createLocation, fetchLocations, type Location } from '@/services/api'

const AdminLocationsPage = () => {
  const navigate = useNavigate()
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
      setError('Failed to load locations.')
    }
  }

  useEffect(() => {
    void loadLocations()
  }, [])

  const handleCreate = async () => {
    if (!code || !name) {
      setError('Code and name are required.')
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
      setError('Failed to create location.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">Locations</h1>
        </div>

        <div className="mt-8 space-y-4">
          <Input
            label="Code"
            placeholder="LOC-001"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
          <Input
            label="Name"
            placeholder="Main Hub"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Input
            label="Address (optional)"
            placeholder="Address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button fullWidth onClick={handleCreate} disabled={loading}>
            Create Location
          </Button>
        </div>
      </Card>

      <Card title="Existing Locations">
        <div className="space-y-3">
          {locations.length === 0 ? (
            <p className="text-sm text-text/70">No locations yet.</p>
          ) : (
            locations.map((location) => (
              <div
                key={location.location_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-white/80 p-4"
              >
                <div>
                  <p className="text-base font-semibold">{location.code}</p>
                  <p className="text-sm text-text/70">{location.name}</p>
                </div>
                <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold">
                  {location.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))
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

export default AdminLocationsPage
