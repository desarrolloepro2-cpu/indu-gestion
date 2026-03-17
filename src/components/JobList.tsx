import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Briefcase, DollarSign, ShieldCheck, CheckCircle, XCircle, Edit2, Power } from 'lucide-react';

interface JobListProps {
  onEdit: (job: any) => void;
  refreshKey: number;
  searchTerm: string;
}

const JobList: React.FC<JobListProps> = ({ onEdit, refreshKey, searchTerm }) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cargos')
      .select('*')
      .order('habilitado', { ascending: false })
      .order('nombre_cargo', { ascending: true });

    if (!error) setItems(data || []);
    setLoading(false);
  };

  const handleToggleStatus = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    
    const action = currentStatus ? 'deshabilitar' : 'habilitar';
    if (window.confirm(`¿Quieres realmente ${action} el registro?`)) {
      const { error } = await supabase.from('cargos').update({ habilitado: !currentStatus }).eq('id', id);
      if (!error) fetchItems();
      else alert(`Error al ${action}: ` + error.message);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  const filteredItems = items.filter(item => {
    const search = searchTerm.toLowerCase();
    const name = item.nombre_cargo.toLowerCase();
    const sigla = (item.sigla_cargo || '').toLowerCase();
    return name.includes(search) || sigla.includes(search);
  });

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando cargos...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron cargos que coincidan con la búsqueda.' : 'No hay cargos registrados.'}
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
                  backgroundColor: 'rgba(168, 85, 247, 0.1)', 
                  padding: '10px', 
                  borderRadius: '10px',
                  color: 'var(--accent-primary)'
                }}>
                  <Briefcase size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: item.habilitado ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item.nombre_cargo}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    <ShieldCheck size={14} />
                    <span>{item.sigla_cargo || 'S.S.'}</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {item.habilitado && (
                  <button 
                    onClick={() => onEdit(item)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
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
              {item.descripcion_cargo || 'Sin descripción detallada.'}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '16px',
              borderTop: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} color="var(--success)" />
                <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {formatCurrency(item.salario_cargo)}
                </span>
              </div>
              
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

export default JobList;
