import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import SellerReminders from '../Reminders'

vi.mock('@/hooks/useAuthRole', () => ({ useAuthRole: () => ({ userId: 'seller-1', loading: false }) }))
vi.mock('@/components/Header', () => ({ Header: () => <div /> }))
vi.mock('@/components/Footer', () => ({ Footer: () => <div /> }))

const eq = vi.fn().mockReturnValue({ order: vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null })) })
const select = vi.fn().mockReturnValue({ eq })
const from = vi.fn().mockImplementation((table: string) => {
  if (table === 'renewal_reminders') return { select }
  return { select }
})

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from, channel: vi.fn(), removeChannel: vi.fn() } }))

describe('Seller Reminders query', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('filtra por created_by do seller', async () => {
    render(<SellerReminders />)
    expect(from).toHaveBeenCalledWith('renewal_reminders')
    expect(eq).toHaveBeenCalledWith('created_by', 'seller-1')
  })
})