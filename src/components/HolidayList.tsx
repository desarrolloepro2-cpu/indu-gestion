import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Sun, Calendar, Edit2, Power } from 'lucide-react';

interface HolidayListProps {
  onEdit: (holiday: any) => void;
  refreshKey: number;
  searchTerm: string;
}

const HolidayList: React.FC<HolidayListProps> = ({ onEdit, refreshKey, searchTerm }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('dias_festivos')
      .select('*')
      .order('habilitado', { ascending: false })
      .order('fecha', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deshabilitar' : 'habilitar';
    const { error } = await supabase.from('dias_festivos').update({ habilitado: !currentStatus }).eq('id', id);
    if (!error) {
      setConfirmingId(null);
      fetchItems();
    } else {
      alert(`Error al ${action}: ` + error.message);
    }
  };

  const filteredItems = items.filter(item => 
    item.nombre_festivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.fecha.includes(searchTerm)
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('es-CO', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando calendario de festivos...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron festivos para esa búsqueda.' : 'No hay festivos registrados.'}
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="glass-card animate-fade-in" style={{ 
            padding: '24px',
            opacity: item.habilitado ? 1 : 0.6,
            transition: 'all 0.3s ease',
            filter: item.habilitado ? 'none' : 'grayscale(0.5)',
            transform: item.habilitado ? 'none' : 'scale(0.98)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(234, 179, 8, 0.1)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: '#eab308'
                }}>
                  <Sun size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: item.habilitado ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.nombre_festivo}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                    <Calendar size={14} />
                    <span>{item.fecha}</span>
                  </div>
                </div>
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
                {item.habilitado && (
                  <button 
                    onClick={() => onEdit(item)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Edit2 size={16} />
                    <span style={{ fontSize: '0.8rem' }}>Editar</span>
                  </button>
                )}
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
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'capitalize' }}>
              {formatDate(item.fecha)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default HolidayList;
