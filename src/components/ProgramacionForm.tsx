import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle } from 'lucide-react';
import SearchableSelect from './SearchableSelect';

interface ProgramacionFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}


const ProgramacionForm: React.FC<ProgramacionFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fixed Column Mappings: Tables use 'nombre' instead of 'nombre_tarea/detalle'
  const [detTareas, setDetTareas] = useState<any[]>([]);
  const [options, setOptions] = useState<{
    cc: any[],
    tasks: any[],
    details: any[],
    emps: any[],
    shifts: any[]
  }>({ cc: [], tasks: [], details: [], emps: [], shifts: [] });

  const [formData, setFormData] = useState({
    id_centro_costo: '',
    id_tarea: '',
    id_detalle_tarea: '',
    id_responsable: '',
    id_supervisor: '',
    horas: 0,
    id_turno: '',
    porcentaje_ejecucion: 0,
    habilitado: true
  });

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id_centro_costo: initialData.id_centro_costo || '',
        id_tarea: initialData.id_tarea || '',
        id_detalle_tarea: initialData.id_detalle_tarea || '',
        id_responsable: initialData.id_responsable || '',
        id_supervisor: initialData.id_supervisor || '',
        horas: initialData.horas || 0,
        id_turno: initialData.id_turno || '',
        porcentaje_ejecucion: initialData.porcentaje_ejecucion || 0,
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true
      });
    }
  }, [initialData]);

  // Refined dependency logic for details
  useEffect(() => {
    if (formData.id_tarea) {
      const filtered = detTareas
        .filter(d => d.id_tarea?.toString() === formData.id_tarea?.toString())
        .map(d => ({ id: d.id, label: d.nombre })); // Correct column is 'nombre'
      
      setOptions(prev => ({ ...prev, details: filtered }));

      // Reset detail only if it's no longer valid for the set task
      if (!filtered.find(f => f.id.toString() === formData.id_detalle_tarea?.toString())) {
        setFormData(prev => ({ ...prev, id_detalle_tarea: '' }));
      }
    } else {
      setOptions(prev => ({ ...prev, details: [] }));
      setFormData(prev => ({ ...prev, id_detalle_tarea: '' }));
    }
  }, [formData.id_tarea, detTareas]);

  const loadLookups = async () => {
    const [cc, t, dt, e, tu] = await Promise.all([
      supabase.from('centros_costos').select('*').eq('habilitado', true).order('codigo'),
      supabase.from('tareas').select('*').eq('habilitado', true).order('nombre'), 
      supabase.from('det_tareas').select('*').eq('habilitado', true).order('nombre'), 
      supabase.from('empleados').select('*').eq('esta_activo', true).order('primer_nombre'),
      supabase.from('turnos').select('*').order('nombre_turno') // 'habilitado' doesn't exist here
    ]);

    if (cc.data) {
      setOptions(prev => ({ ...prev, cc: cc.data.map(i => ({ id: i.id, label: `${i.codigo} - ${i.nombre_centro}` })) }));
    }
    if (t.data) {
      setOptions(prev => ({ ...prev, tasks: t.data.map(i => ({ id: i.id, label: i.nombre })) }));
    }
    if (dt.data) setDetTareas(dt.data);
    if (e.data) {
      const empOpts = e.data.map(i => ({ 
        id: i.id, 
        label: `${i.primer_nombre} ${i.primer_apellido}`,
        image: i.foto_url 
      }));
      setOptions(prev => ({ ...prev, emps: empOpts }));
    }
    if (tu.data) {
      setOptions(prev => ({ ...prev, shifts: tu.data.map(i => ({ id: i.id, label: i.nombre_turno })) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.id_centro_costo || !formData.id_tarea || !formData.id_detalle_tarea || !formData.id_responsable || !formData.id_supervisor || !formData.id_turno) {
      setError('Por favor complete todos los campos obligatorios marcados con *');
      setLoading(false);
      return;
    }

    const payload = {
      ...formData,
      id_centro_costo: formData.id_centro_costo || null,
      id_tarea: formData.id_tarea || null,
      id_detalle_tarea: formData.id_detalle_tarea || null,
      id_responsable: formData.id_responsable || null,
      id_supervisor: formData.id_supervisor || null,
      id_turno: formData.id_turno || null,
    };

    let result;
    if (initialData?.id) {
      result = await supabase.from('programacion').update(payload).eq('id', initialData.id);
    } else {
      result = await supabase.from('programacion').insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  const handleManualChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value)
    }));
  };

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            {initialData ? 'Actualización Operativa' : 'Asignación de Actividad'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Planificación logística y despliegue de personal táctico
          </p>
        </div>
        <button 
          onClick={onClose} 
          style={{ 
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '10px',
            borderRadius: '12px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
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

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div style={{ gridColumn: 'span 2' }}>
          <SearchableSelect 
            label="Centro de Costos Operativo" 
            options={options.cc} 
            value={formData.id_centro_costo} 
            onChange={(val: any) => handleManualChange('id_centro_costo', val)}
            placeholder="Escriba código o nombre de unidad operativa..."
            required
          />
        </div>

        <SearchableSelect 
          label="Actividad Maestro" 
          options={options.tasks} 
          value={formData.id_tarea} 
          onChange={(val: any) => handleManualChange('id_tarea', val)}
          placeholder="Seleccionar línea de trabajo..."
          required
        />

        <SearchableSelect 
          label="Detalle Técnico" 
          options={options.details} 
          value={formData.id_detalle_tarea} 
          onChange={(val: any) => handleManualChange('id_detalle_tarea', val)}
          placeholder={formData.id_tarea ? "Asignar subtarea específica..." : "Requiere actividad maestro"}
          disabled={!formData.id_tarea}
          required
        />

        <SearchableSelect 
          label="Responsable de Ejecución" 
          options={options.emps} 
          value={formData.id_responsable} 
          onChange={(val: any) => handleManualChange('id_responsable', val)}
          placeholder="Buscar personal por nombre..."
          required
        />

        <SearchableSelect 
          label="Supervisor Directo" 
          options={options.emps} 
          value={formData.id_supervisor} 
          onChange={(val: any) => handleManualChange('id_supervisor', val)}
          placeholder="Asignar supervisor de turno..."
          required
        />

        <div className="input-group">
          <label className="input-label">Horas Estimadas</label>
          <div style={{ position: 'relative' }}>
            <input name="horas" type="number" className="neon-input" value={formData.horas} onChange={handleInputChange} required min="1" step="0.5" />
            <span style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 700 }}>H-H</span>
          </div>
        </div>

        <SearchableSelect 
          label="Jornada Laboral" 
          options={options.shifts} 
          value={formData.id_turno} 
          onChange={(val: any) => handleManualChange('id_turno', val)}
          placeholder="Definir bloque de tiempo..."
          required
        />

        <div className="input-group" style={{ gridColumn: 'span 2' }}>
          <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Nivel de Avance</span>
            <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{formData.porcentaje_ejecucion}%</span>
          </label>
          <input 
            type="range" 
            name="porcentaje_ejecucion" 
            value={formData.porcentaje_ejecucion} 
            onChange={handleInputChange} 
            min="0" max="100" 
            style={{ 
              width: '100%', 
              height: '6px', 
              appearance: 'none', 
              background: 'rgba(255,255,255,0.05)', 
              borderRadius: '3px',
              outline: 'none',
              cursor: 'pointer'
            }} 
          />
          <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '2px', marginTop: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${formData.porcentaje_ejecucion}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))', boxShadow: '0 0 10px var(--accent-primary)', transition: 'width 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)' }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 212, 255, 0.03)', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
          <input type="checkbox" id="hab-check" checked={formData.habilitado} onChange={(e) => handleManualChange('habilitado', e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
          <label htmlFor="hab-check" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Actividad Habilitada en Sistema</label>
        </div>

        <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', gap: '16px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 2, height: '54px', fontSize: '1rem', fontWeight: 800 }} disabled={loading}>
            {loading ? 'Procesando...' : initialData ? 'Actualizar Programación' : 'Lanzar Programación'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Cancelar
          </button>
        </div>
      </form>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 212, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--accent-primary); }
        .animate-scale-in { animation: scaleIn 0.25s cubic-bezier(0, 0, 0.2, 1); }
        @keyframes scaleIn { from { opacity: 0; transform: translateY(-10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
};

export default ProgramacionForm;
