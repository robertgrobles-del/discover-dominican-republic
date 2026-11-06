import { LEGAL, LegalPage } from "./LegalPage";

const mail = <a href={`mailto:${LEGAL.email}`} className="font-medium text-primary hover:underline">{LEGAL.email}</a>;

export default function Privacidad() {
  return (
    <LegalPage
      title="Política de privacidad"
      path="/privacidad"
      description="Qué datos personales recoge Descubre RD, para qué los usa, dónde se guardan y cómo ejercer tus derechos."
      intro={<p>En {LEGAL.owner} ({LEGAL.site}) solo pedimos los datos que necesitamos para lo que nos solicitas. Aquí explicamos qué datos recogemos, para qué, dónde se guardan y cómo puedes consultarlos, corregirlos o pedir que los borremos, conforme a la Ley 172-13 de Protección de Datos de Carácter Personal de la República Dominicana.</p>}
      sections={[
        {
          id: "responsable", title: "Responsable",
          body: <p>El responsable de los datos es {LEGAL.owner}. Para cualquier consulta sobre privacidad puedes escribir a {mail}.</p>,
        },
        {
          id: "datos", title: "Qué datos recogemos",
          body: (
            <ul>
              <li><strong>Boletín:</strong> tu correo electrónico, cuando te suscribes en el pie de página.</li>
              <li><strong>Sorteo:</strong> tu nombre y tu correo, cuando participas.</li>
              <li><strong>Registro de negocios:</strong> el nombre del negocio y su tipo, la persona responsable, correo, teléfono, dirección, provincia, RNC si lo indicas, web o redes, horario, descripción y los detalles que completes según el tipo de negocio.</li>
              <li><strong>Seguridad:</strong> al enviar un formulario guardamos una huella cifrada de tu dirección IP (no la IP en sí), solo para frenar envíos masivos.</li>
              <li><strong>Preferencias en tu navegador:</strong> el idioma, el tema (claro u oscuro) y tu elección sobre cookies se guardan en tu propio dispositivo, no en nuestros servidores.</li>
            </ul>
          ),
        },
        {
          id: "finalidad", title: "Para qué los usamos",
          body: (
            <ul>
              <li>Enviarte el boletín con novedades y ofertas turísticas, si te suscribiste.</li>
              <li>Gestionar tu participación en el sorteo y contactarte si resultas ganador.</li>
              <li>Revisar la solicitud de tu negocio, contactarte sobre ella y, si se aprueba, publicarlo en el portal.</li>
              <li>Proteger el sitio frente a abusos.</li>
            </ul>
          ),
        },
        {
          id: "base", title: "Base legal",
          body: <p>Tratamos tus datos con tu consentimiento, que das al marcar la casilla correspondiente o al enviar el formulario, y para atender la solicitud que nos haces. Puedes retirar tu consentimiento en cualquier momento escribiéndonos a {mail}.</p>,
        },
        {
          id: "conservacion", title: "Cuánto tiempo los guardamos",
          body: (
            <ul>
              <li>Boletín: hasta que pidas la baja.</li>
              <li>Sorteo: hasta que termine y se entreguen los premios, y después el tiempo necesario para atender reclamaciones.</li>
              <li>Registro de negocios: mientras el negocio esté publicado o la solicitud esté en revisión. Las solicitudes rechazadas se borran cuando ya no son necesarias.</li>
            </ul>
          ),
        },
        {
          id: "donde", title: "Dónde se guardan y quién los trata",
          body: (
            <>
              <p>Los datos se guardan en una base de datos alojada por <strong>Turso</strong>, y el sitio se sirve desde <strong>Vercel</strong>. Ambos actúan como proveedores técnicos por cuenta nuestra y pueden almacenar los datos fuera de la República Dominicana. No vendemos ni cedemos tus datos a terceros para fines comerciales.</p>
              <p>Al navegar, tu navegador también se conecta a otros servicios para cargar recursos: fuentes tipográficas de Google Fonts, fotografías de Unsplash y Wikimedia Commons, y mapas de OpenStreetMap. Las fotos de Unsplash se cargan de forma que no se guarden cookies de ese servicio.</p>
            </>
          ),
        },
        {
          id: "cookies", title: "Cookies",
          body: <p>El sitio público no usa cookies de publicidad ni de seguimiento. Solo el personal autorizado que inicia sesión en el panel de administración recibe una cookie técnica, imprescindible para mantener esa sesión abierta de forma segura. Las preferencias de idioma, tema y cookies se guardan en el almacenamiento local de tu navegador.</p>,
        },
        {
          id: "derechos", title: "Tus derechos",
          body: <p>Puedes pedir en cualquier momento <strong>acceso</strong> a tus datos, su <strong>rectificación</strong> o <strong>cancelación</strong>, u <strong>oponerte</strong> a su uso, escribiendo a {mail} desde el correo que nos diste. Para darte de baja del boletín basta con escribirnos. Responderemos lo antes posible y siempre dentro de los plazos de la ley.</p>,
        },
        {
          id: "menores", title: "Menores de edad",
          body: <p>Los formularios del sitio están dirigidos a personas mayores de 18 años. Si sabes que un menor nos ha enviado datos, escríbenos y los borraremos.</p>,
        },
        {
          id: "cambios", title: "Cambios en esta política",
          body: <p>Si cambiamos esta política, publicaremos la nueva versión en esta página con su fecha de actualización.</p>,
        },
      ]}
    />
  );
}
