import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import {
  createCompartments,
  fetchCompartments,
  type Compartment,
} from '@/services/api'

type Row = {
  compartmentNo: string
  size: 'S' | 'M' | 'L'
}

const emptyRow = (): Row => ({ compartmentNo: '', size: 'S' })

const AdminLockerCompartmentsPage = () => {
  const navigate = useNavigate()
  const { lockerId } = useParams()
  const [rows, setRows] = useState<Row[]>([emptyRow()])
  const [compartments, setCompartments] = useState<Compartment[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const loadCompartments = async () => {
    if (!lockerId) return
    setError('')
    try {
      const response = await fetchCompartments(lockerId)
      setCompartments(response.data.data ?? [])
    } catch (err) {
      setError('Failed to load compartments.')
    }
  }

  useEffect(() => {
    void loadCompartments()
  }, [lockerId])

  const updateRow = (index: number, key: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    )
  }

  const addRow = () => {
    setRows((prev) => [...prev, emptyRow()])
  }

  const removeRow = (index: number) => {
    setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))
  }

  const handleGenerate = async () => {
    if (!lockerId) {
      setError('Locker not found.')
      return
    }
    const payloadRows = rows
      .map((row) => ({
        compartment_no: Number(row.compartmentNo),
        size: row.size,
      }))
      .filter((row) => Number.isFinite(row.compartment_no) && row.compartment_no > 0)

    if (payloadRows.length === 0) {
      setError('Enter at least one valid compartment number.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await createCompartments(lockerId, { compartments: payloadRows })
      setRows([emptyRow()])
      await loadCompartments()
    } catch (err) {
      setError('Failed to generate compartments.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-6 px-6 py-10">
      <Card>
        <div className="text-center">
          <h1 className="font-display text-3xl">Generate Compartments</h1>
        </div>

        <div className="mt-8 space-y-4">
          {rows.map((row, index) => (
            <div
              key={`row-${index}`}
              className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-white/80 p-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Input
                  label="Compartment No"
                  placeholder="1"
                  inputMode="numeric"
                  value={row.compartmentNo}
                  onChange={(event) =>
                    updateRow(index, 'compartmentNo', event.target.value)
                  }
                />
              </div>
              <label className="block w-full sm:w-40">
                <span className="text-sm font-semibold">Size</span>
                <select
                  className="mt-2 w-full rounded-2xl border-2 border-primary/40 bg-white px-4 py-3 text-base focus:border-primary focus:outline-none"
                  value={row.size}
                  onChange={(event) => updateRow(index, 'size', event.target.value)}
                >
                  <option value="S">S</option>
                  <option value="M">M</option>
                  <option value="L">L</option>
                </select>
              </label>
              <Button
                variant="secondary"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
              >
                Remove
              </Button>
            </div>
          ))}

          <Button variant="secondary" fullWidth onClick={addRow}>
            Add Row
          </Button>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <Button fullWidth onClick={handleGenerate} disabled={loading}>
            Generate
          </Button>
        </div>
      </Card>

      <Card title="Existing Compartments">
        <div className="space-y-3">
          {compartments.length === 0 ? (
            <p className="text-sm text-text/70">No compartments yet.</p>
          ) : (
            compartments.map((compartment) => (
              <div
                key={compartment.compartment_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-primary/30 bg-white/80 p-4"
              >
                <div>
                  <p className="text-base font-semibold">#{compartment.compartment_no}</p>
                  <p className="text-sm text-text/70">Size {compartment.size}</p>
                </div>
                <span className="rounded-full bg-primary px-4 py-2 text-xs font-semibold">
                  {compartment.status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="space-y-3">
        <Button variant="secondary" fullWidth onClick={() => navigate('/admin/lockers')}>
          Back to Lockers
        </Button>
        <Button variant="secondary" fullWidth onClick={() => navigate('/admin')}>
          Back to Admin Home
        </Button>
      </div>
    </main>
  )
}

export default AdminLockerCompartmentsPage
