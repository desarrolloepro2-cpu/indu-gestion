import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Edit2, Trash2, CheckCircle, XCircle, Clock, Calendar, Hash, Layers, ListTodo } from 'lucide-react';

interface ActivityLogListProps {
  onEdit: (log: any) => void;
  refreshKey: number;
  searchTerm: string;
  currentUser: any;
}

const ActivityLogList: React.FC<ActivityLogListProps> = ({ onEdit, refreshKey, searchTerm, currentUser }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'undefined' && currentUser.id !== '[object Object]') {
      fetchLogs();
    }
  }, [refreshKey, currentUser]);

  const fetchLogs = async () => {
    if (!currentUser?.id || currentUser.id === 'undefined' || currentUser.id === '[object Object]') {
      setLoading(false);
      return;
    }
    setLoading(true);
    let query = supabase
      .from('registro_actividades')
      .select(`
        *,
        perfiles:ejecutor_id(empleados(correo_electronico, primer_nombre, primer_apellido)),
        centros_costos(nombre_centro, codigo),
        programacion(serial),
        tareas(nombre),
        det_tareas(nombre),
        turnos(nombre_turno)
      `)
      .order('fecha_inicio', { ascending: false });
    
    // RLS ya restringe qué puede ver cada quién.
    const { data, error } = await query;
    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar este registro?')) {
      const { error } = await supabase.from('registro_actividades').delete().eq('id', id);
      if (!error) fetchLogs();
      else alert('Error al eliminar: ' + error.message);
    }
  };

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    const observacion = (log.observacion || '').toLowerCase();
    const tarea = (log.tareas?.nombre || '').toLowerCase();
    const detTarea = (log.det_tareas?.nombre || '').toLowerCase();
    const centroCosto = (log.centros_costos?.nombre_centro || '').toLowerCase();
    
    return observacion.includes(search) || 
           tarea.includes(search) || 
           detTarea.includes(search) || 
           centroCosto.includes(search);
  });

  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="spinner-small" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-primary)' }}></div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', opacity: 0.6 }}>
          <ListTodo size={48} style={{ marginBottom: '16px', color: 'var(--text-secondary)' }} />
          <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {searchTerm ? 'No se encontraron registros de actividad.' : 'No hay actividades registradas aún.'}
          </p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
          {/* Header de la Tabla Simulada */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '150px 2fr 1.5fr 150px 120px 80px', 
            gap: '15px', 
            padding: '16px 20px', 
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            <div>Horario</div>
            <div>Actividad y Detalle</div>
            <div>Clasificación y Novedad</div>
            <div>Ejecutor</div>
            <div>Estado</div>
            <div>Acciones</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredLogs.map(log => (
              <div 
                key={log.id} 
                className="animate-fade-in" 
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '150px 2fr 1.5fr 150px 120px 80px', 
                  gap: '15px', 
                  padding: '16px 20px', 
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  transition: 'background-color 0.2s',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Fechas */}
                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
                    <Calendar size={12} style={{ color: 'var(--accent-secondary)' }} />
                    {formatDate(log.fecha_inicio)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                    <Clock size={12} style={{ color: 'var(--accent-secondary)' }} />
                    {log.fecha_fin ? formatDate(log.fecha_fin) : 'En progreso'}
                  </div>
                </div>

                {/* Actividad */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {log.tareas?.nombre || 'Sin tarea'}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                    {log.det_tareas?.nombre || 'Sin detalle'}
                  </span>
                </div>

                {/* Clasificación / Check */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                      <Hash size={10} style={{ color: 'var(--success)' }} /> {log.centros_costos?.codigo || 'N/A'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                      <Layers size={10} style={{ color: '#00d4ff' }} /> {log.turnos?.nombre_turno || 'N/A'}
                    </span>
                  </div>
                  <div 
                    title={log.observacion}
                    style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)', 
                      fontStyle: 'italic', 
                      whiteSpace: 'nowrap', 
                      overflow: 'hidden', 
                      textOverflow: 'ellipsis',
                      maxWidth: '100%'
                    }}
                  >
                    "{log.observacion}"
                  </div>
                </div>

                {/* Empleado Ejecutor */}
                <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {log.perfiles?.empleados?.primer_nombre} <br/> {log.perfiles?.empleados?.primer_apellido}
                </div>

                {/* Estado Aprobación */}
                <div>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: '0.7rem', 
                    fontWeight: 800,
                    backgroundColor: log.aprobado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                    color: log.aprobado ? 'var(--success)' : 'var(--error)',
                    padding: '6px 10px',
                    borderRadius: '20px',
                    textTransform: 'uppercase'
                  }}>
                    {log.aprobado ? <CheckCircle size={14} /> : <XCircle size={14} />}
                    {log.aprobado ? 'Aprobado' : 'Pendiente'}
                  </span>
                </div>

                {/* Botones de acción */}
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button 
                    onClick={() => onEdit(log)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    <Edit2 size={18} />
                  </button>
                  {['administrador', 'superadmin', 'supervisor'].includes((currentUser?.role_name || '').toLowerCase()) && (
                    <button 
                      type="button"
                      onClick={(e) => handleDelete(e, log.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', opacity: 0.8, transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogList;
