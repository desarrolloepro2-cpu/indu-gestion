import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle, DollarSign } from 'lucide-react';

interface JobFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const JobForm: React.FC<JobFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_cargo: '',
    sigla_cargo: '',
    descripcion_cargo: '',
    salario_cargo: '',
    aprobado: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_cargo: initialData.nombre_cargo || '',
        sigla_cargo: initialData.sigla_cargo || '',
        descripcion_cargo: initialData.descripcion_cargo || '',
        salario_cargo: initialData.salario_cargo?.toString() || '',
        aprobado: true // Always true for new or existing when editing to ensure it remains enabled
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Convert salario to number
    const numericSalario = parseFloat(formData.salario_cargo.replace(/[^0-9.]/g, ''));

    const payload = {
      ...formData,
      salario_cargo: numericSalario,
      aprobado: true // Ensure it's active
    };

    let result;
    if (initialData?.id) {
      result = await supabase.from('cargos').update(payload).eq('id', initialData.id);
    } else {
      result = await supabase.from('cargos').insert([payload]);
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
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nuevo Cargo Operativo</h2>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label">Nombre del Cargo *</label>
            <input name="nombre_cargo" className="neon-input" value={formData.nombre_cargo} onChange={handleChange} required placeholder="Ej: Ingeniero Proyectos" />
          </div>
          <div className="input-group">
            <label className="input-label">Sigla</label>
            <input name="sigla_cargo" className="neon-input" value={formData.sigla_cargo} onChange={handleChange} placeholder="IP" />
          </div>
        </div>
        
        <div className="input-group">
          <label className="input-label">Descripción del Cargo *</label>
          <textarea 
            name="descripcion_cargo" 
            className="neon-input" 
            style={{ minHeight: '80px', resize: 'vertical' }} 
            value={formData.descripcion_cargo} 
            onChange={handleChange} 
            required
            placeholder="Ej: Ingeniero ejecutor de los proyectos..."
          />
        </div>

        <div className="input-group">
          <label className="input-label">Salario Base *</label>
          <div style={{ position: 'relative' }}>
            <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              name="salario_cargo" 
              className="neon-input" 
              style={{ paddingLeft: '35px' }}
              value={formData.salario_cargo} 
              onChange={handleChange} 
              required 
              placeholder="2.900.500"
            />
          </div>
        </div>


        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Procesando...' : 'Crear Cargo'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobForm;
