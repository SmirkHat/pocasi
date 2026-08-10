import { calculateDewPoint } from '../../utils/weatherMath.ts';

export function normalizeBrightsky(data) {
  const weather = data?.weather || {};
  const temperature = weather.temperature ?? null;
  const humidity = weather.relative_humidity ?? null;

  return {
    temperature,
    apparentTemperature: null,
    precipitation: weather.precipitation_60,
    precipitationIntervalMinutes: 60,
    observedAt: weather.timestamp ?? null,
    stationName: data?.sources?.[0]?.station_name ?? null,
    distanceKm: data?.sources?.[0]?.distance != null ? Number(data.sources[0].distance) / 1000 : null,
    dewPoint: weather.dew_point ?? calculateDewPoint(temperature, humidity),
    windSpeed: weather.wind_speed_10 ?? null,
    windDirection: weather.wind_direction_10,
    windGust: weather.wind_gust_speed_10 ?? null,
    humidity: weather.relative_humidity,
    pressure: weather.pressure_msl,
    cloudCover: weather.cloud_cover ?? null,
    visibility: weather.visibility ?? null,
    uvIndex: null,
    weatherCode: null,
    raw: data
  };
}
