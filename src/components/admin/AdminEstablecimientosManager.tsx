import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, 
  Hotel, 
  UtensilsCrossed, 
  Wine, 
  Sparkles, 
  Coffee, 
  Stethoscope, 
  Home, 
  ShoppingBag, 
  Search, 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Archive, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  Loader2, 
  ChevronRight,
  Eye,
  Star,
  MapPin,
  Phone,
  Mail,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useAdminEntities, type EntityType } from "@/hooks/useAdminEntities";
import { EntityFormDialog } from "@/components/admin/EntityFormDialog";
import { getFieldsConfig, entityConfigs } from "@/components/admin/AdminEntityConfigs";
import { adminSaveTranslations } from "@/lib/adminApi";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";

export type EstablishmentSubtype = 
  | "hotels" 
  | "restaurants" 
  | "bars" 
  | "spas_wellness" 
  | "coffee_experiences" 
  | "clinics" 
  | "airbnb_listings" 
  | "artisanal_workshops"
  | "shopping_centers";

interface SubtypeDef {
  key: EstablishmentSubtype;
  label: string;
  singular: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeText: string;
}

const ESTABLISHMENT_TYPES: SubtypeDef[] = [
  {
    key: "hotels",
    label: "Hoteles & Resorts",
    singular: "Hotel",
    description: "Hospedajes, resorts todo incluido, hoteles boutique y eco-lodges.",
    icon: Hotel,
    accentColor: "from-sky-500/20 to-blue-600/10 text-sky-500 border-sky-500/30",
    badgeText: "Hospedaje",
  },
  {
    key: "restaurants",
    label: "Restaurantes & Gastronomía",
    singular: "Restaurante",
    description: "Restaurantes criollos, cocina internacional, marisquerías y bistrós.",
    icon: UtensilsCrossed,
    accentColor: "from-emerald-500/20 to-teal-600/10 text-emerald-500 border-emerald-500/30",
    badgeText: "Gastronomía",
  },
  {
    key: "bars",
    label: "Bares & Vida Nocturna",
    singular: "Bar / Discoteca",
    description: "Discotecas, rooftops, speakeasies, lounge bars y coctelerías.",
    icon: Wine,
    accentColor: "from-purple-500/20 to-pink-600/10 text-purple-500 border-purple-500/30",
    badgeText: "Vida Nocturna",
  },
  {
    key: "spas_wellness",
    label: "Spas & Wellness",
    singular: "Centro Spa",
    description: "Spas termales, centros holísticos, masajes y retiros de bienestar.",
    icon: Sparkles,
    accentColor: "from-rose-500/20 to-amber-600/10 text-rose-500 border-rose-500/30",
    badgeText: "Bienestar",
  },
  {
    key: "coffee_experiences",
    label: "Cafés & Ecoturismo",
    singular: "Experiencia de Café",
    description: "Cafeterías de especialidad, senderos de café y degustaciones.",
    icon: Coffee,
    accentColor: "from-amber-500/20 to-orange-600/10 text-amber-500 border-amber-500/30",
    badgeText: "Café",
  },
  {
    key: "clinics",
    label: "Clínicas & Turismo de Salud",
    singular: "Clínica / Centro",
    description: "Centros médicos, clínicas odontológicas, estética y salud especializada.",
    icon: Stethoscope,
    accentColor: "from-cyan-500/20 to-blue-600/10 text-cyan-500 border-cyan-500/30",
    badgeText: "Salud",
  },
  {
    key: "shopping_centers",
    label: "Centros Comerciales",
    singular: "Centro Comercial",
    description: "Plazas, malls y centros comerciales con tiendas, cine y food court.",
    icon: ShoppingBag,
    accentColor: "from-indigo-500/20 to-violet-600/10 text-indigo-500 border-indigo-500/30",
    badgeText: "Compras",
  },
  {
    key: "airbnb_listings",
    label: "Airbnb & Villas",
    singular: "Alojamiento",
    description: "Villas privadas, apartamentos vacacionales y cabañas turísticas.",
    icon: Home,
    accentColor: "from-indigo-500/20 to-violet-600/10 text-indigo-500 border-indigo-500/30",
    badgeText: "Alquiler Vacacional",
  },
  {
    key: "artisanal_workshops",
    label: "Talleres & Artesanías",
    singular: "Taller Artesanal",
    description: "Talleres locales de larimar, ámbar, tabaco, alfarería y artesanía dominicana.",
    icon: ShoppingBag,
    accentColor: "from-orange-500/20 to-amber-600/10 text-orange-500 border-orange-500/30",
    badgeText: "Artesanía",
  },
];

