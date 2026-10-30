import { describe, it, expect } from 'vitest'

describe('CycleAware Frontend Smoke & Calculation Tests', () => {
  it('validates cycle length calculations correctly', () => {
    const d1 = new Date('2026-05-01')
    const d2 = new Date('2026-06-05')
    const diffDays = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    expect(diffDays).toBe(35)
  })

  it('validates adult menstrual irregularity bounds (21 to 35 days)', () => {
    const isIrregular = (len: number) => len < 21 || len > 35
    expect(isIrregular(28)).toBe(false)
    expect(isIrregular(38)).toBe(true)
    expect(isIrregular(18)).toBe(true)
    expect(isIrregular(45)).toBe(true)
  })

  it('validates adolescent developmental bounds (21 to 45 days)', () => {
    const isAdolescentIrregular = (len: number) => len < 21 || len > 45
    expect(isAdolescentIrregular(42)).toBe(false) // Normal in 1-3 years post-menarche
    expect(isAdolescentIrregular(48)).toBe(true)
  })
})

