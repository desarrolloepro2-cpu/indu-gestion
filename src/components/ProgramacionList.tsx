import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ClipboardList, Edit2, Trash2, CheckCircle2, Clock, User, ShieldCheck } from 'lucide-react';

interface ProgramacionListProps {
  onEdit: (item: any) => void;
  refreshKey: number;
  searchTerm: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ProgramacionList: React.FC<ProgramacionListProps> = ({ onEdit, refreshKey, searchTerm, canEdit = true, canDelete = true }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('programacion')
      .select(`
        *,
        centros_costos (codigo, nombre_centro),
        tareas (nombre),
        det_tareas (nombre),
        responsable:empleados!id_responsable (primer_nombre, primer_apellido, foto_url),
        supervisor:empleados!id_supervisor (primer_nombre, primer_apellido, foto_url),
        turnos (nombre_turno)
      `)
      .order('created_at', { ascending: false });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar esta programación?')) {
      const { error } = await supabase.from('programacion').delete().eq('id', id);
      if (!error) fetchItems();
      else alert('Error al eliminar: ' + error.message);
    }
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    const serial = (item.serial || '').toLowerCase();
    const centro = (item.centros_costos?.nombre_centro || '').toLowerCase();
    const tarea = (item.tareas?.nombre || '').toLowerCase();
    const responsable = `${item.responsable?.primer_nombre} ${item.responsable?.primer_apellido}`.toLowerCase();
    return serial.includes(search) || centro.includes(search) || tarea.includes(search) || responsable.includes(search);
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="spinner-small" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-primary)' }}></div>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <ClipboardList size={48} style={{ margin: '0 auto 20px', opacity: 0.1 }} />
          <p>{searchTerm ? 'No se encontraron registros.' : 'No hay actividades programadas.'}</p>
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="glass-card animate-fade-in" style={{ 
            padding: '24px', 
            borderLeft: `6px solid ${item.porcentaje_ejecucion === 100 ? 'var(--success)' : 'var(--accent-primary)'}`,
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Background Accent */}
            <div style={{ 
              position: 'absolute', top: 0, right: 0, 
              width: '150px', height: '150px', 
              background: `radial-gradient(circle at top right, ${item.porcentaje_ejecucion === 100 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(0, 212, 255, 0.05)'}, transparent)`,
              zIndex: 0 
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 900, fontSize: '1.25rem', color: 'var(--accent-primary)', letterSpacing: '1px' }}>{item.serial}</span>
                  <span className="mini-badge">{item.centros_costos?.codigo}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>C.C. {item.centros_costos?.nombre_centro}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {item.tareas?.nombre} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>• {item.det_tareas?.nombre}</span>
                </h3>
              </div>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                {canEdit && (
                  <button onClick={() => onEdit(item)} className="glass-card" style={{ padding: '8px', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                    <Edit2 size={18} />
                  </button>
                )}
                {canDelete && (
                  <button onClick={(e) => handleDelete(e, item.id)} className="glass-card" style={{ padding: '8px', border: 'none', color: 'rgba(239, 68, 68, 0.5)', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
              {/* Assignees */}
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '14px', border: '2px solid var(--accent-primary)', overflow: 'hidden' }}>
                    {item.responsable?.foto_url ? (
                      <img src={item.responsable.foto_url} alt="R" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(0, 212, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <User size={20} color="var(--accent-primary)" />
                      </div>
                    )}
                  </div>
                  <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', backgroundColor: 'var(--bg-color)', borderRadius: '50%', padding: '2px' }}>
                    <CheckCircle2 size={14} color="var(--accent-primary)" />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Responsable</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.responsable?.primer_nombre} {item.responsable?.primer_apellido}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', border: '2px solid var(--accent-secondary)', overflow: 'hidden' }}>
                  {item.supervisor?.foto_url ? (
                    <img src={item.supervisor.foto_url} alt="S" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ShieldCheck size={20} color="var(--accent-secondary)" />
                    </div>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Supervisor</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.supervisor?.primer_nombre} {item.supervisor?.primer_apellido}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                  <Clock size={20} color="var(--text-secondary)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700 }}>Jornada</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.turnos?.nombre_turno} • {item.horas}h</div>
                </div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div style={{ backgroundColor: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)' }}>AVANCE DE OBRA</span>
                  {item.porcentaje_ejecucion === 100 && <span className="mini-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>Completado</span>}
                </div>
                <span style={{ fontSize: '1rem', fontWeight: 900, color: item.porcentaje_ejecucion === 100 ? 'var(--success)' : 'var(--accent-primary)' }}>
                   {item.porcentaje_ejecucion}%
                </span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${item.porcentaje_ejecucion}%`, 
                  height: '100%', 
                  background: item.porcentaje_ejecucion === 100 ? 'var(--success)' : 'linear-gradient(to right, var(--accent-primary), var(--accent-secondary))',
                  boxShadow: item.porcentaje_ejecucion > 0 ? `0 0 10px ${item.porcentaje_ejecucion === 100 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(0, 212, 255, 0.4)'}` : 'none',
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)'
                }} />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ProgramacionList;

