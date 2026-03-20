import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Plus, Edit2, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface NovedadListProps {
  onEdit: (novedad: any) => void;
  refreshKey: number;
  searchTerm: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const NovedadList: React.FC<NovedadListProps> = ({ onEdit, refreshKey, searchTerm, canEdit = true, canDelete = true }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('detnovedades')
      .select('*')
      .order('novedad', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('detnovedades').delete().eq('id', id);
    if (!error) {
      setConfirmingId(null);
      fetchItems();
    }
  };

  const filteredItems = items.filter(item => 
    item.novedad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando catálogo de novedades...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron tipos de novedad.' : 'No hay novedades registradas en el catálogo.'}
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(236, 72, 153, 0.1)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: 'var(--accent-secondary)'
                }}>
                  <Plus size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.novedad}</h3>
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
                    <p style={{ fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>¿Realmente quieres eliminar esta novedad?</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => setConfirmingId(null)}
                        style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-secondary)', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        No
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        style={{ background: 'var(--error)', border: 'none', color: 'white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ) : null}
                {canEdit && (
                  <button 
                    onClick={() => onEdit(item)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
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
                      background: confirmingId === item.id ? 'var(--error)' : 'transparent', 
                      border: 'none', 
                      color: confirmingId === item.id ? 'white' : 'var(--error)', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: confirmingId === item.id ? '4px' : '0px',
                      borderRadius: '6px',
                      gap: '5px' 
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>

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
                {item.habilitado ? 'Habilitado' : 'Deshabilitado'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default NovedadList;
