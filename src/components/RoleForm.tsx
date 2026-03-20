import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle, Search, ShieldCheck } from 'lucide-react';

interface RoleFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const MODULOS = [
  { id: 'empleados', name: 'Empleados' },
  { id: 'cargos', name: 'Catálogo de Cargos' },
  { id: 'costos', name: 'Centros de Costos' },
  { id: 'grupos', name: 'Grupos de Trabajo' },
  { id: 'turnos', name: 'Gestión de Turnos' },
  { id: 'festivos', name: 'Días Festivos' },
  { id: 'tareas', name: 'Grupos de Tareas' },
  { id: 'det_tareas', name: 'Subtareas Detalladas' },
  { id: 'novedades', name: 'Gestión de Novedades' },
  { id: 'programacion', name: 'Programación de Personal' },
  { id: 'reportes', name: 'Reportes y Estadísticas' },
  { id: 'usuarios', name: 'Usuarios y Perfiles' },
  { id: 'roles', name: 'Seguridad y Roles' },
  { id: 'logs', name: 'Auditoría de Accesos' },
  { id: 'actividades', name: 'Registro de Actividades' },
  { id: 'configuracion', name: 'Configuración de Sistema' },
  { id: 'cargue_masivo', name: 'Cargue Masivo de Datos' }
];

const ACCIONES = [
  { id: 'ver', label: 'Ver' },
  { id: 'crear', label: 'Crear' },
  { id: 'editar', label: 'Editar' },
  { id: 'eliminar', label: 'Eliminar' }
];

const RoleForm: React.FC<RoleFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    nombre_rol: '',
    permisos: {} as Record<string, string[]>
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nombre_rol: initialData.nombre_rol || '',
        permisos: initialData.permisos || {}
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (initialData?.id) {
      result = await supabase.from('roles').update({
        nombre_rol: formData.nombre_rol,
        permisos: formData.permisos
      }).eq('id', initialData.id).select();
    } else {
      result = await supabase.from('roles').insert([{
        nombre_rol: formData.nombre_rol,
        permisos: formData.permisos
      }]).select();
    }

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
    } else if (!result.data || result.data.length === 0) {
      setError('La operación falló. Posible problema de permisos.');
      setLoading(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePermisoChange = (moduloId: string, accionId: string, checked: boolean) => {
    setFormData(prev => {
      const modPerms = prev.permisos[moduloId] || [];
      let newModPerms: any[];
      
      if (checked) {
        newModPerms = [...modPerms, accionId];
        // Rules: If you can create/edit/delete, you must be able to see (ver)
        if (accionId !== 'ver' && !newModPerms.includes('ver')) {
          newModPerms.push('ver');
        }
      } else {
        newModPerms = modPerms.filter(a => a !== accionId);
        // Rules: If you uncheck 'ver', you lose all other permissions
        if (accionId === 'ver') {
          newModPerms = [];
        }
      }
      
      return {
        ...prev,
        permisos: {
          ...prev.permisos,
          [moduloId]: newModPerms
        }
      };
    });
  };

  const handleSelectAll = (moduloId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permisos: {
        ...prev.permisos,
        [moduloId]: checked ? ACCIONES.map(a => a.id) : []
      }
    }));
  };

  const filteredModulos = MODULOS.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>
            {initialData ? 'Editar' : 'Nuevo'} Rol o Nivel Permiso
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Configuración de acceso y permisos del sistema
          </p>
        </div>
        <button 
          type="button" onClick={onClose} 
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px', borderRadius: '12px', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-primary)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
        >
          <X size={20} />
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">Nombre del Rol *</label>
          <input 
            name="nombre_rol" 
            className="neon-input" 
            value={formData.nombre_rol} 
            onChange={handleChange} 
            required 
            placeholder="Ej: Supervisor, Auditor..." 
          />
        </div>

        <div style={{ marginTop: '20px', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <label className="input-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldCheck size={18} color="var(--accent-primary)" /> Configuración de Acciones Permitidas
            </label>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text"
                placeholder="Filtrar módulos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="neon-input"
                style={{ height: '32px', paddingLeft: '32px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div style={{ 
            border: '1px solid var(--border-color)', 
            borderRadius: '8px', 
            background: 'var(--bg-secondary)',
            maxHeight: '400px',
            overflowY: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#111', zIndex: 10 }}>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Módulo</th>
                  {ACCIONES.map(a => (
                    <th key={a.id} style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>{a.label}</th>
                  ))}
                  <th style={{ padding: '12px', textAlign: 'center', color: 'var(--text-secondary)', fontWeight: 600 }}>Todos</th>
                </tr>
              </thead>
              <tbody>
                {filteredModulos.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No se encontraron módulos con coincidencia "{searchTerm}"
                    </td>
                  </tr>
                ) : (
                  filteredModulos.map(m => {
                    const modPerms = formData.permisos[m.id] || [];
                    const isAllSelected = ACCIONES.every(a => modPerms.includes(a.id));

                    return (
                      <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{m.name}</td>
                        {ACCIONES.map(a => (
                          <td key={a.id} style={{ padding: '12px', textAlign: 'center' }}>
                            <input 
                              type="checkbox"
                              checked={modPerms.includes(a.id)}
                              onChange={(e) => handlePermisoChange(m.id, a.id, e.target.checked)}
                              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
                            />
                          </td>
                        ))}
                        <td style={{ padding: '12px', textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                          <input 
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={(e) => handleSelectAll(m.id, e.target.checked)}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--success)', cursor: 'pointer' }}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 2, height: '54px', fontSize: '1rem', fontWeight: 800 }} disabled={loading}>
            {loading ? 'Procesando...' : initialData ? 'Actualizar Rol' : 'Registrar Rol'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoleForm;
