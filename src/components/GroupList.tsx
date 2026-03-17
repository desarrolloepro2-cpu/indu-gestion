import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Layers, Edit2, CheckCircle, XCircle, Power } from 'lucide-react';

interface GroupListProps {
  onEdit: (group: any) => void;
  refreshKey: number;
  searchTerm: string;
}

const GroupList: React.FC<GroupListProps> = ({ onEdit, refreshKey, searchTerm }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('grupos_trabajo')
      .select('*')
      .order('habilitado', { ascending: false })
      .order('nombre_grupo', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    const action = currentStatus ? 'deshabilitar' : 'habilitar';
    if (window.confirm(`¿Quieres realmente ${action} el registro?`)) {
      const { error } = await supabase.from('grupos_trabajo').update({ habilitado: !currentStatus }).eq('id', id);
      if (!error) fetchItems();
      else alert(`Error al ${action}: ` + error.message);
    }
  };

  const filteredItems = items.filter(item => 
    item.nombre_grupo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando grupos de trabajo...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron grupos de trabajo.' : 'No hay grupos de trabajo registrados.'}
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
                  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: 'var(--accent-secondary)'
                }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: item.habilitado ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.nombre_grupo}</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
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
                  onClick={(e) => handleToggleStatus(e, item.id, item.habilitado)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: item.habilitado ? '#00d4ff' : 'var(--text-secondary)', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center',
                    filter: item.habilitado ? 'drop-shadow(0 0 5px rgba(0, 212, 255, 0.5))' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                  title={item.habilitado ? "Desactivar" : "Activar"}
                >
                  <Power size={18} />
                </button>
              </div>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: '1.4' }}>
              {item.descripcion || 'Sin descripción detallada.'}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-start', 
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: '0.7rem', 
                fontWeight: 700,
                backgroundColor: item.habilitado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                color: item.habilitado ? 'var(--success)' : 'var(--error)',
                padding: '4px 10px',
                borderRadius: '20px',
                textTransform: 'uppercase'
              }}>
                {item.habilitado ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {item.habilitado ? 'Habilitado' : 'Desactivado'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GroupList;
