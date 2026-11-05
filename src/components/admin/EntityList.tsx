import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Loader2, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { EntityType, useAdminEntities } from '@/hooks/useAdminEntities';
import { EntityFormDialog } from './EntityFormDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { HAS_BACKEND_SESSION } from '@/lib/authSource';
import { adminSaveTranslations } from '@/lib/adminApi';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'url' | 'email' | 'date' | 'time' | 'objectlist' | 'object';
  required?: boolean;
  placeholder?: string;
  showInList?: boolean;
}

interface EntityListProps {
  entity: EntityType;
  entityName: string;
  fields: FieldConfig[];
}

interface EntityItem {
  id: string;
  name: string;
  slug?: string;
  is_active?: boolean;
  is_featured?: boolean;
  rating?: number;
  created_at?: string;
  [key: string]: unknown;
}

export function EntityList({ entity, entityName, fields }: EntityListProps) {
  const { loading, listEntities, createEntity, updateEntity, deleteEntity } = useAdminEntities();
  const [items, setItems] = useState<EntityItem[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EntityItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<EntityItem | null>(null);
  const [loadingList, setLoadingList] = useState(false);

  const pageSize = 20;

  const fetchItems = async () => {
    setLoadingList(true);
    const result = await listEntities<EntityItem>(entity, {
      search: search || undefined,
      limit: pageSize,
      offset: page * pageSize
    });
    if (result?.data) {
      setItems(result.data);
      setTotal(result.total || 0);
    }
    setLoadingList(false);
  };

  useEffect(() => {
    fetchItems();
  }, [entity, page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      fetchItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleEdit = (item: EntityItem) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleDeleteClick = (item: EntityItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    await deleteEntity(entity, itemToDelete.id);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
    fetchItems();
  };

  const saveTranslations = async (
    entityType: string,
    entityId: string,
    translations: Record<string, Record<string, string>>
  ) => {
    if (HAS_BACKEND_SESSION) {
      try {
        await adminSaveTranslations(entityType, entityId, translations);
      } catch (error) {
        console.error('Error saving translations:', error);
        toast.error('Traducciones sin guardar', { description: error instanceof Error ? error.message : 'Error desconocido' });
      }
      return;
    }
    const upsertData: any[] = [];
    
    Object.entries(translations).forEach(([lang, fields]) => {
      Object.entries(fields).forEach(([fieldName, text]) => {
        upsertData.push({
          entity_type: entityType,
          entity_id: entityId,
          language: lang,
          field_name: fieldName,
          translation_text: text || '',
        });
      });
    });
    
    if (upsertData.length > 0) {
      const { error } = await supabase
        .from('entity_translations')
        .upsert(upsertData, { onConflict: 'entity_type,entity_id,language,field_name' });
        
      if (error) {
        console.error('Error saving translations:', error);
      }
    }
  };

  const handleFormSubmit = async (data: Record<string, unknown>, translations?: Record<string, Record<string, string>>) => {
    let result;
    if (editingItem) {
      result = await updateEntity(entity, editingItem.id, data);
    } else {
      result = await createEntity(entity, data);
    }

    if (result?.data && translations) {
      const entityId = (result.data as any).id || (editingItem ? editingItem.id : null);
      if (entityId) {
        await saveTranslations(entity, entityId, translations);
      }
    }

    setFormOpen(false);
    fetchItems();
  };

  const toggleActive = async (item: EntityItem) => {
    await updateEntity(entity, item.id, { is_active: !item.is_active });
    fetchItems();
  };

  const listFields = fields.filter(f => f.showInList !== false).slice(0, 4);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      {/* Modern ERP Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3.5 bg-card/60 backdrop-blur-xs rounded-xl border border-border/60 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder={`Filtrar ${entityName.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8.5 text-xs bg-background/80 rounded-lg border-border/60"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-2xs font-mono py-1 px-2.5 rounded-lg border-border/60 bg-muted/30">
            {total} {total === 1 ? "registro" : "registros"}
          </Badge>
          <Button onClick={handleCreate} size="sm" className="h-8.5 text-xs rounded-lg gap-1.5 shadow-xs font-medium">
            <Plus className="h-3.5 w-3.5" />
            Crear {entityName}
          </Button>
        </div>
      </div>

      {/* Table Container with soft borders */}
      <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-xs">
        <ScrollArea className="h-[520px]">
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10 border-b border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold text-xs text-foreground/80 py-3">Nombre</TableHead>
              {listFields.map(field => (
                <TableHead key={field.name} className="hidden md:table-cell">
                  {field.label}
                </TableHead>
              ))}
              <TableHead className="text-center">Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loadingList ? (
              <TableRow>
                <TableCell colSpan={listFields.length + 3} className="text-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={listFields.length + 3} className="text-center py-8 text-muted-foreground">
                  No se encontraron resultados
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>
                      <p className="truncate max-w-[200px]">{item.name || (item.nombre as string) || (item.title as string) || 'Sin nombre'}</p>
                      {item.slug && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          /{item.slug}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  {listFields.map(field => (
                    <TableCell key={field.name} className="hidden md:table-cell">
                      {renderCellValue(item[field.name], field.type)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center">
                    {item.is_active !== undefined ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(item)}
                        className={item.is_active ? 'text-emerald-600' : 'text-muted-foreground'}
                      >
                        {item.is_active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(item)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>

      {/* Modern Soft Pagination */}
      <div className="flex items-center justify-between px-2 py-1 text-xs">
        <p className="text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{items.length}</span> de <span className="font-semibold text-foreground">{total}</span> registros totales
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="h-8 rounded-lg border-border/60 hover:bg-muted/60"
          >
            <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Anterior
          </Button>
          <span className="text-xs font-mono px-2 py-1 rounded bg-muted/40 text-muted-foreground border border-border/40">
            {page + 1} / {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
            className="h-8 rounded-lg border-border/60 hover:bg-muted/60"
          >
            Siguiente <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </div>

      {/* Form Dialog */}
      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editingItem ? `Editar ${entityName}` : `Nuevo ${entityName}`}
        entity={entity}
        fields={fields}
        initialData={editingItem || undefined}
        onSubmit={handleFormSubmit}
        loading={loading}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente "{itemToDelete?.name || (itemToDelete?.nombre as string) || (itemToDelete?.title as string)}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function renderCellValue(value: unknown, type: string): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  if (type === 'boolean') {
    return value ? (
      <Badge variant="default">Sí</Badge>
    ) : (
      <Badge variant="secondary">No</Badge>
    );
  }

  if (type === 'array' && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {value.slice(0, 2).map((v, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {String(v)}
          </Badge>
        ))}
        {value.length > 2 && (
          <Badge variant="secondary" className="text-xs">
            +{value.length - 2}
          </Badge>
        )}
      </div>
    );
  }

  if (type === 'number' && typeof value === 'number') {
    return value.toLocaleString();
  }

  return <span className="truncate max-w-[150px] block">{String(value)}</span>;
}
