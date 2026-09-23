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

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'url' | 'email' | 'date' | 'time';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Buscar ${entityName.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo {entityName}
        </Button>
      </div>

      {/* Table */}
      <ScrollArea className="h-[500px] border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
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

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {items.length} de {total} resultados
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
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
