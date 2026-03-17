import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Shield, ShieldAlert, Edit2, CheckCircle } from 'lucide-react';

interface UserProfileListProps {
  onEdit: (profile: any) => void;
  refreshKey: number;
  searchTerm: string;
}

const UserProfileList: React.FC<UserProfileListProps> = ({ onEdit, refreshKey, searchTerm }) => {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, [refreshKey]);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('perfiles')
      .select(`
        id,
        habilitado,
        ultimo_acceso,
        empleados (
          id,
          primer_nombre,
          primer_apellido,
          numero_documento,
          correo_electronico
        ),
        roles (
          id,
          nombre_rol
        )
      `);

    if (!error && data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const filteredItems = profiles.filter(item => {
    const search = searchTerm.toLowerCase();
    const e = item.empleados || {};
    const r = item.roles || {};
    const name = `${e.primer_nombre || ''} ${e.primer_apellido || ''}`.toLowerCase();
    const email = (e.correo_electronico || '').toLowerCase();
    const doc = (e.numero_documento || '').toLowerCase();
    const role = (r.nombre_rol || '').toLowerCase();
    
    return name.includes(search) || email.includes(search) || doc.includes(search) || role.includes(search);
  });

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando usuarios...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
      {filteredItems.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)', gridColumn: '1/-1' }}>
          {searchTerm ? 'No se encontraron usuarios.' : 'No hay usuarios configurados.'}
        </div>
      ) : (
        filteredItems.map((item) => {
          const emp = item.empleados || {};
          const rol = item.roles || {};

          return (
            <div key={item.id} className="glass-card animate-fade-in" style={{ padding: '24px', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ 
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                    padding: '10px', 
                    borderRadius: '10px',
                    color: '#3b82f6'
                  }}>
                    <User size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                      {emp.primer_nombre ? `${emp.primer_nombre} ${emp.primer_apellido}` : 'Usuario sin Empleado Vinculado'}
                    </h3>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                      {emp.correo_electronico || 'Email desconocido'}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => onEdit(item)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <Shield size={16} color="var(--accent-primary)" />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>Nivel de Permiso:</span>
                  <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)' }}>{rol.nombre_rol || 'Ninguno'}</span>
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--glass-border)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Último acceso: <br/>{item.ultimo_acceso ? new Date(item.ultimo_acceso).toLocaleString() : 'Jamás'}
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
                  {item.habilitado ? <CheckCircle size={12} /> : <ShieldAlert size={12} />}
                  {item.habilitado ? 'Acceso Permitido' : 'Acceso Denegado'}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default UserProfileList;
