import { describe, it, expect } from "vitest";
import { FiscalInvoicingService } from "../src/modules/billing/invoicing.js";
import { MembershipsAndTicketingService } from "../src/modules/memberships/service.js";
import { TransactionalProductsService } from "../src/modules/products/service.js";
import { CreatorService } from "../src/modules/creators/service.js";
import { SponsorshipService } from "../src/modules/sponsorship/service.js";

describe("Monetization Suite - Architecture & Logic Contracts", () => {
  it("FiscalInvoicingService should be instantiated with database pool", () => {
    const fakePool: any = { query: async () => ({ rows: [] }), connect: async () => ({ query: async () => ({ rows: [] }), release: () => {} }) };
    const service = new FiscalInvoicingService(fakePool);
    expect(service).toBeDefined();
    expect(typeof service.issueInvoice).toBe("function");
    expect(typeof service.getInvoiceByNcf).toBe("function");
    expect(typeof service.listInvoicesByReference).toBe("function");
  });

  it("MembershipsAndTicketingService should expose membership and event methods", () => {
    const fakePool: any = { query: async () => ({ rows: [] }) };
    const service = new MembershipsAndTicketingService(fakePool);
    expect(service).toBeDefined();
    expect(typeof service.listActivePlans).toBe("function");
    expect(typeof service.subscribeUserToPlan).toBe("function");
    expect(typeof service.getUserMembership).toBe("function");
    expect(typeof service.creditLoyaltyPoints).toBe("function");
    expect(typeof service.purchaseTicket).toBe("function");
    expect(typeof service.verifyAndCheckInTicket).toBe("function");
  });

  it("TransactionalProductsService should expose insurance, transport and dynamic packages", () => {
    const fakePool: any = { query: async () => ({ rows: [] }) };
    const service = new TransactionalProductsService(fakePool);
    expect(service).toBeDefined();
    expect(typeof service.issueInsurance).toBe("function");
    expect(typeof service.bookTransport).toBe("function");
    expect(typeof service.listPackages).toBe("function");
  });

  it("CreatorService should handle UGC onboarding, feed, publishing and payouts", () => {
    const fakePool: any = { query: async () => ({ rows: [] }) };
    const service = new CreatorService(fakePool);
    expect(service).toBeDefined();
    expect(typeof service.onboardCreator).toBe("function");
    expect(typeof service.getFeed).toBe("function");
    expect(typeof service.publishVideo).toBe("function");
    expect(typeof service.recordVideoEvent).toBe("function");
    expect(typeof service.processPayout).toBe("function");
  });

  it("SponsorshipService should serve ad slots and record telemetry", () => {
    const fakePool: any = { query: async () => ({ rows: [] }) };
    const service = new SponsorshipService(fakePool);
    expect(service).toBeDefined();
    expect(typeof service.serveSlot).toBe("function");
    expect(typeof service.recordEvent).toBe("function");
    expect(typeof service.listSlots).toBe("function");
    expect(typeof service.createCampaign).toBe("function");
  });
});
