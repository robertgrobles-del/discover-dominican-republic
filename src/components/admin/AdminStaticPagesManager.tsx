import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  Globe, 
  Search, 
  CheckCircle2, 
  Sparkles,
  Info,
  Shield,
  Phone,
  HelpCircle,
  Building,
  Home
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { contentDocumentsApi } from "@/lib/contentDocumentsApi";

export interface PageSectionBlock {
  id: string;
  title: string;
  content: string;
  subtitle?: string;
}

export interface StaticPageModel {
  slug: string;
  title: string;
  subtitle?: string;
  heroImageUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  sections: PageSectionBlock[];
  extraConfig?: Record<string, unknown>;
}

// Plantillas por defecto para las páginas fijas del portal
const DEFAULT_PAGES: Record<string, StaticPageModel> = {
  "sobre-nosotros": {
    slug: "sobre-nosotros",
    title: "Sobre Descubre República Dominicana",
    subtitle: "El ecosistema digital oficial y colaborativo para la difusión del turismo, la cultura y la biodiversidad dominicana.",
    seoTitle: "Sobre Nosotros | Descubre República Dominicana",
    seoDescription: "Conoce la historia, misión y equipo detrás del portal turístico de República Dominicana.",
    sections: [
      {
        id: "mision",
        title: "Nuestra Misión",
        content: "Conectar a los viajeros del mundo y a los dominicanos con la autenticidad de cada rincón de nuestra tierra, empoderando a las comunidades y operadores locales.",
      },
      {
        id: "vision",
        title: "Nuestra Visión",
        content: "Ser la plataforma de referencia tecnológica y experiencial del Caribe, promoviendo un turismo sostenible, descentralizado y de alto impacto.",
      },
      {
        id: "valores",
        title: "Nuestros Valores",
        content: "Hospitalidad dominicana, transparencia, sostenibilidad ambiental, orgullo cultural y excelencia digital.",
      }
    ]
  },
  "terminos": {
    slug: "terminos",
    title: "Términos y Condiciones de Uso",
    subtitle: "Normas de convivencia, uso de la plataforma y marco legal aplicable.",
    seoTitle: "Términos y Condiciones | Descubre RD",
    seoDescription: "Lee los términos y condiciones de uso del portal turístico Descubre República Dominicana.",
    sections: [
      {
        id: "intro",
        title: "1. Introducción y Aceptación",
        content: "Al acceder y utilizar Descubre República Dominicana, aceptas regirte por los presentes Términos y Condiciones y por todas las leyes aplicables en la República Dominicana.",
      },
      {
        id: "uso-sitio",
        title: "2. Uso del Contenido y Reservas",
        content: "Toda la información proporcionada tiene carácter informativo y de intermediación turística. Los precios y disponibilidad de operadores externos están sujetos a sus propias políticas de servicio.",
      },
      {
        id: "responsabilidad",
        title: "3. Limitación de Responsabilidad",
        content: "Descubre RD promueve únicamente establecimientos y prestadores de servicios que cumplen con la reglamentación turística vigente.",
      }
    ]
  },
  "privacidad": {
    slug: "privacidad",
    title: "Política de Privacidad y Tratamiento de Datos",
    subtitle: "Cómo protegemos tu información personal y respetamos tus derechos digitales.",
    seoTitle: "Política de Privacidad | Descubre RD",
    seoDescription: "Conoce nuestra política de protección de datos personales y privacidad.",
    sections: [
      {
        id: "datos",
        title: "1. Información que Recopilamos",
        content: "Solo recopilamos información personal (nombre, correo) cuando te registras voluntariamente, descargas el pasaporte digital o realizas una consulta con un operador.",
      },
      {
        id: "seguridad",
        title: "2. Seguridad y No Divulgación",
        content: "No vendemos ni compartimos tus datos con terceros para fines de publicidad masiva sin tu consentimiento expreso.",
      }
    ]
  },
  "accesibilidad": {
    slug: "accesibilidad",
    title: "Declaración de Accesibilidad Web",
    subtitle: "Nuestro compromiso con un portal accesible e inclusivo para todos los visitantes.",
    seoTitle: "Accesibilidad | Descubre RD",
    seoDescription: "Declaración de conformidad con estándares WCAG y opciones de accesibilidad en Descubre RD.",
    sections: [
      {
        id: "wcag",
        title: "Estándares y Conformidad",
        content: "El portal está optimizado para lectores de pantalla, navegación por teclado, contraste alto automático y fuente para dislexia según pautas WCAG 2.1 AA.",
      }
    ]
  },
  "contacto": {
    slug: "contacto",
    title: "Contacto y Atención al Ciudadano / Turista",
    subtitle: "¿Tienes preguntas, sugerencias o necesitas asistencia en tu viaje? Estamos aquí para ayudarte.",
    seoTitle: "Contacto y Soporte | Descubre RD",
    seoDescription: "Canales oficiales de contacto, teléfonos de asistencia al turista y soporte.",
    sections: [
      {
        id: "canales",
        title: "Canales Principales",
        content: "Correo: soporte@descubrerd.com | Teléfono: +1 (809) 555-0199 | Horario: Lunes a Viernes de 8:00 AM a 6:00 PM.",
      },
      {
        id: "emergencia-turista",
        title: "Asistencia al Turista en Destino (POLITUR)",
        content: "Línea de emergencia turística POLITUR: 911 o al teléfono directo 809-200-3500 (gratuito desde todo el país).",
      }
    ]
  },
  "inicio-hero": {
    slug: "inicio-hero",
    title: "Textos de Portada (Página de Inicio)",
    subtitle: "Configuración del mensaje principal, llamada a la acción y mensaje de bienvenida.",
    seoTitle: "Descubre República Dominicana - Tu Portal Oficial del Caribe",
    seoDescription: "Explora las mejores playas, hoteles, cultura y aventuras de República Dominicana.",
    sections: [
      {
        id: "titular",
        title: "Titular Principal (Hero Title)",
        content: "Descubre la Magia de la República Dominicana",
      },
      {
        id: "bajada",
        title: "Subtítulo / Mensaje de Bienvenida",
        content: "Más de 300 días de sol, playas cristalinas, rica cultura gastronómica y aventuras inolvidables en el corazón del Caribe.",
      },
      {
        id: "cta",
        title: "Texto del Botón Principal (CTA)",
        content: "Explorar Destinos Ahora",
      }
    ]
  }
};

