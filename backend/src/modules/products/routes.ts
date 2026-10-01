import type { FastifyInstance, FastifyRequest } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { PUBLIC_CACHE } from "../../plugins/etag.js";
import { audit } from "../../lib/audit.js";
import { TransactionalProductsService } from "./service.js";

declare module "fastify" {
  interface FastifyInstance {
    products: TransactionalProductsService;
  }
}

const any = z.any();
const ok = z.object({ data: any });
const bearer = [{ bearerAuth: [] }];
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** Rutas para Seguros, Traslados y Paquetes Dinámicos (#12, #13, #17) */
export async function transactionalProductsRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const db = app.db;
  const auth = app.authenticate;
  const service = app.products ?? new TransactionalProductsService(db);
  const optionalUser = async (req: FastifyRequest) => {
    if (req.headers.authorization) {
      try { await app.authenticate(req, undefined as never); } catch { req.user = undefined; }
    }
  };

  // ---------- Seguros de Viaje (#12) ----------
  r.post("/insurance/quote-and-issue", {
    onRequest: optionalUser,
    schema: {
      tags: ["productos", "seguros"],
      summary: "Emisión de seguro de viaje con cobertura médica y cancelación (#12)",
      body: z.object({
        booking_id: z.string().uuid().optional(),
        plan_tier: z.enum(["basico_medico", "integral_aventura", "cancelacion_total"]),
        traveler_name: z.string().trim().min(3).max(120),
        traveler_passport_or_id: z.string().trim().min(4).max(40),
        starts_on: date,
        ends_on: date,
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const policy = await service.issueInsurance({
      ...req.body,
      user_id: req.user?.id,
    });
    if (req.user) {
      await audit(db, { actor: req.user.id, action: "insurance.issue", entity: "insurance_policy", id: policy.id, ip: req.ip });
    }
    reply.code(201);
    return { data: policy };
  });

  // ---------- Traslados y Rent-a-car (#13) ----------
  r.post("/transport/book", {
    onRequest: optionalUser,
    schema: {
      tags: ["productos", "transporte"],
      summary: "Reserva de transfer privado, chofer o vehículo rent-a-car (#13)",
      body: z.object({
        service_type: z.enum(["airport_transfer", "private_driver", "rental_car", "intercity_shuttle"]),
        pickup_location: z.string().trim().min(3).max(200),
        dropoff_location: z.string().trim().min(3).max(200),
        pickup_datetime: z.string().datetime({ offset: true }),
        return_datetime: z.string().datetime({ offset: true }).optional(),
        passengers: z.number().int().min(1).max(50).default(1),
        vehicle_category: z.enum(["sedan", "suv", "van_familiar", "minibus_turistico", "jeep_4x4"]),
        price: z.number().min(0),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const booking = await service.bookTransport({
      ...req.body,
      user_id: req.user?.id,
    });
    reply.code(201);
    return { data: booking };
  });

  // ---------- Paquetes Dinámicos (#17) ----------
  r.get("/packages/dynamic", {
    schema: {
      tags: ["productos", "paquetes"],
      summary: "Catálogo de paquetes dinámicos multidestino (#17)",
      querystring: z.object({ limit: z.coerce.number().int().min(1).max(50).default(20) }),
      response: { 200: ok },
    },
  }, async (req, reply) => {
    const packages = await service.listPackages(req.query);
    reply.header("cache-control", PUBLIC_CACHE);
    return { data: packages };
  });
}
