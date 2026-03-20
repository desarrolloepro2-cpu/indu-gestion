import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Clock, Calendar, Edit2, CheckCircle, XCircle, Power } from 'lucide-react';

interface ShiftListProps {
  onEdit: (shift: any) => void;
  refreshKey: number;
  searchTerm: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const ShiftList: React.FC<ShiftListProps> = ({ onEdit, refreshKey, searchTerm, canEdit = true, canDelete = true }) => {
  const [shifts, setShifts] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchShifts();
  }, [refreshKey]);

  const fetchShifts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('turnos')
      .select('*')
      .order('habilitado', { ascending: false })
      .order('nombre_turno');
    
    if (!error && data) {
      setShifts(data);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deshabilitar' : 'habilitar';
    const { error } = await supabase.from('turnos').update({ habilitado: !currentStatus }).eq('id', id);
    if (!error) {
      setConfirmingId(null);
      fetchShifts();
    } else {
      alert(`Error al ${action}: ` + error.message);
    }
  };

  const calculateTotalHours = (shift: any) => {
    if (!shift.hora_inicio || !shift.hora_fin) return '0h';
    
    const [startH, startM] = shift.hora_inicio.split(':').map(Number);
    const [endH, endM] = shift.hora_fin.split(':').map(Number);
    
    let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
    
    if (diffMinutes <= 0) {
      diffMinutes += 24 * 60;
    }
    
    let totalMinutes = diffMinutes;
    if (shift.hab_hora_almuerzo) {
      totalMinutes -= 60;
    }
    
    const hours = Math.floor(Math.max(0, totalMinutes) / 60);
    const mins = totalMinutes % 60;
    
    return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
  };

  const filteredShifts = shifts.filter(shift => 
    shift.nombre_turno.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderDays = (shift: any) => {
    const days = [
      { key: 'lunes', label: 'L' },
      { key: 'martes', label: 'M' },
      { key: 'miercoles', label: 'X' },
      { key: 'jueves', label: 'J' },
      { key: 'viernes', label: 'V' },
      { key: 'sabado', label: 'S' },
      { key: 'domingo', label: 'D' }
    ];

    return (
      <div style={{ display: 'flex', gap: '4px', marginTop: '10px' }}>
        {days.map(day => (
          <div 
            key={day.key}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              backgroundColor: shift[day.key] ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: shift[day.key] ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: shift[day.key] ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            {day.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
      {filteredShifts.map(shift => (
        <div key={shift.id} className="glass-card" style={{ 
          position: 'relative',
          padding: '25px', 
          border: '1px solid var(--glass-border)',
          transition: 'all 0.3s ease',
          opacity: shift.habilitado ? 1 : 0.6,
          filter: shift.habilitado ? 'none' : 'grayscale(0.5)',
          transform: shift.habilitado ? 'none' : 'scale(0.98)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{ maxWidth: '85%' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: shift.habilitado ? 'var(--accent-primary)' : 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.2' }}>
                {shift.nombre_turno}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  <Clock size={16} />
                  <span>{shift.hora_inicio.substring(0, 5)} - {shift.hora_fin.substring(0, 5)}</span>
                </div>
                <div style={{ 
                  background: 'rgba(168, 85, 247, 0.15)', 
                  padding: '4px 10px', 
                  borderRadius: '6px', 
                  fontSize: '0.8rem', 
                  fontWeight: 800, 
                  color: 'var(--accent-primary)',
                  boxShadow: '0 0 10px rgba(168, 85, 247, 0.1)'
                }}>
                  {calculateTotalHours(shift)}
                </div>
              </div>
              {shift.fecha && (
                <div style={{ marginTop: '10px', color: 'var(--text-secondary)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <Calendar size={14} />
                   Vigente desde: {shift.fecha}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              {confirmingId === shift.id ? (
                <div className="glass-card animate-scale-in" style={{ 
                  position: 'absolute', 
                  right: 0, 
                  top: '100%', 
                  marginTop: '10px',
                  zIndex: 100, 
                  padding: '12px', 
                  minWidth: '180px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  border: '1px solid var(--accent-primary)',
                  backgroundColor: 'rgba(15, 15, 25, 0.95)'
                }}>
                  <p style={{ fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>¿Realmente quieres {shift.habilitado ? 'desactivar' : 'activar'}?</p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button 
                      onClick={() => setConfirmingId(null)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      No
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(shift.id, shift.habilitado)}
                      style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                    >
                      Sí
                    </button>
                  </div>
                </div>
              ) : null}
              {canEdit && shift.habilitado && (
                <button 
                  onClick={() => onEdit(shift)}
                  style={{ 
                    background: 'rgba(255, 255, 255, 0.05)', 
                    border: 'none', 
                    color: 'var(--accent-primary)', 
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Edit2 size={18} />
                </button>
              )}
              {canDelete && (
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmingId(confirmingId === shift.id ? null : shift.id);
                  }}
                  style={{ 
                    background: confirmingId === shift.id ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.05)', 
                    border: 'none', 
                    color: confirmingId === shift.id ? 'white' : (shift.habilitado ? '#00d4ff' : 'var(--text-secondary)'), 
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: shift.habilitado ? 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  title={shift.habilitado ? "Desactivar" : "Activar"}
                >
                  <Power size={18} />
                </button>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '12px' }}>
              <Calendar size={14} style={{ color: 'var(--text-secondary)' }} />
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Días programados:</span>
            </div>
            {renderDays(shift)}
          </div>

          <div style={{ 
            marginTop: '20px', 
            paddingTop: '15px',
            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            fontSize: '0.9rem' 
          }}>
            {shift.hab_hora_almuerzo ? (
              <CheckCircle size={16} style={{ color: '#10b981' }} />
            ) : (
              <XCircle size={16} style={{ color: '#ef4444' }} />
            )}
            <span style={{ fontWeight: 600, color: shift.hab_hora_almuerzo ? '#10b981' : 'var(--text-secondary)' }}>
              {shift.hab_hora_almuerzo ? 'Hora de almuerzo habilitada' : 'Sin hora de almuerzo'}
            </span>
            {!shift.habilitado && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#ff4444', fontWeight: 800 }}>DESACTIVADO</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShiftList;
