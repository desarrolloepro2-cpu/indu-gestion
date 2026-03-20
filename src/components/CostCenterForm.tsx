import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle, ImageIcon } from 'lucide-react';
import { IconPicker } from './DynamicIcon';

interface CostCenterFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const CostCenterForm: React.FC<CostCenterFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre_centro: '',
    descripcion: '',
    habilitado: true,
    presupuesto: 0,
    horas_ingenieria: 0,
    horas_tecnicos: 0,
    horas_siso: 0,
    horas_otros: 0,
    icono_nombre: 'Database'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        codigo: initialData.codigo || '',
        nombre_centro: initialData.nombre_centro || '',
        descripcion: initialData.descripcion || '',
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true,
        presupuesto: initialData.presupuesto || 0,
        horas_ingenieria: initialData.horas_ingenieria || 0,
        horas_tecnicos: initialData.horas_tecnicos || 0,
        horas_siso: initialData.horas_siso || 0,
        horas_otros: initialData.horas_otros || 0,
        icono_nombre: initialData.icono_nombre || 'Database'
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (initialData?.id) {
      result = await supabase.from('centros_costos').update(formData).eq('id', initialData.id);
    } else {
      result = await supabase.from('centros_costos').insert([formData]);
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
            {initialData ? 'Actualizar Centro de Costos' : 'Nuevo Centro de Costos'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configuración de unidades operativas y presupuesto
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
          <label className="input-label">Código (ej: AU-43625) *</label>
          <input name="codigo" className="neon-input" value={formData.codigo} onChange={handleChange} required placeholder="AU-XXXXX" />
        </div>
        
        <div className="input-group">
          <label className="input-label">Nombre del Centro (ej: Cambio zapatas...) *</label>
          <input name="nombre_centro" className="neon-input" value={formData.nombre_centro} onChange={handleChange} required />
        </div>

        <div className="input-group">
          <label className="input-label">Descripción</label>
          <textarea 
            name="descripcion" 
            className="neon-input" 
            style={{ minHeight: '80px', resize: 'vertical' }} 
            value={formData.descripcion} 
            onChange={handleChange} 
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="input-group">
            <label className="input-label">Presupuesto (Moneda Local) *</label>
            <input 
              name="presupuesto" 
              type="number" 
              className="neon-input" 
              value={formData.presupuesto} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Horas Ingeniería</label>
            <input 
              name="horas_ingenieria" 
              type="number" 
              className="neon-input" 
              value={formData.horas_ingenieria} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="input-group">
            <label className="input-label">Horas Técnicos</label>
            <input 
              name="horas_tecnicos" 
              type="number" 
              className="neon-input" 
              value={formData.horas_tecnicos} 
              onChange={handleChange} 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Horas SISO</label>
            <input 
              name="horas_siso" 
              type="number" 
              className="neon-input" 
              value={formData.horas_siso} 
              onChange={handleChange} 
            />
          </div>
          <div className="input-group">
            <label className="input-label">Horas Otros</label>
            <input 
              name="horas_otros" 
              type="number" 
              className="neon-input" 
              value={formData.horas_otros} 
              onChange={handleChange} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="checkbox" 
            name="habilitado" 
            id="cc-habilitado"
            checked={formData.habilitado} 
            onChange={handleChange} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} 
          />
          <label htmlFor="cc-habilitado" className="input-label" style={{ marginBottom: 0 }}>Habilitado para uso</label>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 2, height: '54px', fontSize: '1rem', fontWeight: 800 }} disabled={loading}>
            {loading ? 'Procesando...' : initialData ? 'Actualizar Centro' : 'Registrar Centro'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CostCenterForm;
