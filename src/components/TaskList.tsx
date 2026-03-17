import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckSquare, Edit2, CheckCircle, XCircle, Trash2 } from 'lucide-react';

interface TaskListProps {
  onEdit: (task: any) => void;
  refreshKey: number;
  searchTerm: string;
}

const TaskList: React.FC<TaskListProps> = ({ onEdit, refreshKey, searchTerm }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tareas')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Está seguro de eliminar esta tarea principal? Esto no eliminará los detalles asociados pero la tarea dejará de ser visible.')) {
      const { error } = await supabase.from('tareas').delete().eq('id', id);
      if (!error) fetchItems();
    }
  };

  const filteredItems = items.filter(item => 
    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando tareas principales...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron tareas.' : 'No hay tareas registradas.'}
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: 'var(--accent-primary)'
                }}>
                  <CheckSquare size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.nombre}</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => onEdit(item)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Edit2 size={16} />
                  <span style={{ fontSize: '0.8rem' }}>Editar</span>
                </button>
                <button 
                  type="button"
                  onClick={(e) => handleDelete(e, item.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <Trash2 size={16} />
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
                {item.habilitado ? 'Habilitado' : 'Deshabilitado'}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TaskList;
