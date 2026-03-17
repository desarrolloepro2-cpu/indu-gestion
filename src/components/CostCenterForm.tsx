import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle } from 'lucide-react';

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
    horas_otros: 0
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
        horas_otros: initialData.horas_otros || 0
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
    <div>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Nuevo Centro de Costos</h2>
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

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Guardando...' : 'Registrar Centro'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default CostCenterForm;
