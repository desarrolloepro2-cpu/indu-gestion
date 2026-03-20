import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { X, Calendar, Clock, ListTodo, Search, Check, ChevronDown } from 'lucide-react';

// Reusable Searchable Select Component with Enhanced UI
const SearchableSelect = ({ label, options, value, onChange, placeholder, disabled = false, required = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt: any) => opt.id?.toString() === value?.toString());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt: any) => 
    opt.label?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="input-group" style={{ position: 'relative' }} ref={dropdownRef}>
      <label className="input-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontWeight: 600 }}>{label} {required && <span style={{ color: 'var(--accent-primary)' }}>*</span>}</span>
        {selectedOption && <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', opacity: 0.8, fontWeight: 700 }}>VERIFICADO</span>}
      </label>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`neon-input ${disabled ? 'disabled' : ''} ${isOpen ? 'active' : ''}`}
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          minHeight: '52px',
          padding: '0 16px',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.02)',
          border: isOpen ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
          <span style={{ 
            color: selectedOption ? 'var(--text-primary)' : 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            fontSize: '0.95rem',
            fontWeight: selectedOption ? 600 : 400
          }}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown size={18} style={{ 
          color: 'var(--text-secondary)',
          transform: isOpen ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
        }} />
      </div>

      {isOpen && (
        <div className="glass-card animate-scale-in" style={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          marginTop: '8px',
          maxHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          overflow: 'hidden'
        }}>
          <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(0,0,0,0.4)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--accent-primary)', opacity: 0.6 }} />
              <input 
                autoFocus
                className="neon-input" 
                placeholder="Filtrar opciones..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '40px', 
                  height: '42px', 
                  fontSize: '0.9rem', 
                  backgroundColor: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <div style={{ overflowY: 'auto', padding: '8px' }} className="custom-scrollbar">
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '30px', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', opacity: 0.5 }}>
                <Search size={32} style={{ marginBottom: '10px', opacity: 0.2 }} />
                <p>Sin resultados disponibles</p>
              </div>
            ) : (
              filteredOptions.map((opt: any) => (
                <div 
                  key={opt.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(opt.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{ 
                    padding: '10px 14px', 
                    cursor: 'pointer', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: value?.toString() === opt.id.toString() ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                    transition: 'all 0.2s ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value?.toString() === opt.id.toString() ? 'rgba(0, 212, 255, 0.1)' : 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: value?.toString() === opt.id.toString() ? 'var(--accent-primary)' : 'var(--text-primary)',
                      fontWeight: value?.toString() === opt.id.toString() ? '700' : '500',
                      fontSize: '0.9rem'
                    }}>{opt.label}</div>
                  </div>
                  {value?.toString() === opt.id.toString() && <Check size={16} style={{ color: 'var(--accent-primary)' }} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface ActivityLogFormProps {
  log?: any;
  onSave: () => void;
  onCancel: () => void;
  currentUser: any;
}

const ActivityLogForm: React.FC<ActivityLogFormProps> = ({ log, onSave, onCancel, currentUser }) => {
  // Helper to format date for datetime-local input correctly (accounting for local timezone)
  const formatDateForInput = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    centro_costo_id: log?.centro_costo_id || '',
    programacion_id: log?.programacion_id || '',
    tarea_id: log?.tarea_id || '',
    det_tarea_id: log?.det_tarea_id || '',
    turno_id: log?.turno_id || '',
    fecha_inicio: formatDateForInput(log?.fecha_inicio),
    fecha_fin: formatDateForInput(log?.fecha_fin),
    observacion: log?.observacion || '',
    aprobado: log?.aprobado || false,
  });

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState<{
    cc: any[],
    programaciones: any[],
    tareas: any[],
    turnos: any[]
  }>({ cc: [], programaciones: [], tareas: [], turnos: [] });
  
  const [detTareas, setDetTareas] = useState<any[]>([]);
  const [detTareasOptions, setDetTareasOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchOptions();
    fetchAllDetTareas();
  }, []);

  useEffect(() => {
    if (!formData.tarea_id) {
      setDetTareasOptions([]);
      setFormData(prev => ({ ...prev, det_tarea_id: '' }));
      return;
    }

    if (detTareas.length === 0) return; // Evitar barrido prematuro durante carga inicial

    const filtered = detTareas
      .filter(dt => dt.id_tarea?.toString() === formData.tarea_id?.toString())
      .map(dt => ({ id: dt.id, label: dt.nombre }));
    
    setDetTareasOptions(filtered);

    setFormData(prev => {
      // Solo resetear si ya hay un valor y el nuevo listado filtrado no lo contiene
      if (prev.det_tarea_id && !filtered.find(f => f.id?.toString() === prev.det_tarea_id?.toString())) {
        return { ...prev, det_tarea_id: '' };
      }
      return prev;
    });
  }, [formData.tarea_id, detTareas]);

  const fetchOptions = async () => {
    const roleName = currentUser?.role_name?.toLowerCase() || '';
    const isAdmin = ['administrador', 'superadmin'].includes(roleName);
    const isSupervisor = roleName === 'supervisor';

    let progQuery = supabase.from('programacion').select(`
      id, 
      serial, 
      id_centro_costo, 
      id_tarea, 
      id_detalle_tarea, 
      id_turno, 
      id_supervisor, 
      id_responsable,
      tareas ( nombre )
    `);
    
    if (!isAdmin) {
      if (isSupervisor) {
        progQuery = progQuery.or(`id_responsable.eq.${currentUser.id},id_supervisor.eq.${currentUser.id}`);
      } else {
        progQuery = progQuery.eq('id_responsable', currentUser.id);
      }
    }

    const [
      { data: cc }, 
      { data: prog }, 
      { data: tar }, 
      { data: tur }
    ] = await Promise.all([
      supabase.from('centros_costos').select('id, codigo, nombre_centro').eq('habilitado', true),
      progQuery,
      supabase.from('tareas').select('id, nombre').eq('habilitado', true),
      supabase.from('turnos').select('*').eq('habilitado', true)
    ]);
    
    setOptions({
      cc: cc ? cc.map(c => ({ id: c.id, label: `${c.codigo} - ${c.nombre_centro}` })) : [],
      programaciones: prog ? prog.map((p: any) => ({ 
        ...p,
        id: p.id, 
        label: `${p.serial || p.id.substring(0,8)} - ${p.tareas?.nombre || 'Sin tarea'}`
      })) : [],
      tareas: tar ? tar.map(t => ({ id: t.id, label: t.nombre })) : [],
      turnos: tur ? tur.map(t => ({ 
        ...t,
        label: `${t.nombre_turno} - Jornada Asignada` 
      })) : []
    });
  };

  const fetchAllDetTareas = async () => {
    const { data } = await supabase.from('det_tareas').select('id, nombre, id_tarea').eq('habilitado', true);
    setDetTareas(data || []);
  };

  const handleProgramacionChange = (val: any) => {
    setFormData(prev => {
      const p = options.programaciones.find(prog => prog.id === val);
      if (p) {
        return {
          ...prev,
          programacion_id: val,
          centro_costo_id: p.id_centro_costo || prev.centro_costo_id,
          tarea_id: p.id_tarea || prev.tarea_id,
          det_tarea_id: p.id_detalle_tarea || prev.det_tarea_id,
          turno_id: p.id_turno || prev.turno_id
        };
      }
      return { ...prev, programacion_id: val };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.programacion_id) {
      alert("Debe seleccionar una Programación de Actividad válida.");
      return;
    }
    if (!formData.observacion.trim()) {
      alert("La observación es obligatoria.");
      return;
    }
    
    setLoading(true);
    
    // Obtener el ID oficial de la sesión para evitar bloqueos por estado estancado del navegador
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Sesión inválida, por favor recargue la página");
      setLoading(false);
      return;
    }

    const payload: any = {
      ejecutor_id: log?.ejecutor_id || user.id,
      centro_costo_id: formData.centro_costo_id || null,
      programacion_id: formData.programacion_id || null,
      tarea_id: formData.tarea_id || null,
      det_tarea_id: formData.det_tarea_id || null,
      turno_id: formData.turno_id || null,
      fecha_inicio: new Date(formData.fecha_inicio).toISOString(),
      fecha_fin: formData.fecha_fin ? new Date(formData.fecha_fin).toISOString() : null,
      observacion: formData.observacion
    };

    // Lógica de auto-aprobación si cumple el horario del turno
    let autoAprobado = false;
    if (formData.turno_id && formData.fecha_inicio && formData.fecha_fin) {
      const turnoSelected = options.turnos.find(t => t.id === formData.turno_id);
      if (turnoSelected && turnoSelected.lunes !== undefined) {
        const startD = new Date(formData.fecha_inicio);
        const endD = new Date(formData.fecha_fin);
        
        if (startD.toDateString() === endD.toDateString()) {
          const dayIndex = startD.getDay();
          const dayKeys = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
          const dbDays = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
          
          const key = dayKeys[dayIndex];
          const dbDay = dbDays[dayIndex];
          
          if (turnoSelected[dbDay]) {
            const tStartStr = turnoSelected[`h_inicio_${key}`];
            const dur = turnoSelected[`duracion_${key}`];
            const alm = turnoSelected[`almuerzo_${key}`];
            
            if (tStartStr && typeof dur === 'number') {
              const [h, m] = tStartStr.split(':').map(Number);
              const maxH = h + dur + (alm ? 1 : 0);
              
              const actStartMin = startD.getHours() * 60 + startD.getMinutes();
              const actEndMin = endD.getHours() * 60 + endD.getMinutes();
              
              const tStartMin = h * 60 + m;
              const tEndMin = maxH * 60 + m;
              
              // Pequeño margen de tolerancia de 5 minutos o estricto
              if (actStartMin >= (tStartMin - 5) && actEndMin <= (tEndMin + 15)) {
                autoAprobado = true;
              }
            }
          }
        }
      }
    }

    if (canApprove) {
      payload.aprobado = formData.aprobado;
      payload.aprobado_por = formData.aprobado ? (currentUser.perfil_id || currentUser.id) : null;
    } else {
      payload.aprobado = autoAprobado;
      // Mantiene el aprobado_por original si ya estaba, o nulo si es automático
      payload.aprobado_por = log?.aprobado_por || null;
    }

    if (log?.id) {
      const { error } = await supabase.from('registro_actividades').update(payload).eq('id', log.id);
      if (error) alert('Error al actualizar: ' + error.message);
      else onSave();
    } else {
      const { data: newData, error } = await supabase.from('registro_actividades').insert([payload]).select();
      if (error) {
        alert('Error al registrar: ' + error.message);
      } else {
        // Enviar notificación por correo
        try {
          if (newData && newData[0]) {
            await supabase.functions.invoke('activity-log-notification', {
              body: { 
                activity_id: newData[0].id,
                programacion_id: newData[0].programacion_id
              }
            });
          }
        } catch (mailErr) {
          console.error('Error enviando notificación:', mailErr);
        }
        onSave();
      }
    }
    setLoading(false);
  };

  const roleName = currentUser?.role_name?.toLowerCase() || '';

  const selectedProgramacion = options.programaciones.find(p => p.id === formData.programacion_id);
  
  // "para el check del aprovado solo lo puede escribir el supervisor directo de la programacion"
  let canApprove = false;
  if (selectedProgramacion) {
    canApprove = selectedProgramacion.id_supervisor === currentUser.id;
  } else {
    // Si no hay programacion (ej: independiente), fallback a quien sea admin/supervisor genérico, o no según la regla
    canApprove = roleName === 'administrador' || roleName === 'supervisor' || roleName === 'superadmin';
  }

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ListTodo size={28} style={{ color: 'var(--accent-primary)' }} />
            {log ? 'Editar Registro de Actividad' : 'Nuevo Registro Diario'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Reporte de avances operativos y cierre de intervenciones
          </p>
        </div>
        <button 
          onClick={onCancel} 
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
      
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
        
        <div style={{ gridColumn: 'span 2' }}>
          <SearchableSelect 
            label="Programación de Actividad"
            options={options.programaciones} 
            value={formData.programacion_id} 
            onChange={handleProgramacionChange}
            placeholder="Seleccione la planeación de la actividad"
            required
          />
        </div>

        <SearchableSelect 
          label="Centro de Costo"
          options={options.cc} 
          value={formData.centro_costo_id} 
          onChange={(v:any) => setFormData({...formData, centro_costo_id: v})}
          placeholder="Seleccione código operativo"
          required
        />

        <SearchableSelect 
          label="Actividad Maestro"
          options={options.tareas} 
          value={formData.tarea_id} 
          onChange={(v:any) => setFormData({...formData, tarea_id: v})}
          placeholder="Seleccione actividad global"
          required
        />

        <SearchableSelect 
          label="Detalle Específico"
          options={detTareasOptions} 
          value={formData.det_tarea_id} 
          onChange={(v:any) => setFormData({...formData, det_tarea_id: v})}
          placeholder={formData.tarea_id ? "Seleccione detalle..." : "Requiere seleccionar actividad"}
          disabled={!formData.tarea_id}
          required
        />

        <SearchableSelect 
          label="Turno Laboral"
          options={options.turnos} 
          value={formData.turno_id} 
          onChange={(v:any) => setFormData({...formData, turno_id: v})}
          placeholder="Jornada en ejecución"
          required
        />

        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>Inicio de la Actividad <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <Calendar size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="datetime-local" 
              className="neon-input"
              value={formData.fecha_inicio} 
              onChange={e => setFormData({...formData, fecha_inicio: e.target.value})}
              required
              style={{ paddingLeft: '45px', width: '100%', minHeight: '52px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>Cierre de la Actividad <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
          <div style={{ position: 'relative' }}>
            <Clock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="datetime-local" 
              className="neon-input"
              value={formData.fecha_fin} 
              onChange={e => setFormData({...formData, fecha_fin: e.target.value})}
              required
              style={{ paddingLeft: '45px', width: '100%', minHeight: '52px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="input-group" style={{ gridColumn: 'span 2' }}>
          <label className="input-label" style={{ fontWeight: 600 }}>Reporte Técnico y Novedades <span style={{ color: 'var(--accent-primary)' }}>*</span></label>
          <textarea 
            value={formData.observacion} 
            onChange={e => setFormData({...formData, observacion: e.target.value})}
            placeholder="Ingrese memoria técnica, hallazgos, variables de operación..."
            rows={4}
            required
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              background: 'rgba(255, 255, 255, 0.02)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)',
              resize: 'vertical',
              fontSize: '0.95rem'
            }}
          />
        </div>

        {canApprove && (
          <div className="form-group" style={{ gridColumn: 'span 2', marginTop: '10px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '15px', 
              cursor: 'pointer', 
              background: 'rgba(0, 212, 255, 0.05)', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid rgba(0, 212, 255, 0.2)' 
            }}>
              <input 
                type="checkbox" 
                checked={formData.aprobado} 
                onChange={e => setFormData({...formData, aprobado: e.target.checked})}
                style={{ width: '24px', height: '24px', accentColor: 'var(--accent-primary)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.05rem' }}>Aprobación del Supervisor Operativo</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Firma la validez y correcta ejecución de este registro diario según KPI de calidad.</span>
              </div>
            </label>
          </div>
        )}

        <div style={{ gridColumn: 'span 2', marginTop: '20px', display: 'flex', gap: '16px' }}>
          <button type="submit" disabled={loading} className="neon-btn" style={{ flex: 2, height: '54px', fontSize: '1rem', fontWeight: 800 }}>
            {loading ? 'Procesando...' : log ? 'Actualizar Novedad' : 'Asentar Reporte de Avance'}
          </button>
          <button type="button" onClick={onCancel} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Cancelar Operación
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

export default ActivityLogForm;
