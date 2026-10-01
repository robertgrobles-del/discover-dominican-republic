/** Comprueba una contraseña contra su hash almacenado; el algoritmo y sus parámetros son de `auth`. */
export type PasswordVerifier = (storedHash: string, password: string) => Promise<boolean>;
