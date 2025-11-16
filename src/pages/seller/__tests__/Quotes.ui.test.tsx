import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import SellerQuotes from '../Quotes'

vi.mock('@/hooks/useAuthRole', () => ({ useAuthRole: () => ({ userId: 'seller-1', loading: false }) }))
vi.mock('@/components/Header', () => ({ Header: () => <div /> }))
vi.mock('@/components/Footer', () => ({ Footer: () => <div /> }))

const select = vi.fn().mockReturnValue(Promise.resolve({ data: [], error: null }))
const from = vi.fn().mockImplementation((table: string) => ({ select }))

vi.mock('@/integrations/supabase/client', () => ({ supabase: { from } }))
vi.mock('@/components/ui/select', () => ({
  Select: ({ children }: any) => <div>{children}</div>,
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ children }: any) => <div>{children}</div>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ value, children }: any) => <div data-value={value}>{children}</div>
}))

describe('Seller Quotes UI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não exibe opção Aprovado', async () => {
    render(<SellerQuotes />)
    const text = screen.queryByText('Aprovado')
    expect(text).toBeNull()
  })
})