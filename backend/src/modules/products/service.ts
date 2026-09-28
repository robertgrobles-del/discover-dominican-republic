import type { Db } from "../../db/pool.js";
import { AppError } from "../../lib/errors.js";

export interface TravelInsuranceRow {
  id: string;
  booking_id: string | null;
  user_id: string | null;
  provider_name: string;
  policy_number: string;
  plan_tier: string;
  coverage_amount: number;
  premium_amount: number;
  commission_amount: number;
  currency: string;
  traveler_name: string;
  starts_on: string;
  ends_on: string;
  status: string;
}

export interface TransportBookingRow {
  id: string;
  user_id: string | null;
  service_type: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_datetime: string;
  passengers: number;
  vehicle_category: string;
  price: number;
  currency: string;
  status: string;
}

export interface DynamicPackageRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  duration_days: number;
  base_price: number;
  currency: string;
  discount_percentage: number;
  is_featured: boolean;
  status: string;
}

/** Servicio para Nuevos Productos Transaccionales (Fase 4B: #12, #13, #17) */
export class TransactionalProductsService {
  constructor(private readonly db: Db) {}

  /** Cotización y emisión de póliza de seguro de viaje (#12) */
  async issueInsurance(data: {
    booking_id?: string;
    user_id?: string;
    plan_tier: "basico_medico" | "integral_aventura" | "cancelacion_total";
    traveler_name: string;
    traveler_passport_or_id: string;
    starts_on: string;
    ends_on: string;
  }): Promise<TravelInsuranceRow> {
    const policyNumber = `POL-RD-${Math.floor(100000 + Math.random() * 900000)}`;
    const pricing = {
      basico_medico: { coverage: 500000, premium: 1200, commission: 240 },
      integral_aventura: { coverage: 1500000, premium: 2500, commission: 500 },
      cancelacion_total: { coverage: 3000000, premium: 4200, commission: 840 },
    }[data.plan_tier];

    const ins = await this.db.query<TravelInsuranceRow>(
      `INSERT INTO travel_insurance_policies
        (booking_id, user_id, policy_number, plan_tier, coverage_amount, premium_amount, commission_amount, traveler_name, traveler_passport_or_id, starts_on, ends_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        data.booking_id ?? null, data.user_id ?? null, policyNumber, data.plan_tier,
        pricing.coverage, pricing.premium, pricing.commission,
        data.traveler_name, data.traveler_passport_or_id, data.starts_on, data.ends_on,
      ],
    );
    return ins.rows[0]!;
  }

  /** Reserva de traslado o rent-a-car (#13) */
  async bookTransport(data: {
    user_id?: string;
    service_type: "airport_transfer" | "private_driver" | "rental_car" | "intercity_shuttle";
    pickup_location: string;
    dropoff_location: string;
    pickup_datetime: string;
    return_datetime?: string;
    passengers: number;
    vehicle_category: "sedan" | "suv" | "van_familiar" | "minibus_turistico" | "jeep_4x4";
    price: number;
  }): Promise<TransportBookingRow> {
    const commission = Math.round(data.price * 0.12 * 100) / 100; // 12% comisión estándar
    const ins = await this.db.query<TransportBookingRow>(
      `INSERT INTO transport_bookings
        (user_id, service_type, pickup_location, dropoff_location, pickup_datetime, return_datetime, passengers, vehicle_category, price, commission_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        data.user_id ?? null, data.service_type, data.pickup_location, data.dropoff_location,
        data.pickup_datetime, data.return_datetime ?? null, data.passengers, data.vehicle_category,
        data.price, commission,
      ],
    );
    return ins.rows[0]!;
  }

  /** Catálogo de paquetes dinámicos multidestino (#17) */
  async listPackages(query: { limit?: number }): Promise<DynamicPackageRow[]> {
    const limit = Math.min(query.limit ?? 20, 50);
    const { rows } = await this.db.query<DynamicPackageRow>(
      "SELECT * FROM dynamic_packages WHERE status = 'active' ORDER BY is_featured DESC, created_at DESC LIMIT $1",
      [limit],
    );
    return rows;
  }
}
