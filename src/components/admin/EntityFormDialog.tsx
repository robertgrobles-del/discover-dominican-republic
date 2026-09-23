import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { type EntityType } from '@/hooks/useAdminEntities';

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'array' | 'url' | 'email' | 'date' | 'time';
  required?: boolean;
  placeholder?: string;
}

interface EntityFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entity: EntityType;
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>, translations: Record<string, Record<string, string>>) => Promise<void>;
  loading?: boolean;
}

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  entity,
  fields,
  initialData,
  onSubmit,
  loading = false
}: EntityFormDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});
  const [activeLang, setActiveLang] = useState<string>('es');
  const [translationsData, setTranslationsData] = useState<Record<string, Record<string, string>>>({});
  const [loadingTranslations, setLoadingTranslations] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, open]);

  useEffect(() => {
    const loadTranslations = async () => {
      if (open && initialData?.id && entity) {
        setLoadingTranslations(true);
        try {
          const { data, error } = await supabase
            .from('entity_translations')
            .select('language, field_name, translation_text')
            .eq('entity_type', entity)
            .eq('entity_id', initialData.id);
            
          if (!error && data) {
            const trans: Record<string, Record<string, string>> = {};
            data.forEach(row => {
              if (!trans[row.language]) {
                trans[row.language] = {};
              }
              trans[row.language][row.field_name] = row.translation_text;
            });
            setTranslationsData(trans);
          }
        } catch (err) {
          console.error('Error loading translations:', err);
        } finally {
          setLoadingTranslations(false);
        }
      } else {
        setTranslationsData({});
        setActiveLang('es');
      }
    };
    loadTranslations();
  }, [open, initialData, entity]);

  const handleChange = (name: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: string, value: string) => {
    const arrayValue = value.split('|').map(v => v.trim()).filter(v => v);
    setFormData(prev => ({ ...prev, [name]: arrayValue }));
  };

  const getArrayValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      return value.join(' | ');
    }
    return '';
  };

  const handleTranslationChange = (lang: string, fieldName: string, value: string) => {
    setTranslationsData(prev => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [fieldName]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData, translationsData);
  };

  const translatableFields = fields.filter(f => 
    (f.type === 'text' || f.type === 'textarea') && 
    !['slug', 'id', 'created_at', 'updated_at', 'email', 'phone', 'website', 'avatar_url', 'image_url', 'gallery'].includes(f.name)
  );

  const renderField = (field: FieldConfig) => {
    const value = formData[field.name];

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id={field.name}
              checked={(value as boolean) || false}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <Label htmlFor={field.name} className="text-sm text-muted-foreground">
              {value ? 'Sí' : 'No'}
            </Label>
          </div>
        );

      case 'array':
        return (
          <div className="space-y-1">
            <Input
              id={field.name}
              value={getArrayValue(value)}
              onChange={(e) => handleArrayChange(field.name, e.target.value)}
              placeholder={field.placeholder || 'Valor1 | Valor2 | Valor3'}
            />
            <p className="text-xs text-muted-foreground">Separa los valores con |</p>
          </div>
        );

      case 'number':
        return (
          <Input
            id={field.name}
            type="number"
            value={(value as number) || ''}
            onChange={(e) => handleChange(field.name, e.target.value ? parseFloat(e.target.value) : null)}
            placeholder={field.placeholder}
            step="any"
          />
        );

      case 'date':
        return (
          <Input
            id={field.name}
            type="date"
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      case 'time':
        return (
          <Input
            id={field.name}
            type="time"
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
          />
        );

      default:
        return (
          <Input
            id={field.name}
            type={field.type}
            value={(value as string) || ''}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          {/* Idioma Selector Tabs */}
          <div className="flex border-b mb-4 overflow-x-auto gap-2">
            {[
              { code: 'es', name: 'Español (Base)' },
              { code: 'en', name: 'Inglés (EN)' },
              { code: 'fr', name: 'Francés (FR)' },
              { code: 'it', name: 'Italiano (IT)' },
              { code: 'pt', name: 'Portugués (PT)' }
            ].map(lang => (
              <button
                key={lang.code}
                type="button"
                className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${
                  activeLang === lang.code 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setActiveLang(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <ScrollArea className="h-[60vh] pr-4">
            {activeLang === 'es' ? (
              <div className="grid gap-4 py-4">
                {fields.map((field) => (
                  <div key={field.name} className="grid gap-2">
                    <Label htmlFor={field.name} className="flex items-center gap-1">
                      {field.label}
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ) : loadingTranslations ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-xs">Cargando traducciones...</span>
              </div>
            ) : translatableFields.length > 0 ? (
              <div className="grid gap-4 py-4">
                {translatableFields.map((field) => {
                  const baseValue = (formData[field.name] as string) || '';
                  const translationValue = translationsData[activeLang]?.[field.name] || '';
                  return (
                    <div key={field.name} className="grid gap-2 border-b border-border/40 pb-4 last:border-0 last:pb-0">
                      <Label htmlFor={`trans-${field.name}`} className="font-bold flex items-center gap-1">
                        {field.label} ({activeLang.toUpperCase()})
                      </Label>
                      {baseValue && (
                        <div className="p-3 rounded-lg bg-secondary/15 border text-xs text-muted-foreground leading-relaxed">
                          <strong>Original (Español):</strong> {baseValue}
                        </div>
                      )}
                      {field.type === 'textarea' ? (
                        <Textarea
                          id={`trans-${field.name}`}
                          value={translationValue}
                          onChange={(e) => handleTranslationChange(activeLang, field.name, e.target.value)}
                          placeholder="Escribe la traducción aquí..."
                          rows={4}
                        />
                      ) : (
                        <Input
                          id={`trans-${field.name}`}
                          value={translationValue}
                          onChange={(e) => handleTranslationChange(activeLang, field.name, e.target.value)}
                          placeholder="Escribe la traducción aquí..."
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No hay campos de texto traducibles para este tipo de contenido.
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
