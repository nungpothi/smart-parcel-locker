import { useCallback, useEffect } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import clsx from 'clsx'
import { useNavigate } from 'react-router-dom'
import Button from '@/components/Button'
import Card from '@/components/Card'
import PageHeader from '@/components/PageHeader'
import { confirmPickup, fetchPickupParcels } from '@/services/api'
import { usePickupStore } from '@/store/pickupStore'

const PickupParcelListPage = () => {
  const navigate = useNavigate()
  const {
    pickupToken,
    parcels,
    selectedParcelId,
    isLoadingParcels,
    isConfirming,
    errorMessage,
    setParcels,
    selectParcel,
    setLoadingParcels,
    setConfirming,
    setError,
    setPickupToken,
  } = usePickupStore()

  const loadParcels = useCallback(async () => {
    if (!pickupToken) return
    setLoadingParcels(true)
    setError(null)
    try {
      const response = await fetchPickupParcels(pickupToken)
      setParcels(response.data?.data ?? [])
      selectParcel(null)
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 401:
          setError('Session expired. Please verify again.')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 410:
          setError('Session expired. Please verify again.')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 500:
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoadingParcels(false)
    }
  }, [navigate, pickupToken, selectParcel, setError, setLoadingParcels, setParcels, setPickupToken])

  useEffect(() => {
    if (!pickupToken) {
      navigate('/pickup/phone')
      return
    }
    void loadParcels()
  }, [loadParcels, navigate, pickupToken])

  const handleConfirm = async () => {
    if (!pickupToken || !selectedParcelId) return
    setConfirming(true)
    setError(null)
    try {
      await confirmPickup(pickupToken, selectedParcelId)
      navigate('/pickup/success')
    } catch (err) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      switch (status) {
        case 400:
          setError('This parcel cannot be picked up right now.')
          break
        case 401:
          setError('Session expired. Please verify again.')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 403:
          setError('You are not allowed to pick up this parcel.')
          break
        case 404:
          setError('Parcel not found.')
          break
        case 409:
          setError('This parcel is already being picked up.')
          break
        case 410:
          setError('Session expired. Please verify again.')
          setPickupToken(null, null)
          navigate('/pickup/otp')
          break
        case 500:
        default:
          setError('Something went wrong. Please try again.')
      }
    } finally {
      setConfirming(false)
    }
  }

  const hasParcels = parcels.length > 0

  return (
    <section className="flex flex-1 justify-center">
      <div className="stack-page w-full">
        <PageHeader
          title="Select your parcel"
          subtitle="Choose the parcel you want to pick up now."
          variant="public"
        />

        <Card tone="muted" density="spacious" className="w-full max-w-4xl">
          <div className="stack-section">
            <p className="text-center text-base text-text-muted">
              Tap the parcel that matches your pickup code.
            </p>

            {isLoadingParcels && (
              <p className="text-center text-base text-text-muted">Loading parcels...</p>
            )}

            {errorMessage && (
              <div className="rounded-panel border border-danger bg-danger-soft px-5 py-4 text-base text-danger text-center">
                {errorMessage}
              </div>
            )}

            {!isLoadingParcels && !errorMessage && !hasParcels && (
              <p className="text-center text-base text-text-muted">
                No parcels available right now.
              </p>
            )}

            {hasParcels && (
              <div className="stack-section" role="list">
                {parcels.map((parcel) => {
                  const isSelected = selectedParcelId === parcel.parcel_id
                  return (
                    <button
                      key={parcel.parcel_id}
                      type="button"
                      role="listitem"
                      className={clsx(
                        'w-full rounded-panel border border-border/70 bg-surface px-6 py-5 text-left shadow-panel transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
                        isSelected && 'border-primary-strong bg-surface-alt shadow-panel focus-visible:outline-ring',
                      )}
                      onClick={() => selectParcel(parcel.parcel_id)}
                      aria-pressed={isSelected}
                      disabled={isConfirming}
                    >
                      <div className="space-y-1">
                        <p className="text-xl font-semibold text-text">{parcel.parcel_code}</p>
                        {parcel.expires_at && (
                          <p className="text-base text-text-subtle">
                            Expires {dayjs(parcel.expires_at).format('DD/MM/YYYY HH:mm')}
                          </p>
                        )}
                      </div>
                      <span className="rounded-pill bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-[0.12em] text-text">
                        Size {parcel.size}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="section-divider stack-actions">
            {!isLoadingParcels && !hasParcels && !errorMessage ? (
              <Button fullWidth size="xl" onClick={() => navigate('/')}>
                Start over
              </Button>
            ) : (
              <Button
                fullWidth
                size="xl"
                onClick={handleConfirm}
                disabled={!selectedParcelId || isConfirming || isLoadingParcels}
              >
                {isConfirming ? 'Confirming...' : 'Continue'}
              </Button>
            )}

            {errorMessage && (
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={loadParcels}
                disabled={isLoadingParcels}
              >
                Refresh list
              </Button>
            )}

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => navigate('/pickup/otp')}
              disabled={isConfirming}
            >
              Back
            </Button>
          </div>
        </Card>
      </div>
    </section>
  )
}

export default PickupParcelListPage
