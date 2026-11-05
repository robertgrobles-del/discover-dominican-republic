import { describe, expect, it } from "vitest";
import { assertPublicUrl, assertPublicUrlSyntax, isPrivateIp } from "../src/lib/public-url.js";

describe("public-url (SSRF)", () => {
  it("reconoce IPv4 mapeadas en IPv6 tal como las escribe el analizador de URL (hexadecimal)", async () => {
    expect(new URL("https://[::ffff:127.0.0.1]/a.ics").hostname).toBe("[::ffff:7f00:1]");
    for (const ip of ["::ffff:7f00:1", "::ffff:a9fe:a9fe", "::ffff:a00:1", "::ffff:127.0.0.1", "0:0:0:0:0:ffff:c0a8:101", "::1", "::", "::7f00:1",
      "64:ff9b::7f00:1", "2002:7f00:1::", "fec0::1", "fe80::1", "fd00::1", "ff02::1", "2001:db8::1", "192.0.0.8", "198.18.0.1", "198.19.255.1", "100.64.0.1"])
      expect(isPrivateIp(ip), ip).toBe(true);
    for (const ip of ["2606:4700::1111", "::ffff:808:808", "8.8.8.8", "2002:808:808::", "198.20.0.1"]) expect(isPrivateIp(ip), ip).toBe(false);
    await expect(assertPublicUrl("https://[::ffff:127.0.0.1]/a.ics")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
    await expect(assertPublicUrl("https://[::ffff:a9fe:a9fe]/a.ics")).rejects.toMatchObject({ code: "VALIDATION_ERROR" });
  });

  it("la comprobación sin DNS rechaza hosts privados, internos y sin https", () => {
    for (const u of ["https://10.0.0.1/x", "https://[::ffff:7f00:1]/x", "https://localhost/x", "https://intranet/x", "https://a.internal/x", "http://push.example.com/x", "https://u:p@push.example.com/x"])
      expect(() => assertPublicUrlSyntax(u), u).toThrow();
    expect(() => assertPublicUrlSyntax("https://fcm.googleapis.com/fcm/send/abc")).not.toThrow();
  });
});
