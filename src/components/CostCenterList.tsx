import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Hash, CheckCircle, XCircle, Edit2, Power } from 'lucide-react';

interface CostCenterListProps {
  onEdit: (cc: any) => void;
  refreshKey: number;
  searchTerm: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const CostCenterList: React.FC<CostCenterListProps> = ({ onEdit, refreshKey, searchTerm, canEdit = true, canDelete = true }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('centros_costos')
      .select('*')
      .order('habilitado', { ascending: false })
      .order('codigo', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deshabilitar' : 'habilitar';
    const { error } = await supabase.from('centros_costos').update({ habilitado: !currentStatus }).eq('id', id);
    if (!error) {
      setConfirmingId(null);
      fetchItems();
    } else {
      alert(`Error al ${action}: ` + error.message);
    }
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    const code = (item.codigo || '').toLowerCase();
    const name = (item.nombre_centro || '').toLowerCase();
    return code.includes(search) || name.includes(search);
  });

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando centros de costos...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {searchTerm ? 'No se encontraron centros de costos.' : 'No hay centros de costos registrados.'}
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="glass-card animate-fade-in" style={{ 
            padding: '20px', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            borderLeft: `4px solid ${item.habilitado ? 'var(--success)' : 'var(--error)'}`,
            opacity: item.habilitado ? 1 : 0.6,
            transition: 'all 0.3s ease',
            filter: item.habilitado ? 'none' : 'grayscale(0.5)',
            transform: item.habilitado ? 'none' : 'scale(0.99)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.05)', 
                padding: '12px', 
                borderRadius: '8px',
                color: 'var(--accent-primary)'
              }}>
                <Hash size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontWeight: 800, fontSize: '1.1rem', color: item.habilitado ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{item.codigo}</span>
                  <span style={{ color: 'var(--border-color)' }}>|</span>
                  <span style={{ fontWeight: 600 }}>{item.nombre_centro}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                  {item.descripcion || 'Sin descripción'}
                </p>
                <div style={{ display: 'flex', gap: '15px', marginTop: '12px', flexWrap: 'wrap' }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Presupuesto</span>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>
                      {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.presupuesto || 0)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div className="mini-badge">Ing: {item.horas_ingenieria || 0}h</div>
                    <div className="mini-badge">Tec: {item.horas_tecnicos || 0}h</div>
                    <div className="mini-badge">SISO: {item.horas_siso || 0}h</div>
                    <div className="mini-badge">Otr: {item.horas_otros || 0}h</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.75rem', 
                fontWeight: 700,
                color: item.habilitado ? 'var(--success)' : 'var(--error)',
                textTransform: 'uppercase'
              }}>
                {item.habilitado ? <CheckCircle size={14} /> : <XCircle size={14} />}
                {item.habilitado ? 'Habilitado' : 'Deshabilitado'}
              </div>
              <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                {confirmingId === item.id ? (
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
                    <p style={{ fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>¿Realmente quieres {item.habilitado ? 'desactivar' : 'activar'}?</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setConfirmingId(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        No
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(item.id, item.habilitado)}
                        style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Sí
                      </button>
                    </div>
                  </div>
                ) : null}
                {canEdit && item.habilitado && (
                  <button 
                    onClick={() => onEdit(item)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={16} />
                    <span style={{ fontSize: '0.8rem' }}>Editar</span>
                  </button>
                )}
                {canDelete && (
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmingId(confirmingId === item.id ? null : item.id);
                    }}
                    style={{ 
                      background: confirmingId === item.id ? 'var(--accent-primary)' : 'transparent', 
                      border: 'none', 
                      color: confirmingId === item.id ? 'white' : (item.habilitado ? '#00d4ff' : 'var(--text-secondary)'), 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center',
                      padding: confirmingId === item.id ? '4px' : '0px',
                      borderRadius: '6px',
                      filter: item.habilitado ? 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                    title={item.habilitado ? "Desactivar" : "Activar"}
                  >
                    <Power size={18} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CostCenterList;
