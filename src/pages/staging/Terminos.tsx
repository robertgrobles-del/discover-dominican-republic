import { Link } from "react-router-dom";
import { LEGAL, LegalPage } from "./LegalPage";

const mail = <a href={`mailto:${LEGAL.email}`} className="font-medium text-primary hover:underline">{LEGAL.email}</a>;
const privacidad = <Link to="/privacidad" className="font-medium text-primary hover:underline">Política de privacidad</Link>;

export default function Terminos() {
  return (
    <LegalPage
      title="Términos y condiciones"
      path="/terminos"
      description="Condiciones de uso de Descubre RD: contenido informativo, publicidad, sorteo, registro de negocios y propiedad intelectual."
      intro={<p>Estos términos regulan el uso de {LEGAL.site} ({LEGAL.owner}). Al navegar por el sitio o enviar un formulario aceptas estas condiciones y nuestra {privacidad}.</p>}
      sections={[
        {
          id: "objeto", title: "Qué es Descubre RD",
          body: <p>Descubre RD es un portal informativo sobre turismo en la República Dominicana: noticias, destinos, eventos y consejos para viajar. No es un sitio oficial del Gobierno dominicano ni de ninguna de las empresas que aparecen en él, salvo que se indique expresamente.</p>,
        },
        {
          id: "informacion", title: "Información del sitio",
          body: (
            <>
              <p>Publicamos la información de buena fe y procuramos mantenerla al día, pero horarios, precios, requisitos de entrada y condiciones de terceros pueden cambiar sin aviso.</p>
              <p>Antes de viajar, comprueba los requisitos migratorios y sanitarios en las fuentes oficiales, y confirma con cada establecimiento o proveedor sus precios y condiciones. Las reservas o compras que hagas con terceros se rigen por sus propias condiciones.</p>
            </>
          ),
        },
        {
          id: "uso", title: "Uso del sitio",
          body: (
            <ul>
              <li>Puedes usar el sitio para informarte y planificar tus viajes.</li>
              <li>No está permitido enviar información falsa, suplantar a otra persona, intentar acceder a zonas restringidas ni sobrecargar el sitio con envíos automáticos.</li>
              <li>Podemos bloquear envíos o accesos que incumplan estas normas.</li>
            </ul>
          ),
        },
        {
          id: "publicidad", title: "Publicidad y contenido patrocinado",
          body: <p>El sitio incluye espacios publicitarios. Los anuncios y contenidos patrocinados se identifican como tales. Que un negocio aparezca anunciado no implica que lo recomendemos ni que garanticemos sus servicios.</p>,
        },
        {
          id: "sorteo", title: "Sorteo",
          body: (
            <ul>
              <li>La participación es gratuita y basta con un registro por correo electrónico; los registros duplicados no suman participaciones.</li>
              <li>Los premios, las fechas y la forma de elegir al ganador se anunciarán en el sitio antes del sorteo.</li>
              <li>Podemos verificar los datos del ganador antes de entregar el premio, y anular las participaciones con datos falsos o automatizadas.</li>
            </ul>
          ),
        },
        {
          id: "negocios", title: "Registro de negocios",
          body: (
            <ul>
              <li>Quien registra un negocio declara que tiene autorización para hacerlo y que los datos son verídicos, y se compromete a mantenerlos actualizados.</li>
              <li>Revisamos cada solicitud y podemos aprobarla, pedir más información o rechazarla.</li>
              <li>Aparecer en el portal no constituye una certificación oficial ni sustituye las licencias que exija la ley.</li>
            </ul>
          ),
        },
        {
          id: "propiedad", title: "Propiedad intelectual",
          body: <p>Los textos, el diseño y la marca Descubre RD nos pertenecen o los usamos con permiso. Algunas fotografías son de terceros y se usan con sus licencias, indicando el autor cuando la licencia lo exige. No está permitido copiar el contenido del sitio con fines comerciales sin autorización.</p>,
        },
        {
          id: "enlaces", title: "Enlaces a otros sitios",
          body: <p>El sitio puede enlazar a páginas de terceros. No controlamos su contenido ni respondemos de él.</p>,
        },
        {
          id: "responsabilidad", title: "Responsabilidad",
          body: <p>Hacemos lo posible para que el sitio funcione sin interrupciones y con información correcta, pero no podemos garantizarlo en todo momento. No respondemos de los daños derivados de decisiones tomadas solo a partir de la información del sitio, ni de los servicios que presten terceros.</p>,
        },
        {
          id: "ley", title: "Ley aplicable",
          body: <p>Estos términos se rigen por las leyes de la República Dominicana. Para cualquier controversia serán competentes los tribunales de Santo Domingo, Distrito Nacional.</p>,
        },
        {
          id: "cambios", title: "Cambios y contacto",
          body: <p>Podemos actualizar estos términos; la versión vigente es siempre la publicada en esta página. Si tienes preguntas, escríbenos a {mail}.</p>,
        },
      ]}
    />
  );
}
