import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle, ImageIcon } from 'lucide-react';
import { IconPicker } from './DynamicIcon';

interface GroupFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const GroupForm: React.FC<GroupFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_grupo: '',
    descripcion: '',
    habilitado: true,
    icono_nombre: 'Layers'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_grupo: initialData.nombre_grupo || '',
        descripcion: initialData.descripcion || '',
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true,
        icono_nombre: initialData.icono_nombre || 'Layers'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (initialData?.id) {
      result = await supabase.from('grupos_trabajo').update(formData).eq('id', initialData.id);
    } else {
      result = await supabase.from('grupos_trabajo').insert([formData]);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            {initialData ? 'Editar' : 'Nuevo'} Grupo de Trabajo
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Organización de equipos y unidades funcionales
          </p>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '12px', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={20} />
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Nombre del Grupo *</label>
          <input name="nombre_grupo" className="neon-input" value={formData.nombre_grupo} onChange={handleChange} required placeholder="Ej: Automatización" />
        </div>
        
        <div className="input-group">
          <label className="input-label">Descripción</label>
          <textarea 
            name="descripcion" 
            className="neon-input" 
            style={{ minHeight: '100px', resize: 'vertical' }} 
            value={formData.descripcion} 
            onChange={handleChange} 
            placeholder="Esta es la descripción del grupo..."
          />
        </div>

        <div className="input-group">
          <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ImageIcon size={16} /> Seleccionar Icono Representativo
          </label>
          <IconPicker 
            selectedIcon={formData.icono_nombre} 
            onSelect={(name) => setFormData(prev => ({ ...prev, icono_nombre: name }))} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="checkbox" 
            name="habilitado" 
            id="group-habilitado"
            checked={formData.habilitado} 
            onChange={handleChange} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} 
          />
          <label htmlFor="group-habilitado" className="input-label" style={{ marginBottom: 0 }}>Habilitado</label>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 2, height: '54px', fontSize: '1rem', fontWeight: 800 }} disabled={loading}>
            {loading ? 'Procesando...' : initialData ? 'Actualizar Grupo' : 'Registrar Grupo'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupForm;
