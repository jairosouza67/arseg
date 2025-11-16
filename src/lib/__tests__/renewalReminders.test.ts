import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createRenewalReminder } from '../renewalReminders'

vi.mock('../../integrations/supabase/client', () => {
  const insert = vi.fn().mockResolvedValue({ data: [{}], error: null })
  const from = vi.fn().mockReturnValue({ insert, select: vi.fn().mockReturnValue({}) })
  const auth = { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }) }
  return { supabase: { from, auth } }
})

describe('createRenewalReminder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('insere created_by do usuário autenticado', async () => {
    const { supabase } = await import('../../integrations/supabase/client') as any
    await createRenewalReminder('q1', 'Cliente', 'c@x.com', '9999')
    const args = supabase.from.mock.calls[0]
    expect(args[0]).toBe('renewal_reminders')
    const payload = supabase.from().insert.mock.calls[0][0]
    expect(payload.created_by).toBe('user-1')
  })
})