interface EstablishmentItem {
  id: string;
  name?: string;
  nombre?: string;
  title?: string;
  slug?: string;
  status?: "draft" | "in_review" | "published" | "archived";
  is_active?: boolean;
  is_featured?: boolean;
  rating?: number;
  stars?: number;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_by?: string | null;
  updated_at?: string;
  created_at?: string;
  [key: string]: unknown;
}

export function AdminEstablecimientosManager() {
  const { user } = useAuth();
  const [activeSubtype, setActiveSubtype] = useState<EstablishmentSubtype>("hotels");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const { listEntities, createEntity, updateEntity, deleteEntity } = useAdminEntities();
  const [items, setItems] = useState<EstablishmentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loadingList, setLoadingList] = useState(false);

  // Modal de creación / edición
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EstablishmentItem | null>(null);

  // Confirmación de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EstablishmentItem | null>(null);

  // Rol del usuario actual
  const userRoles = (user?.app_metadata?.roles as string[] | undefined) ?? [];
  const isAdminOrStaff = userRoles.includes("admin") || userRoles.includes("editor");

  const currentTypeConfig = useMemo(() => {
    return ESTABLISHMENT_TYPES.find((t) => t.key === activeSubtype) || ESTABLISHMENT_TYPES[0];
  }, [activeSubtype]);

  const formFields = useMemo(() => {
    return getFieldsConfig(activeSubtype as Parameters<typeof getFieldsConfig>[0]);
  }, [activeSubtype]);

  const fetchEstablishments = async () => {
    setLoadingList(true);
    try {
      const result = await listEntities<EstablishmentItem>(activeSubtype as EntityType, {
        search: search.trim() || undefined,
        limit: pageSize,
        offset: page * pageSize,
      });

      if (result?.data) {
        setItems(result.data);
        setTotal(result.total || 0);
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error al cargar establecimientos:", err);
      toast.error("No se pudieron cargar los establecimientos");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    setPage(0);
    fetchEstablishments();
  }, [activeSubtype]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchEstablishments();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreateNew = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: EstablishmentItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDeletePrompt = (item: EstablishmentItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteEntity(activeSubtype as EntityType, itemToDelete.id);
      toast.success("Establecimiento eliminado correctamente");
      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchEstablishments();
    } catch (err: any) {
      toast.error(err?.message || "Error al eliminar el establecimiento");
    }
  };

  const handleFormSubmit = async (
    data: Record<string, unknown>,
    translations?: Record<string, Record<string, string>>
  ) => {
    try {
      let result;
      if (editingItem) {
        result = await updateEntity(activeSubtype as EntityType, editingItem.id, data);
        toast.success("Establecimiento actualizado con éxito");
      } else {
        result = await createEntity(activeSubtype as EntityType, data);
        toast.success("Establecimiento creado con éxito");
      }

      if (result?.data && translations && HAS_BACKEND_SESSION) {
        const entityId = (result.data as any).id || (editingItem ? editingItem.id : null);
        if (entityId) {
          await adminSaveTranslations(activeSubtype, entityId, translations).catch((e) =>
            console.warn("Fallo guardando traducciones:", e)
          );
        }
      }

      setFormOpen(false);
      fetchEstablishments();
    } catch (err: any) {
      toast.error(err?.message || "Error al guardar el establecimiento");
      throw err;
    }
  };

  // Filtrado en cliente de estado para mayor agilidad visual
  const filteredItems = useMemo(() => {
    if (statusFilter === "all") return items;
    return items.filter((it) => {
      const itemStatus = it.status || (it.is_active ? "published" : "draft");
      return itemStatus === statusFilter;
    });
  }, [items, statusFilter]);

  const renderStatusBadge = (item: EstablishmentItem) => {
    const status = item.status || (item.is_active ? "published" : "draft");
    switch (status) {
      case "published":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Publicado
          </Badge>
        );
      case "in_review":
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400 gap-1 font-medium">
            <Clock className="h-3 w-3" /> En Revisión
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-muted-foreground border-border/80 gap-1 font-medium">
            <AlertCircle className="h-3 w-3" /> Borrador
          </Badge>
        );
      case "archived":
        return (
          <Badge variant="secondary" className="gap-1 font-medium">
            <Archive className="h-3 w-3" /> Archivado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal y Resumen de Perfil */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-card via-card/90 to-card/70 border border-border/70 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Gestión de Establecimientos
                </h2>
                {isAdminOrStaff ? (
                  <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold text-2xs gap-1">
                    <ShieldCheck className="h-3 w-3" /> Vista Administrador (Catálogo Completo)
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400 font-semibold text-2xs gap-1">
                    <UserCheck className="h-3 w-3" /> Modo Propietario (Tus Propiedades)
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isAdminOrStaff
                  ? "Tienes acceso de supervisión y edición a todos los establecimientos registrados en la República Dominicana."
                  : "Aquí administras exclusivamente tus establecimientos propios. Los cambios guardados se reflejan directamente en la plataforma."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button onClick={handleCreateNew} className="gap-2 shadow-xs font-semibold rounded-xl">
            <Plus className="h-4 w-4" />
            Nuevo {currentTypeConfig.singular}
          </Button>
        </div>
      </div>

      {/* Submenú / Navegador por Tipo de Establecimiento */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Categorías de Establecimientos
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            {ESTABLISHMENT_TYPES.length} categorías disponibles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {ESTABLISHMENT_TYPES.map((type) => {
            const Icon = type.icon;
            const isSelected = activeSubtype === type.key;
            return (
              <button
                key={type.key}
                type="button"
                onClick={() => setActiveSubtype(type.key)}
                className={`flex flex-col items-center justify-center text-center p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs ring-1 ring-primary/30"
                    : "bg-card/70 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className={`p-2 rounded-lg mb-1.5 ${isSelected ? "bg-primary text-primary-foreground shadow-xs" : "bg-muted"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium leading-tight line-clamp-1">{type.label.split(" ")[0]}</span>
                <span className="text-3xs text-muted-foreground/80 mt-0.5">{type.badgeText}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Detallado de la Categoría Seleccionada */}
      <Card className="rounded-2xl border-border/70 shadow-xs overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-muted/20 py-4 px-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl border ${currentTypeConfig.accentColor}`}>
                {React.createElement(currentTypeConfig.icon, { className: "h-5 w-5" })}
              </div>
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  {currentTypeConfig.label}
                  <Badge variant="outline" className="text-xs font-mono font-normal">
                    {total} {total === 1 ? "registrado" : "registrados"}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  {currentTypeConfig.description}
                </CardDescription>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder={`Buscar en ${currentTypeConfig.label.toLowerCase()}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8.5 h-9 text-xs rounded-lg border-border/70 bg-background"
                />
              </div>

              <div className="flex items-center gap-1 bg-background border border-border/70 rounded-lg p-0.5">
                {[
                  { id: "all", label: "Todos" },
                  { id: "published", label: "Publicados" },
                  { id: "draft", label: "Borradores" },
                  { id: "in_review", label: "En revisión" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatusFilter(st.id)}
                    className={`px-2.5 py-1 text-2xs font-medium rounded-md transition-colors ${
                      statusFilter === st.id
                        ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <ScrollArea className="h-[520px]">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10 border-b border-border/60">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold text-xs text-foreground/80 py-3 pl-5">Establecimiento</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground/80 hidden md:table-cell">Ubicación / Contacto</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground/80 hidden lg:table-cell">Detalles / Calificación</TableHead>
                  <TableHead className="font-semibold text-xs text-foreground/80 text-center">Estado</TableHead>
                  {isAdminOrStaff && (
                    <TableHead className="font-semibold text-xs text-foreground/80 hidden xl:table-cell">Propietario (ID)</TableHead>
                  )}
                  <TableHead className="font-semibold text-xs text-foreground/80 text-right pr-5">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList ? (
                  <TableRow>
                    <TableCell colSpan={isAdminOrStaff ? 6 : 5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Cargando tus establecimientos...
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdminOrStaff ? 6 : 5} className="text-center py-16">
                      <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center space-y-3">
                        <div className="p-3 rounded-2xl bg-muted text-muted-foreground">
                          {React.createElement(currentTypeConfig.icon, { className: "h-8 w-8" })}
                        </div>
                        <div className="space-y-1">
                          <h3 className="h4 text-sm font-semibold text-foreground">
                            No hay {currentTypeConfig.label.toLowerCase()} disponibles
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {search
                              ? "No se encontraron coincidencias para tu búsqueda actual."
                              : !isAdminOrStaff
                              ? "Aún no tienes establecimientos creados en esta categoría. Puedes registrar el primero ahora."
                              : "No hay registros cargados en esta tabla de la base de datos."}
                          </p>
                        </div>
                        <Button size="sm" onClick={handleCreateNew} className="gap-1.5 rounded-lg text-xs font-semibold">
                          <Plus className="h-3.5 w-3.5" /> Crear {currentTypeConfig.singular}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => {
                    const itemName = item.name || item.nombre || item.title || "Sin nombre";
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/40 transition-colors">
                        <TableCell className="pl-5 py-3">
                          <div className="flex items-start gap-3">
                            {item.image_url ? (
                              <img
                                src={String(item.image_url)}
                                alt={itemName}
                                className="h-10 w-10 rounded-lg object-cover border border-border/70 shrink-0"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground border border-border/70 shrink-0">
                                {React.createElement(currentTypeConfig.icon, { className: "h-5 w-5" })}
                              </div>
                            )}
                            <div className="space-y-0.5">
                              <p className="font-semibold text-xs text-foreground line-clamp-1">{itemName}</p>
                              {item.slug && (
                                <p className="text-2xs font-mono text-muted-foreground truncate max-w-[200px]">
                                  /{item.slug}
                                </p>
                              )}
                              {item.category && (
                                <Badge variant="secondary" className="text-3xs px-1.5 py-0 mt-0.5">
                                  {String(item.category)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="hidden md:table-cell py-3">
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {item.address && (
                              <p className="flex items-center gap-1.5 truncate max-w-[220px]">
                                <MapPin className="h-3 w-3 shrink-0 text-primary" />
                                <span className="truncate">{String(item.address)}</span>
                              </p>
                            )}
                            {item.phone && (
                              <p className="flex items-center gap-1.5">
                                <Phone className="h-3 w-3 shrink-0 text-emerald-500" />
                                <span>{String(item.phone)}</span>
                              </p>
                            )}
                            {item.website && (
                              <a
                                href={String(item.website)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-primary hover:underline truncate max-w-[220px]"
                              >
                                <Globe className="h-3 w-3 shrink-0" />
                                <span className="truncate">{String(item.website).replace(/^https?:\/\//, "")}</span>
                              </a>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="hidden lg:table-cell py-3">
                          <div className="space-y-1 text-xs">
                            {item.rating !== undefined && Number(item.rating) > 0 && (
                              <div className="flex items-center gap-1 text-amber-500 font-semibold">
                                <Star className="h-3.5 w-3.5 fill-amber-500" />
                                <span>{Number(item.rating).toFixed(1)}</span>
                                {item.review_count && (
                                  <span className="text-muted-foreground text-2xs font-normal">
                                    ({Number(item.review_count)} reseñas)
                                  </span>
                                )}
                              </div>
                            )}
                            {item.price_range && (
                              <Badge variant="outline" className="text-3xs font-mono">
                                {String(item.price_range)}
                              </Badge>
                            )}
                            {item.stars && (
                              <div className="text-2xs text-muted-foreground">
                                {"⭐".repeat(Number(item.stars))}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-center py-3">
                          {renderStatusBadge(item)}
                        </TableCell>

                        {isAdminOrStaff && (
                          <TableCell className="hidden xl:table-cell py-3">
                            <span className="text-2xs font-mono text-muted-foreground truncate block max-w-[120px]" title={item.created_by || "Sistema / Precargado"}>
                              {item.created_by ? `${item.created_by.slice(0, 8)}...` : "Sistema"}
                            </span>
                          </TableCell>
                        )}

                        <TableCell className="text-right pr-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              title="Editar establecimiento"
                              className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePrompt(item)}
                              title="Eliminar establecimiento"
                              className="h-8 w-8 p-0 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Barra de paginación */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-border/60 bg-muted/10 text-xs">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{filteredItems.length}</span> de{" "}
              <span className="font-semibold text-foreground">{total}</span> {currentTypeConfig.label.toLowerCase()}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 rounded-lg text-xs"
              >
                Anterior
              </Button>
              <span className="text-xs font-mono text-muted-foreground px-1">
                Pág. {page + 1} de {Math.max(1, Math.ceil(total / pageSize))}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={(page + 1) * pageSize >= total}
                className="h-8 rounded-lg text-xs"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Formulario de Creación / Edición */}
      {formOpen && (
        <EntityFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editingItem ? `Editar ${currentTypeConfig.singular}` : `Nuevo ${currentTypeConfig.singular}`}
          entity={activeSubtype as EntityType}
          fields={formFields}
          initialData={editingItem || undefined}
          onSubmit={handleFormSubmit}
        />
      )}

      {/* Confirmación de Borrado */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este establecimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción dará de baja el registro de &ldquo;
              {itemToDelete?.name || itemToDelete?.nombre || itemToDelete?.title || "este establecimiento"}
              &rdquo;. Los datos no serán visibles para los usuarios del portal.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AdminEstablecimientosManager;
