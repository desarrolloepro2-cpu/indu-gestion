import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle } from 'lucide-react';

interface TaskDetailFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const TaskDetailForm: React.FC<TaskDetailFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    id_tarea: '',
    nombre: '',
    descripcion: '',
    habilitado: true
  });

  useEffect(() => {
    fetchTasks();
    if (initialData) {
      setFormData({
        id_tarea: initialData.id_tarea || '',
        nombre: initialData.nombre || '',
        descripcion: initialData.descripcion || '',
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true
      });
    }
  }, [initialData]);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tareas').select('id, nombre').eq('habilitado', true);
    setTasks(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (initialData?.id) {
      result = await supabase.from('det_tareas').update(formData).eq('id', initialData.id);
    } else {
      result = await supabase.from('det_tareas').insert([formData]);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{initialData ? 'Editar' : 'Nueva'} Subtarea Detallada</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Grupo de Tarea *</label>
          <select 
            name="id_tarea" 
            className="neon-input" 
            value={formData.id_tarea} 
            onChange={handleChange} 
            required
          >
            <option value="">Seleccione un grupo...</option>
            {tasks.map(t => (
              <option key={t.id} value={t.id}>{t.nombre}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="input-label">Nombre de la Subtarea *</label>
          <input 
            name="nombre" 
            className="neon-input" 
            value={formData.nombre} 
            onChange={handleChange} 
            required 
            placeholder="Ej: Revisión de Motores" 
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
            placeholder="Describe la subtarea técnica..."
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="checkbox" 
            name="habilitado" 
            id="det-task-habilitado"
            checked={formData.habilitado} 
            onChange={handleChange} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} 
          />
          <label htmlFor="det-task-habilitado" className="input-label" style={{ marginBottom: 0 }}>Habilitada</label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Guardando...' : initialData ? 'Actualizar Subtarea' : 'Registrar Subtarea'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskDetailForm;
