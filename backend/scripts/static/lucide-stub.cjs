// Algunos data files del frontend (src/data/*.ts) importan íconos de lucide-react sólo como referencia dentro de
// objetos de datos (`icon: Waves`); el loader estático (loader.ts) nunca los renderiza — el backend no es React.
// Un stub CJS con Proxy evita instalar lucide-react (y su árbol de dependencias de React) como devDependency del
// backend sólo para que esbuild pueda resolver el import. Cualquier nombre de ícono importado devuelve el mismo
// valor inerte; basta con que la propiedad exista y no truene el import.
module.exports = new Proxy({}, { get: () => "Icon" });
