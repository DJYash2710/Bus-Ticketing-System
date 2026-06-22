import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Gift, Pencil, Plus, Trash2 } from 'lucide-react'
import { createCoupon, deleteCoupon, listCoupons, updateCoupon } from '../../api/coupons'
import { getErrorMessage } from '../../api/client'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { DataTable } from '../../components/DataTable'
import { EmptyState } from '../../components/EmptyState'
import { StatusBadge } from '../../components/StatusBadge'
import { useToast } from '../../hooks/useToast'
import { validateCouponForm } from '../../lib/validation'
import type { Coupon, CouponType } from '../../types'

export function Coupons() {
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [code, setCode] = useState('')
  const [type, setType] = useState<CouponType>('PERCENT')
  const [value, setValue] = useState(10)
  const [isActive, setIsActive] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null)

  const couponsQuery = useQuery({ queryKey: ['coupons'], queryFn: listCoupons })

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validation = validateCouponForm({ code, type, value })
      if (!validation.ok) throw new Error(validation.message)
      if (editing) {
        return updateCoupon(editing.id, { type, value, isActive })
      }
      return createCoupon({ code: code.toUpperCase(), type, value, isActive })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coupons'] })
      setModalOpen(false)
      setEditing(null)
      showToast('Coupon saved', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['coupons'] })
      setDeleteTarget(null)
      showToast('Coupon deleted', 'success')
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  })

  function openEdit(coupon: Coupon) {
    setEditing(coupon)
    setCode(coupon.code)
    setType(coupon.type)
    setValue(Number(coupon.value))
    setIsActive(coupon.isActive)
    setModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Coupons</h1>
          <p className="text-sm text-slate-500">Discount codes for passenger bookings</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null)
            setCode('')
            setType('PERCENT')
            setValue(10)
            setIsActive(true)
            setModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" />
          Add coupon
        </button>
      </div>

      {couponsQuery.isLoading ? (
        <DataTable columns={[]} data={[]} keyExtractor={() => ''} loading />
      ) : (couponsQuery.data?.length ?? 0) === 0 ? (
        <EmptyState icon={Gift} title="No coupons" description="Create discount codes for promotions." />
      ) : (
        <DataTable
          data={couponsQuery.data ?? []}
          keyExtractor={(c) => c.id}
          columns={[
            { key: 'code', header: 'Code', render: (c) => c.code },
            { key: 'type', header: 'Type', render: (c) => c.type },
            {
              key: 'value',
              header: 'Value',
              render: (c) => (c.type === 'PERCENT' ? `${c.value}%` : `₹${c.value}`),
            },
            { key: 'used', header: 'Used', render: (c) => c.usedCount },
            {
              key: 'active',
              header: 'Status',
              render: (c) => (
                <StatusBadge
                  label={c.isActive ? 'Active' : 'Inactive'}
                  variant={c.isActive ? 'success' : 'neutral'}
                />
              ),
            },
            {
              key: 'actions',
              header: '',
              render: (c) => (
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => openEdit(c)}>
                    <Pencil className="h-4 w-4 text-slate-500" />
                  </button>
                  <button type="button" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">{editing ? 'Edit coupon' : 'New coupon'}</h2>
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                saveMutation.mutate()
              }}
            >
              <input
                placeholder="Code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={!!editing}
                className="w-full rounded-lg border px-3 py-2 text-sm disabled:bg-slate-50"
                required
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as CouponType)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed amount</option>
              </select>
              <input
                type="number"
                min={0.01}
                step={0.01}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                className="w-full rounded-lg border px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                />
                Active
              </label>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-lg border px-4 py-2 text-sm">
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete coupon?"
        message={`Remove ${deleteTarget?.code}?`}
        confirmLabel="Delete"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
