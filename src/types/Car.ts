export interface Car {
  id: number;
  brand: string;
  model: string;
  accel_sec: number;
  top_speed_kmh: number;
  range_km: number;
  segment: string;
  price_euro: number;
}

export interface DetailCarView {
  id: number;
  brand: string;
  model: string;
  accel_sec: number;
  top_speed_kmh: number;
  range_km: number;
  segment: string;
  price_euro: number;
  efficiency_whkm: number;
  fast_charge_kmh: number;
  rapid_charge: string ; // depending on API, use string or boolean
  powertrain_id: number | string;
  plug_type_id: number | string;
  body_style_id: number | string;
}