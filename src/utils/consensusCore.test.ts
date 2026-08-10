import { describe, expect, it } from 'vitest'
import { buildCurrentRain, buildPrecipitationGroups } from './consensusCore'

const fresh = new Date().toISOString()

function source(id: string, precipitation: number | null, extra: Record<string, unknown> = {}) {
  return {
    id,
    name: id,
    status: 'ok',
    weight: 1,
    precipitation,
    ...extra,
  }
}

describe('precipitation groups', () => {
  it('combines Open-Meteo models into one group before other forecast APIs', () => {
    const groups = buildPrecipitationGroups([
      source('ecmwf_ifs', 0),
      source('icon_d2', 0),
      source('gfs', 0),
      source('weathercom', 1.2),
    ])

    expect(groups.openMeteo.value).toBe(0)
    expect(groups.otherForecast.value).toBe(1.2)
  })

  it('does not treat null precipitation as zero', () => {
    const groups = buildPrecipitationGroups([source('weatherapi', null)])

    expect(groups.otherForecast.value).toBeNull()
  })
})

describe('current rain', () => {
  it('prioritizes a fresh positive CHMI ten-minute observation', () => {
    const result = buildCurrentRain([
      source('chmi', 0.8, {
        observedAt: fresh,
        precipitationIntervalMinutes: 10,
        distanceKm: 4,
      }),
      source('netatmo', 0, {
        observedAt: fresh,
        precipitationIntervalMinutes: 60,
        distanceKm: 8,
      }),
    ])

    expect(result.state).toBe('raining')
    expect(result.observedMm60).toBeCloseTo(4.8)
    expect(result.evidence).toHaveLength(2)
  })

  it('ignores stale observations instead of declaring dry weather', () => {
    const result = buildCurrentRain([
      source('chmi', 2, {
        observedAt: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
        precipitationIntervalMinutes: 10,
      }),
    ])

    expect(result.state).toBe('unknown')
    expect(result.evidence).toHaveLength(0)
  })
})
