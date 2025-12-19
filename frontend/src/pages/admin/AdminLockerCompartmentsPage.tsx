import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Input from '@/components/Input'
import PageHeader from '@/components/PageHeader'
import { useTranslation } from '@/i18n'
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
  const { t } = useTranslation()
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
      setError(t('common.errors.generic'))
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
      setError(t('common.errors.generic'))
      return
    }
    const payloadRows = rows
      .map((row) => ({
        compartment_no: Number(row.compartmentNo),
        size: row.size,
      }))
      .filter((row) => Number.isFinite(row.compartment_no) && row.compartment_no > 0)

    if (payloadRows.length === 0) {
      setError(t('common.errors.missingData'))
      return
    }

    setLoading(true)
    setError('')
    try {
      await createCompartments(lockerId, { compartments: payloadRows })
      setRows([emptyRow()])
      await loadCompartments()
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
        title={t('admin.compartments.title')}
        subtitle={t('admin.compartments.subtitle')}
        align="left"
      />

      <Card density="cozy">
        <div className="stack-admin-section">
          {rows.map((row, index) => (
            <div
              key={`row-${index}`}
              className="flex flex-col gap-3 rounded-control border border-border bg-surface/80 p-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <Input
                  label={t('admin.compartments.compartmentNoLabel')}
                  placeholder={t('admin.compartments.compartmentNoPlaceholder')}
                  inputMode="numeric"
                  value={row.compartmentNo}
                  onChange={(event) =>
                    updateRow(index, 'compartmentNo', event.target.value)
                  }
                  className="admin-control"
                />
              </div>
              <label className="block w-full sm:w-40">
                <span className="text-sm font-semibold text-text-muted">
                  {t('admin.compartments.sizeLabel')}
                </span>
                <select
                  className="admin-select mt-2"
                  value={row.size}
                  onChange={(event) => updateRow(index, 'size', event.target.value)}
                >
                  <option value="S">{t('common.sizes.S')}</option>
                  <option value="M">{t('common.sizes.M')}</option>
                  <option value="L">{t('common.sizes.L')}</option>
                </select>
              </label>
              <Button
                variant="secondary"
                size="md"
                onClick={() => removeRow(index)}
                disabled={rows.length === 1}
              >
                {t('admin.compartments.removeRow')}
              </Button>
            </div>
          ))}

          <Button size="md" variant="secondary" fullWidth onClick={addRow}>
            {t('admin.compartments.addRow')}
          </Button>

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button size="md" fullWidth onClick={handleGenerate} disabled={loading}>
            {t('admin.compartments.generate')}
          </Button>
        </div>
      </Card>

      <Card title={t('admin.compartments.existingTitle')} density="cozy">
        <div className="stack-admin-section">
          {compartments.length === 0 ? (
            <p className="text-sm text-text-muted">{t('admin.compartments.empty')}</p>
          ) : (
            compartments.map((compartment) => (
              <div
                key={compartment.compartment_id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-control border border-border bg-surface/80 p-4"
              >
                <div>
                  <p className="text-base font-semibold">#{compartment.compartment_no}</p>
                  <p className="text-sm text-text-muted">
                    {t('public.pickup.list.sizeLabel', { size: compartment.size })}
                  </p>
                </div>
                <span className="rounded-pill bg-secondary px-4 py-2 text-xs font-semibold text-text">
                  {compartment.status}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>

      <div className="stack-admin-actions">
        <Button
          size="md"
          variant="secondary"
          fullWidth
          onClick={() => navigate('/admin/lockers')}
        >
          {t('admin.compartments.backLockers')}
        </Button>
        <Button
          size="md"
          variant="secondary"
          fullWidth
          onClick={() => navigate('/admin')}
        >
          {t('common.actions.backToAdminHome')}
        </Button>
      </div>
    </section>
  )
}

export default AdminLockerCompartmentsPage
