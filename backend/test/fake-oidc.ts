import { createHash, randomBytes } from "node:crypto";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { SignJWT, exportJWK, generateKeyPair, type CryptoKey } from "jose";

export interface FakeIdentity { sub: string; email?: string; email_verified?: boolean | string; name?: string; picture?: string; locale?: string }
export interface Overrides { nonce?: string; aud?: string; iss?: string; expired?: boolean; wrongKey?: boolean; noIdToken?: boolean; tokenStatus?: number }

interface IssuedCode { identity: FakeIdentity; nonce: string; challenge: string; redirectUri: string; overrides: Overrides; used: boolean }

/** Proveedor OpenID Connect mínimo, real (servidor HTTP local), para probar el flujo completo sin depender de Google. */
export async function startFakeOidc(clientId = "test-client", clientSecret = "test-secret") {
  const { publicKey, privateKey } = await generateKeyPair("RS256", { extractable: true });
  const other = await generateKeyPair("RS256", { extractable: true });
  const jwk = { ...(await exportJWK(publicKey)), kid: "fake-1", alg: "RS256", use: "sig" };
  const codes = new Map<string, IssuedCode>();
  const requests: { path: string; body?: Record<string, string> }[] = [];
  let base = "";

  const server = http.createServer(async (req, res) => {
    const url = new URL(req.url ?? "/", base);
    const send = (status: number, body: unknown) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
    if (url.pathname === "/.well-known/openid-configuration") {
      return send(200, { issuer: base, authorization_endpoint: `${base}/authorize`, token_endpoint: `${base}/token`, jwks_uri: `${base}/jwks` });
    }
    if (url.pathname === "/jwks") return send(200, { keys: [jwk] });
    if (url.pathname === "/token" && req.method === "POST") {
      const raw = await new Promise<string>((ok) => { let d = ""; req.on("data", (c) => (d += c)); req.on("end", () => ok(d)); });
      const body = Object.fromEntries(new URLSearchParams(raw));
      requests.push({ path: "/token", body });
      const issued = codes.get(body.code ?? "");
      if (body.client_id !== clientId || body.client_secret !== clientSecret) return send(401, { error: "invalid_client" });
      if (!issued || issued.used || body.redirect_uri !== issued.redirectUri) return send(400, { error: "invalid_grant" });
      // PKCE: el verificador debe corresponder al desafío S256 enviado en /authorize
      if (createHash("sha256").update(body.code_verifier ?? "").digest("base64url") !== issued.challenge) return send(400, { error: "invalid_grant", error_description: "PKCE" });
      issued.used = true;
      const o = issued.overrides;
      if (o.tokenStatus) return send(o.tokenStatus, { error: "server_error" });
      if (o.noIdToken) return send(200, { access_token: "x", token_type: "Bearer" });
      const now = Math.floor(Date.now() / 1000);
      const key: CryptoKey = o.wrongKey ? other.privateKey : privateKey;
      const idToken = await new SignJWT({ ...issued.identity, nonce: o.nonce ?? issued.nonce })
        .setProtectedHeader({ alg: "RS256", kid: "fake-1" })
        .setIssuer(o.iss ?? base).setAudience(o.aud ?? clientId).setSubject(issued.identity.sub)
        .setIssuedAt(now - 10).setExpirationTime(o.expired ? now - 5 : now + 300)
        .sign(key);
      return send(200, { id_token: idToken, access_token: "x", token_type: "Bearer" });
    }
    send(404, { error: "not_found" });
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", () => ok()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    issuer: base, clientId, clientSecret, requests,
    /** Simula al usuario aprobando en el proveedor: devuelve la URL de retorno (con code y state) que el navegador visitaría. */
    approve(authorizeUrl: string, identity: FakeIdentity, overrides: Overrides = {}): string {
      const u = new URL(authorizeUrl);
      const p = u.searchParams;
      if (p.get("response_type") !== "code" || p.get("code_challenge_method") !== "S256") throw new Error("authorize_url sin PKCE/code");
      const code = randomBytes(16).toString("hex");
      codes.set(code, { identity, nonce: p.get("nonce")!, challenge: p.get("code_challenge")!, redirectUri: p.get("redirect_uri")!, overrides, used: false });
      return `${p.get("redirect_uri")}?code=${code}&state=${encodeURIComponent(p.get("state")!)}`;
    },
    close: () => new Promise<void>((ok) => server.close(() => ok())),
  };
}
export type FakeOidc = Awaited<ReturnType<typeof startFakeOidc>>;
