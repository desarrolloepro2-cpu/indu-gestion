import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Phone, Edit2, Power, User } from 'lucide-react';

interface EmployeeListProps {
  onEdit: (employee: any) => void;
  refreshKey: number;
  searchTerm: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit, refreshKey, searchTerm, canEdit = true, canDelete = true }) => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, [refreshKey]);

  const fetchEmployees = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('empleados')
      .select(`
        *,
        cargos (nombre_cargo),
        grupos_trabajo (nombre_grupo),
        centros_costos (nombre_centro)
      `)
      .order('esta_activo', { ascending: false })
      .order('created_at', { ascending: false });

    if (!error) {
      setEmployees(data || []);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deshabilitar' : 'habilitar';
    const { error } = await supabase.from('empleados').update({ esta_activo: !currentStatus }).eq('id', id);
    if (!error) {
      setConfirmingId(null);
      fetchEmployees();
    } else {
      alert(`Error al ${action}: ` + error.message);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const search = searchTerm.toLowerCase();
    const fullName = `${emp.primer_nombre} ${emp.primer_apellido}`.toLowerCase();
    const docNumber = (emp.numero_documento || '').toLowerCase();
    const email = (emp.correo_electronico || '').toLowerCase();
    return fullName.includes(search) || docNumber.includes(search) || email.includes(search);
  });

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
      <div className="spinner-small" style={{ width: '40px', height: '40px', borderTopColor: 'var(--accent-primary)' }}></div>
    </div>
  );
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '24px' }}>
      {filteredEmployees.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', gridColumn: '1/-1', opacity: 0.6 }}>
          <User size={48} style={{ marginBottom: '16px', color: 'var(--text-secondary)' }} />
          <p>{searchTerm ? 'No se encontraron coincidencias' : 'No hay personal registrado'}</p>
        </div>
      ) : (
        filteredEmployees.map((emp) => (
          <div key={emp.id} className="glass-card animate-fade-in" style={{ 
            padding: '24px', 
            border: '1px solid rgba(255,255,255,0.03)',
            transition: 'all 0.3s ease',
            opacity: emp.esta_activo ? 1 : 0.6,
            transform: emp.esta_activo ? 'none' : 'scale(0.98)',
            position: 'relative',
            filter: emp.esta_activo ? 'none' : 'grayscale(0.5)'
          }}
          onMouseEnter={(e) => {
            if (emp.esta_activo) {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.2)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = emp.esta_activo ? 'translateY(0)' : 'scale(0.98)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              {/* Photo Section */}
              <div style={{ position: 'relative' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '20px', 
                  backgroundColor: 'rgba(0, 212, 255, 0.05)',
                  overflow: 'hidden',
                  border: '2px solid rgba(0, 212, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {emp.foto_url ? (
                    <img src={emp.foto_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <User size={32} color="rgba(0, 212, 255, 0.4)" />
                  )}
                </div>
                {emp.esta_activo && (
                  <div style={{ 
                    position: 'absolute', bottom: '-4px', right: '-4px', 
                    width: '14px', height: '14px', borderRadius: '50%', 
                    backgroundColor: 'var(--success)', border: '2px solid var(--bg-color)',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                  }} />
                )}
              </div>

              {/* Basic Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: emp.esta_activo ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                    {emp.primer_nombre} {emp.primer_apellido}
                  </h3>
                  <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                    {confirmingId === emp.id ? (
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
                        <p style={{ fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>¿Realmente quieres {emp.esta_activo ? 'desactivar' : 'activar'}?</p>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => setConfirmingId(null)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                          >
                            No
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(emp.id, emp.esta_activo)}
                            style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                          >
                            Sí
                          </button>
                        </div>
                      </div>
                    ) : null}
                    {canEdit && emp.esta_activo && <button onClick={() => onEdit(emp)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Edit2 size={16} /></button>}
                    {canDelete && (
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setConfirmingId(confirmingId === emp.id ? null : emp.id);
                        }} 
                        style={{ 
                          background: confirmingId === emp.id ? 'var(--accent-primary)' : 'transparent', 
                          border: 'none', 
                          color: confirmingId === emp.id ? 'white' : (emp.esta_activo ? '#00d4ff' : 'var(--text-secondary)'), 
                          cursor: 'pointer',
                          padding: confirmingId === emp.id ? '4px' : '0px',
                          borderRadius: '6px',
                          filter: emp.esta_activo ? 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                        title={emp.esta_activo ? "Desactivar" : "Activar"}
                      >
                        <Power size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                  <span className="mini-badge" style={{ fontSize: '0.65rem' }}>{emp.cargos?.nombre_cargo || 'Sin Cargo'}</span>
                  {!emp.esta_activo && <span style={{ fontSize: '0.65rem', color: '#ff4444', fontWeight: 800 }}>DESACTIVADO</span>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Mail size={14} color="var(--accent-primary)" />
                <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{emp.correo_electronico}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <Phone size={14} color="var(--accent-primary)" />
                <span>{emp.telefono || 'Offline'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.6 }}>Grupo Laboral</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.grupos_trabajo?.nombre_grupo || 'Global'}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', opacity: 0.6 }}>Unidad de Costo</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{emp.centros_costos?.nombre_centro || 'Central'}</span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default EmployeeList;
