import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { X, AlertCircle, Search, User } from 'lucide-react';

interface UserProfileFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [employees, setEmployees] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    id_empleado: '',
    id_rol: '',
    habilitado: true
  });

  // Custom Searchable Dropdown state
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLookups();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id_empleado: initialData.empleados?.id || '',
        id_rol: initialData.roles?.id || '',
        habilitado: initialData.habilitado !== undefined ? initialData.habilitado : true
      });
      if (initialData.empleados) {
        setEmployeeSearch(`${initialData.empleados.primer_nombre} ${initialData.empleados.primer_apellido} [${initialData.empleados.numero_documento}]`);
      }
    }
  }, [initialData]);

  // Handle clicking outside of dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLookups = async () => {
    const [empRes, rolRes] = await Promise.all([
      supabase.from('empleados').select('*').order('primer_nombre'),
      supabase.from('roles').select('*').order('nombre_rol')
    ]);
    if (empRes.data) setEmployees(empRes.data);
    if (rolRes.data) setRoles(rolRes.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!initialData?.id) {
      setError('No se puede guardar: no hay un perfil seleccionado para actualizar. Use el botón de editar (✏️) en la lista de usuarios.');
      setLoading(false);
      return;
    }

    const updatePayload: any = {
      id_empleado: formData.id_empleado ? formData.id_empleado : null,
      id_rol: formData.id_rol ? Number(formData.id_rol) : null,
      habilitado: formData.habilitado
    };

    const { data, error: updateError } = await supabase
      .from('perfiles')
      .update(updatePayload)
      .eq('id', initialData.id)
      .select();

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
    } else if (!data || data.length === 0) {
      setError('La actualización falló. Verifique permisos o que el registro exista.');
      setLoading(false);
    } else {
      onRefresh();
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const filteredEmployees = employees.filter(e => {
    const searchString = `${e.primer_nombre || ''} ${e.primer_apellido || ''} ${e.numero_documento || ''}`.toLowerCase();
    return searchString.includes(employeeSearch.toLowerCase());
  });

  const selectEmployee = (empId: string, empName: string) => {
    setFormData(prev => ({ ...prev, id_empleado: empId }));
    setEmployeeSearch(empName);
    setShowDropdown(false);
  };

  return (
    <div style={{ paddingBottom: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Configuración de Usuario y Acceso</h2>
        <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group" ref={dropdownRef} style={{ position: 'relative' }}>
          <label className="input-label">Vincular con Empleado (Ficha)</label>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text"
              className="neon-input"
              style={{ paddingLeft: '38px', cursor: 'text' }}
              value={employeeSearch}
              onChange={(e) => {
                setEmployeeSearch(e.target.value);
                setShowDropdown(true);
                if (e.target.value === '') setFormData(prev => ({ ...prev, id_empleado: '' }));
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Escriba para buscar un empleado..."
            />
            {formData.id_empleado && (
              <X 
                size={16} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--error)', cursor: 'pointer' }} 
                onClick={() => {
                  setFormData(prev => ({ ...prev, id_empleado: '' }));
                  setEmployeeSearch('');
                }}
              />
            )}
          </div>
          
          {showDropdown && (
            <div className="glass-card" style={{ 
              position: 'absolute', 
              top: '100%', 
              left: 0, 
              right: 0, 
              zIndex: 1000, 
              marginTop: '5px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '8px',
              border: '1px solid var(--glass-border)',
              background: 'var(--bg-secondary)',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              <div 
                style={{ padding: '10px', cursor: 'pointer', borderRadius: '4px', color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px' }}
                onClick={() => selectEmployee('', '')}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={16} /> -- Sin Vínculo / Cuenta Huérfana --
              </div>
              
              {filteredEmployees.length === 0 ? (
                <div style={{ padding: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>No se encontraron coincidencias...</div>
              ) : (
                filteredEmployees.map(e => {
                  const empName = `${e.primer_nombre} ${e.primer_apellido} [${e.numero_documento}]`;
                  const isSelected = formData.id_empleado === e.id;
                  return (
                    <div 
                      key={e.id}
                      style={{ 
                        padding: '10px', 
                        cursor: 'pointer', 
                        borderRadius: '4px',
                        color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)',
                        backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      onClick={() => selectEmployee(e.id, empName)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSelected ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? 'rgba(168, 85, 247, 0.1)' : 'transparent'}
                    >
                      <User size={16} color={isSelected ? 'var(--accent-primary)' : 'var(--text-secondary)'} /> {empName}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        <div className="input-group" style={{ marginTop: '20px' }}>
          <label className="input-label">Nivel de Permiso / Perfil *</label>
          <select 
            name="id_rol" 
            className="neon-select" 
            value={formData.id_rol} 
            onChange={handleChange} 
            required
          >
            <option value="">-- Seleccionar Permiso --</option>
            {roles.map(r => (
              <option key={r.id} value={r.id}>
                {r.nombre_rol}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px', marginTop: '10px' }}>
          <input 
            type="checkbox" 
            name="habilitado" 
            id="perfil-habilitado"
            checked={formData.habilitado} 
            onChange={handleChange} 
            style={{ width: '18px', height: '18px', accentColor: 'var(--accent-primary)' }} 
          />
          <label htmlFor="perfil-habilitado" className="input-label" style={{ marginBottom: 0 }}>Acceso habilitado al sistema</label>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Guardando...' : 'Aplicar Configuración'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '8px', fontWeight: 600 }}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