const PAGE_KEYS = [
  { key: "inicio-hero", label: "Página de Inicio (Hero)", icon: Home },
  { key: "sobre-nosotros", label: "Sobre Nosotros", icon: Building },
  { key: "contacto", label: "Contacto & Soporte", icon: Phone },
  { key: "terminos", label: "Términos y Condiciones", icon: FileText },
  { key: "privacidad", label: "Política de Privacidad", icon: Shield },
  { key: "accesibilidad", label: "Accesibilidad", icon: Info },
];

export function AdminStaticPagesManager() {
  const qc = useQueryClient();
  const [selectedPageKey, setSelectedPageKey] = useState<string>("sobre-nosotros");
  const [pageData, setPageData] = useState<StaticPageModel>(DEFAULT_PAGES["sobre-nosotros"]!);
  const [activeTab, setActiveTab] = useState<string>("content");

  // Consultar el dataset guardado en la base de datos (clave con prefijo page_)
  const datasetKey = `page-${selectedPageKey}`;
  const { data: savedDoc, isLoading } = useQuery({
    queryKey: ["content-dataset", datasetKey],
    queryFn: () => contentDocumentsApi.get(datasetKey).catch(() => null),
  });

  // Al cambiar de página o recibir datos de la BD, actualizar el formulario
  useEffect(() => {
    if (savedDoc?.data?.value && typeof savedDoc.data.value === "object") {
      setPageData(savedDoc.data.value as unknown as StaticPageModel);
    } else {
      setPageData(DEFAULT_PAGES[selectedPageKey] || {
        slug: selectedPageKey,
        title: "Nueva Página Fija",
        sections: []
      });
    }
  }, [selectedPageKey, savedDoc]);

  const saveMutation = useMutation({
    mutationFn: (updated: StaticPageModel) => 
      contentDocumentsApi.save(datasetKey, updated as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast.success(`Página "${pageData.title}" guardada exitosamente en la base de datos.`);
      qc.invalidateQueries({ queryKey: ["content-dataset", datasetKey] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Error al guardar la página fija.");
    }
  });

  const handleFieldChange = (field: keyof StaticPageModel, val: unknown) => {
    setPageData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSectionChange = (index: number, key: keyof PageSectionBlock, val: string) => {
    setPageData((prev) => {
      const nextSections = [...prev.sections];
      nextSections[index] = { ...nextSections[index]!, [key]: val };
      return { ...prev, sections: nextSections };
    });
  };

  const handleAddSection = () => {
    const newId = `sec-${Date.now()}`;
    setPageData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        { id: newId, title: "Nueva Sección", content: "Contenido de la sección..." }
      ]
    }));
  };

  const handleRemoveSection = (index: number) => {
    setPageData((prev) => {
      const nextSections = prev.sections.filter((_, i) => i !== index);
      return { ...prev, sections: nextSections };
    });
  };

  const handleResetToDefault = () => {
    if (DEFAULT_PAGES[selectedPageKey]) {
      setPageData(DEFAULT_PAGES[selectedPageKey]!);
      toast.info("Se restablecieron los textos originales por defecto.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Gestor de Páginas Fijas e Institucionales
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Edita y publica los textos de las páginas institucionales, avisos legales y encabezados directamente en la base de datos.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleResetToDefault}
            title="Restablecer plantilla inicial"
          >
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Restablecer
          </Button>
          <Button 
            size="sm" 
            onClick={() => saveMutation.mutate(pageData)}
            disabled={saveMutation.isPending}
            className="bg-primary text-primary-foreground font-semibold"
          >
            <Save className="h-4 w-4 mr-1.5" />
            {saveMutation.isPending ? "Guardando en BD..." : "Guardar y Publicar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-6">
        {/* Menú Lateral de Páginas Fijas */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
            Páginas del Sistema
          </h3>
          <div className="space-y-1">
            {PAGE_KEYS.map((page) => {
              const Icon = page.icon;
              const isSelected = selectedPageKey === page.key;
              return (
                <button
                  key={page.key}
                  type="button"
                  onClick={() => setSelectedPageKey(page.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                    isSelected 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                  <span className="truncate">{page.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel Central del Editor de la Página Seleccionada */}
        <Card className="border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">{pageData.title}</CardTitle>
                <CardDescription className="text-xs mt-0.5">
                  Ruta pública: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">/{pageData.slug}</code>
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {savedDoc?.data ? "Modificado en BD" : "Plantilla Inicial"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="content" className="text-xs">Contenido y Secciones</TabsTrigger>
                <TabsTrigger value="seo" className="text-xs">SEO & Redes Sociales</TabsTrigger>
              </TabsList>

              {/* Pestaña: Contenido y Secciones */}
              <TabsContent value="content" className="space-y-5">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Título Principal de la Página</Label>
                    <Input 
                      value={pageData.title} 
                      onChange={(e) => handleFieldChange("title", e.target.value)}
                      placeholder="Título de la página..."
                      className="text-sm font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Subtítulo o Resumen de Entrada</Label>
                    <Textarea 
                      value={pageData.subtitle || ""} 
                      onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                      placeholder="Breve introducción de la página..."
                      rows={2}
                      className="text-xs leading-relaxed"
                    />
                  </div>
                </div>

                {/* Bloques de Secciones */}
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">Bloques y Secciones</h4>
                      <p className="text-xs text-muted-foreground">Cada bloque representa un párrafo, cláusula o acápite.</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddSection}
                      className="text-xs"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Añadir Sección
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {pageData.sections.map((sec, idx) => (
                      <div 
                        key={sec.id || idx} 
                        className="rounded-xl border border-border p-4 bg-muted/20 space-y-3 relative group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            Sección #{idx + 1}
                          </span>
                          {pageData.sections.length > 1 && (
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleRemoveSection(idx)}
                              className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                              title="Eliminar esta sección"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Título del Bloque</Label>
                          <Input 
                            value={sec.title} 
                            onChange={(e) => handleSectionChange(idx, "title", e.target.value)}
                            placeholder="Ej. Nuestra Historia o 1. Objeto del Servicio"
                            className="text-sm font-medium bg-background"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <Label className="text-xs font-medium">Cuerpo del Texto</Label>
                          <Textarea 
                            value={sec.content} 
                            onChange={(e) => handleSectionChange(idx, "content", e.target.value)}
                            placeholder="Escribe el texto detallado aquí..."
                            rows={4}
                            className="text-xs leading-relaxed bg-background"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Pestaña: SEO y Meta Etiquetas */}
              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Meta Título (Para Google y Pestaña del Navegador)</Label>
                  <Input 
                    value={pageData.seoTitle || ""} 
                    onChange={(e) => handleFieldChange("seoTitle", e.target.value)}
                    placeholder="Ej. Sobre Nosotros | Descubre República Dominicana"
                    className="text-sm bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">Recomendado: entre 50 y 60 caracteres.</p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Meta Descripción (Snippet en Buscadores)</Label>
                  <Textarea 
                    value={pageData.seoDescription || ""} 
                    onChange={(e) => handleFieldChange("seoDescription", e.target.value)}
                    placeholder="Descripción resumida para los resultados de búsqueda..."
                    rows={3}
                    className="text-xs leading-relaxed bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">Recomendado: entre 120 y 160 caracteres.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
