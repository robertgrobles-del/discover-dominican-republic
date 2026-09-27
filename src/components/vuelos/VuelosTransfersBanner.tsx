import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function VuelosTransfersBanner() {
  return (
    <section className="container mx-auto px-4 pb-16 max-w-6xl">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            Traslados & Transfer Aeropuerto
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
            ¿Llegas a RD? Reserva tu transfer oficial del aeropuerto al hotel
          </h2>
          <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6">
            Evita sobreprecios y filas al aterrizar. Vehículos privados con aire acondicionado, chófer bilingüe certificado por MITUR y tarifas planas desde PUJ, SDQ y STI.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/rent-a-car">
              <Button className="bg-white text-blue-950 hover:bg-white/90 font-bold rounded-xl text-sm">
                Ver Opciones de Traslados y Rent a Car
              </Button>
            </Link>
            <Link to="/para-empresas">
              <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl text-sm">
                ¿Eres empresa de transporte? Afíliate aquí
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
