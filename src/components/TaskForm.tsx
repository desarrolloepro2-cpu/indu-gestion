import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle } from 'lucide-react';

interface TaskFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const TaskForm: React.FC<TaskFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    habilitado: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (initialData?.id) {
      result = await supabase.from('tareas').update(formData).eq('id', initialData.id);
    } else {
      result = await supabase.from('tareas').insert([formData]);
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
            {initialData ? 'Editar' : 'Nueva'} Tarea Principal
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Catálogo de actividades globales del sistema
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
          <label className="input-label">Nombre de la Tarea *</label>
          <input 
            name="nombre" 
            className="neon-input" 
            value={formData.nombre} 
            onChange={handleChange} 
            required 
            placeholder="Ej: Mantenimiento Preventivo" 
          />
        </div>
        
        <div className="input-group">
          <label className="input-label">Descripción</label>
          <textarea 
            name="descripcion" 
            className="neon-input" 
            style={{ minHeight: '100px', resize: 'vertical' }} 
            value={formData.descripcion} 
            onChange={handleChange} 
            placeholder="Describe el grupo de tareas..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="checkbox" 
            name="habilitado" 
            id="task-habilitado"
            checked={formData.habilitado} 
            onChange={handleChange} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} 
          />
          <label htmlFor="task-habilitado" className="input-label" style={{ marginBottom: 0 }}>Habilitado</label>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 2, height: '54px', fontSize: '1rem', fontWeight: 800 }} disabled={loading}>
            {loading ? 'Procesando...' : initialData ? 'Actualizar Tarea' : 'Registrar Tarea'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
