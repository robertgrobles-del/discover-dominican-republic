// Genera un par de claves RS256 para firmar los JWT de acceso: `npm run keys:generate`.
// Copia las dos variables a tu gestor de secretos (nunca al repositorio). Para rotar claves ver backend/README.md.
import { generateSigningKeys } from "../src/modules/auth/tokens.js";

const { privateKeyPem, publicKeyPem, kid } = await generateSigningKeys();
const oneLine = (pem: string) => pem.trim().replace(/\r?\n/g, "\n");
console.log(`# kid (huella de la clave pública): ${kid}`);
console.log(`JWT_PRIVATE_KEY="${oneLine(privateKeyPem)}"`);
console.log(`JWT_PUBLIC_KEY="${oneLine(publicKeyPem)}"`);
