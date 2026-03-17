import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle } from 'lucide-react';

interface ShiftFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const ShiftForm: React.FC<ShiftFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<any>({
    nombre_turno: '',
    habilitado: true,
    // Lunes
    lunes: false, h_inicio_lun: '07:00', duracion_lun: 8, almuerzo_lun: true,
    // Martes
    martes: false, h_inicio_mar: '07:00', duracion_mar: 8, almuerzo_mar: true,
    // Miercoles
    miercoles: false, h_inicio_mie: '07:00', duracion_mie: 8, almuerzo_mie: true,
    // Jueves
    jueves: false, h_inicio_jue: '07:00', duracion_jue: 8, almuerzo_jue: true,
    // Viernes
    viernes: false, h_inicio_vie: '07:00', duracion_vie: 8, almuerzo_vie: true,
    // Sabado
    sabado: false, h_inicio_sab: '07:00', duracion_sab: 8, almuerzo_sab: false,
    // Domingo
    domingo: false, h_inicio_dom: '07:00', duracion_dom: 8, almuerzo_dom: false,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_turno: initialData.nombre_turno || '',
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true,
        
        lunes: initialData.lunes || false,
        h_inicio_lun: initialData.h_inicio_lun?.substring(0, 5) || '07:00',
        duracion_lun: initialData.duracion_lun ?? 8,
        almuerzo_lun: initialData.almuerzo_lun ?? true,
        
        martes: initialData.martes || false,
        h_inicio_mar: initialData.h_inicio_mar?.substring(0, 5) || '07:00',
        duracion_mar: initialData.duracion_mar ?? 8,
        almuerzo_mar: initialData.almuerzo_mar ?? true,
        
        miercoles: initialData.miercoles || false,
        h_inicio_mie: initialData.h_inicio_mie?.substring(0, 5) || '07:00',
        duracion_mie: initialData.duracion_mie ?? 8,
        almuerzo_mie: initialData.almuerzo_mie ?? true,
        
        jueves: initialData.jueves || false,
        h_inicio_jue: initialData.h_inicio_jue?.substring(0, 5) || '07:00',
        duracion_jue: initialData.duracion_jue ?? 8,
        almuerzo_jue: initialData.almuerzo_jue ?? true,
        
        viernes: initialData.viernes || false,
        h_inicio_vie: initialData.h_inicio_vie?.substring(0, 5) || '07:00',
        duracion_vie: initialData.duracion_vie ?? 8,
        almuerzo_vie: initialData.almuerzo_vie ?? true,
        
        sabado: initialData.sabado || false,
        h_inicio_sab: initialData.h_inicio_sab?.substring(0, 5) || '07:00',
        duracion_sab: initialData.duracion_sab ?? 8,
        almuerzo_sab: initialData.almuerzo_sab ?? false,
        
        domingo: initialData.domingo || false,
        h_inicio_dom: initialData.h_inicio_dom?.substring(0, 5) || '07:00',
        duracion_dom: initialData.duracion_dom ?? 8,
        almuerzo_dom: initialData.almuerzo_dom ?? false,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Preprocesar horas globales temporales basadas en los días activos para retrocompatibilidad
    let minStartTime = '23:59';
    let maxEndTime = '00:00';
    let anyDayEnabled = false;

    // Calcular hora de fin general para mantener compatibilidad con otras vistas
    const daysArr = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom'];
    const dbDaysArr = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

    daysArr.forEach((key, index) => {
      if (formData[dbDaysArr[index]]) {
        anyDayEnabled = true;
        const start = formData[`h_inicio_${key}`];
        if (start < minStartTime) minStartTime = start;
        
        const [h, m] = start.split(':').map(Number);
        const dur = formData[`duracion_${key}`];
        const hasAlmuerzo = formData[`almuerzo_${key}`];
        
        let endH = h + dur + (hasAlmuerzo ? 1 : 0);
        let endM = m;
        // Limitar a máximo 23:59 o dejar pasar el reloj si prefieres, usualmente Supabase maneja TIME.
        if (endH >= 24) endH -= 24;
        
        const endStr = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
        if (endStr > maxEndTime || endH < parseInt(start.split(':')[0])) { // Cruce de medianoche
          maxEndTime = endStr;
        }
      }
    });

    const payload = {
      ...formData,
      // Retrocompatibilidad
      hora_inicio: anyDayEnabled ? minStartTime : '00:00',
      hora_fin: anyDayEnabled ? maxEndTime : '00:00',
      hab_hora_almuerzo: formData.almuerzo_lun, // as default fallback
    };

    let result;
    if (initialData?.id) {
      result = await supabase.from('turnos').update(payload).eq('id', initialData.id);
    } else {
      result = await supabase.from('turnos').insert([payload]);
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  const daysConfig = [
    { key: 'lun', label: 'LUN', db_day: 'lunes' },
    { key: 'mar', label: 'MAR', db_day: 'martes' },
    { key: 'mie', label: 'MIÉRCOLES', db_day: 'miercoles' },
    { key: 'jue', label: 'JUEVES', db_day: 'jueves' },
    { key: 'vie', label: 'VIERNES', db_day: 'viernes' },
    { key: 'sab', label: 'SÁBADO', db_day: 'sabado' },
    { key: 'dom', label: 'DOMINGO', db_day: 'domingo' },
  ];

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{initialData ? 'Editar Turno' : 'Nuevo Turno'}</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </header>

      {error && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginBottom: '30px' }}>
          <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
            <label className="input-label" style={{ fontWeight: 800, letterSpacing: '1px', fontSize: '0.8rem' }}>NOMBRE DEL TURNO *</label>
            <input 
              name="nombre_turno" 
              className="neon-input" 
              value={formData.nombre_turno} 
              onChange={handleChange} 
              required 
              placeholder="Ej: Turno Administrativo"
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '52px', marginTop: '22px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-secondary)', letterSpacing: '1px' }}>HABILITADO</span>
            <input 
              type="checkbox" 
              name="habilitado" 
              checked={formData.habilitado} 
              onChange={handleChange}
              style={{ width: '22px', height: '22px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
          </div>
        </div>

        <div style={{ 
          background: 'rgba(255, 255, 255, 0.02)', 
          border: '1px solid rgba(255, 255, 255, 0.05)', 
          borderRadius: '16px', 
          padding: '24px',
          marginBottom: '30px',
          overflowX: 'auto'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '15px', minWidth: '700px' }}>
            {daysConfig.map(day => (
              <div key={day.key} style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                
                {/* Checkbox principal del Día */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 800, color: formData[day.db_day] ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{day.label}</span>
                  <input 
                    type="checkbox" 
                    name={day.db_day} 
                    checked={formData[day.db_day]} 
                    onChange={handleChange}
                    style={{ width: '24px', height: '24px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                  />
                </div>

                {/* Contenedores que se inhabilitan visualmente si el día no está activo */}
                <div style={{ opacity: formData[day.db_day] ? 1 : 0.3, transition: 'opacity 0.2s', width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  {/* Hora de Inicio */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>H INICIO</span>
                    <input 
                      type="time" 
                      name={`h_inicio_${day.key}`} 
                      className="neon-input" 
                      value={formData[`h_inicio_${day.key}`]} 
                      onChange={handleChange} 
                      disabled={!formData[day.db_day]}
                      required={formData[day.db_day]}
                      style={{ padding: '8px', fontSize: '0.9rem', textAlign: 'center' }}
                    />
                  </div>

                  {/* Duración */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>DURACIÓN</span>
                    <div style={{ position: 'relative' }}>
                      <input 
                        type="number" 
                        name={`duracion_${day.key}`} 
                        className="neon-input" 
                        value={formData[`duracion_${day.key}`]} 
                        onChange={handleChange} 
                        disabled={!formData[day.db_day]}
                        required={formData[day.db_day]}
                        min="1" max="24"
                        style={{ padding: '8px', paddingRight: '25px', fontSize: '0.9rem', textAlign: 'center' }}
                      />
                      <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>h</span>
                    </div>
                  </div>

                  {/* Almuerzo */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'center' }}>ALMUERZO</span>
                    <input 
                      type="checkbox" 
                      name={`almuerzo_${day.key}`} 
                      checked={formData[`almuerzo_${day.key}`]} 
                      onChange={handleChange}
                      disabled={!formData[day.db_day]}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)', cursor: formData[day.db_day] ? 'pointer' : 'not-allowed' }}
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 1, height: '52px', fontWeight: 800, fontSize: '1rem', background: 'linear-gradient(45deg, var(--accent-primary), #00d4ff)' }} disabled={loading}>
            {loading ? 'Procesando...' : initialData ? 'ACTUALIZAR TURNO' : 'CREAR TURNO'}
          </button>
          <button type="button" onClick={onClose} style={{ 
            width: '120px',
            background: 'var(--surface-color)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: 700
          }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShiftForm;
