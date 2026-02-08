import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Save } from 'lucide-react';

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
  fields: FieldConfig[];
  initialData?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  loading?: boolean;
}

export function EntityFormDialog({
  open,
  onOpenChange,
  title,
  fields,
  initialData,
  onSubmit,
  loading = false
}: EntityFormDialogProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData, open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

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
          <ScrollArea className="h-[60vh] pr-4">
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
