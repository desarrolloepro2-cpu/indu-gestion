import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Settings, Edit2, CheckCircle, XCircle, Tag, Trash2, Filter } from 'lucide-react';

interface TaskDetailListProps {
  onEdit: (detail: any) => void;
  refreshKey: number;
  searchTerm: string;
  canEdit?: boolean;
  canDelete?: boolean;
}

const TaskDetailList: React.FC<TaskDetailListProps> = ({ onEdit, refreshKey, searchTerm, canEdit = true, canDelete = true }) => {
  const [items, setItems] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tareas')
      .select('id, nombre')
      .order('nombre', { ascending: true });
    setTasks(data || []);
  };

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('det_tareas')
      .select(`
        *,
        tareas (
          nombre
        )
      `)
      .order('nombre', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('det_tareas').delete().eq('id', id);
    if (!error) {
      setConfirmingId(null);
      fetchItems();
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tareas?.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTask = selectedTaskId === 'all' || item.id_tarea?.toString() === selectedTaskId;
    
    return matchesSearch && matchesTask;
  });

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando detalles de tareas...</div>;

  return (
    <div>
      <div style={{ 
        marginBottom: '25px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: '15px',
        borderRadius: '12px',
        border: '1px solid var(--glass-border)'
      }}>
        <div style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Filtrar por Grupo:</span>
        </div>
        <select 
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="neon-input"
          style={{ width: 'auto', minWidth: '250px', height: '40px', padding: '0 15px' }}
        >
          <option value="all">Todos los grupos</option>
          {tasks.map(task => (
            <option key={task.id} value={task.id.toString()}>{task.nombre}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron detalles para esa búsqueda.' : 'No hay detalles de tareas registrados.'}
        </div>
      ) : (
        filteredItems.map((item) => (
          <div key={item.id} className="glass-card animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: '#3b82f6'
                }}>
                  <Settings size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{item.nombre}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '4px', fontWeight: 600 }}>
                    <Tag size={14} />
                    <span>Grupo: {item.tareas?.nombre || 'General'}</span>
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
                    <p style={{ fontSize: '0.8rem', marginBottom: '12px', fontWeight: 600 }}>¿Realmente quieres eliminar esta subtarea?</p>
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
    </div>
  );
};

export default TaskDetailList;
