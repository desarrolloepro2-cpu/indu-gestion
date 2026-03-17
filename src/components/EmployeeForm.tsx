import React, { useState, useEffect, useRef } from 'react';
import { supabase, secondarySupabase } from '../supabaseClient';
import { X, AlertCircle, Camera, Upload, Check } from 'lucide-react';

interface EmployeeFormProps {
  onClose: () => void;
  onRefresh: () => void;
  initialData?: any;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onClose, onRefresh, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Lookups
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [costCenters, setCostCenters] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    primer_nombre: '',
    segundo_nombre: '',
    primer_apellido: '',
    segundo_apellido: '',
    apodo: '',
    id_tipo_documento: '',
    numero_documento: '',
    correo_electronico: '',
    direccion: '',
    id_cargo: '',
    id_grupo_trabajo: '',
    id_centro_costos: '',
    id_pais: '',
    telefono: '',
    foto_url: '',
    esta_activo: true
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Rol seleccionado (no se guarda en empleados, se usa para crear el perfil)
  const [selectedRol, setSelectedRol] = useState('');
  // Crear usuario automáticamente
  const [crearUsuario, setCrearUsuario] = useState(true);

  useEffect(() => {
    loadLookups();
  }, []);

  useEffect(() => {
    if (initialData && countries.length > 0) {
      setFormData({
        primer_nombre: initialData.primer_nombre || '',
        segundo_nombre: initialData.segundo_nombre || '',
        primer_apellido: initialData.primer_apellido || '',
        segundo_apellido: initialData.segundo_apellido || '',
        apodo: initialData.apodo || '',
        id_tipo_documento: initialData.id_tipo_documento || '',
        numero_documento: initialData.numero_documento || '',
        correo_electronico: initialData.correo_electronico || '',
        direccion: initialData.direccion || '',
        id_pais: initialData.id_pais?.toString() || '',
        telefono: (initialData.telefono || '').replace(/\D/g, '').slice(-10) || '',
        id_cargo: initialData.id_cargo || '',
        id_grupo_trabajo: initialData.id_grupo_trabajo || '',
        id_centro_costos: initialData.id_centro_costos || '',
        foto_url: initialData.foto_url || '',
        esta_activo: initialData.esta_activo !== undefined ? initialData.esta_activo : true
      });
      if (initialData.foto_url) {
        setImagePreview(initialData.foto_url);
      }
    }
  }, [initialData, countries]);

  const loadLookups = async () => {
    const [dt, j, g, cc, p, r] = await Promise.all([
      supabase.from('tipos_documento').select('*').eq('habilitado', true).order('nombre'),
      supabase.from('cargos').select('*').eq('habilitado', true).order('nombre_cargo'),
      supabase.from('grupos_trabajo').select('*').eq('habilitado', true).order('nombre_grupo'),
      supabase.from('centros_costos').select('*').eq('habilitado', true).order('codigo'),
      supabase.from('paises').select('*').eq('habilitado', true).order('nombre'),
      supabase.from('roles').select('*').order('nombre_rol')
    ]);

    if (dt.data) setDocTypes(dt.data);
    if (j.data) setJobs(j.data);
    if (g.data) setGroups(g.data);
    if (cc.data) setCostCenters(cc.data);
    if (p.data) {
      setCountries(p.data);
      if (!initialData) {
        const co = p.data.find((c: any) => c.codigo_iso === 'CO');
        if (co) setFormData(prev => ({ ...prev, id_pais: co.id }));
      }
    }
    if (r.data) {
      setRoles(r.data);
      const defaultRol = r.data.find((rol: any) => rol.nombre_rol === 'Empleado');
      if (defaultRol) setSelectedRol(defaultRol.id.toString());
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (employeeId: string) => {
    if (!imageFile) return formData.foto_url;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${employeeId}-${Math.random()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('empleados-fotos')
      .upload(filePath, imageFile);

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return formData.foto_url;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('empleados-fotos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Validar correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correo_electronico)) {
        throw new Error('Formato de correo electrónico inválido.');
      }

      // 2. Validar teléfono
      const country = countries.find(c => c.id.toString() === formData.id_pais.toString());
      const countryCode = country?.codigo_tel || '';
      const phoneDigits = formData.telefono.replace(/\D/g, '');
      if (countryCode === '+57' && phoneDigits.length !== 10) {
        throw new Error('En Colombia, el número debe tener 10 dígitos.');
      }

      let currentFotoUrl = formData.foto_url;

      // 3. Preparar payload básico (sin la foto final aún si es nuevo)
      const payload = {
        ...formData,
        telefono: `${countryCode}${phoneDigits}`
      };

      if (initialData?.id) {
        // Si estamos editando y hay nueva imagen, subirla
        if (imageFile) {
          currentFotoUrl = await uploadImage(initialData.id);
          payload.foto_url = currentFotoUrl;
        }
        
        const { error: updateError } = await supabase.from('empleados').update(payload).eq('id', initialData.id);
        if (updateError) throw updateError;
      } else {
        // Si es nuevo, insertar primero para obtener ID si es necesario para el nombre del archivo, 
        // o simplemente subir con un UUID.
        const tempId = crypto.randomUUID();
        if (imageFile) {
          currentFotoUrl = await uploadImage(tempId);
          payload.foto_url = currentFotoUrl;
        }

        const { data: insertData, error: insertError } = await supabase.from('empleados').insert([payload]).select();
        if (insertError) throw insertError;
        
        const newEmpleado = insertData[0];
        
        if (crearUsuario) {
          const authRes = await secondarySupabase.auth.signUp({
            email: formData.correo_electronico,
            password: 'Abc567890',
            options: { data: { nombre: formData.primer_nombre, apellido: formData.primer_apellido } }
          });

          if (authRes.data?.user) {
            const rolId = selectedRol ? Number(selectedRol) : null;
            await supabase.from('perfiles').upsert({
              id: authRes.data.user.id,
              id_empleado: newEmpleado.id,
              id_rol: rolId,
              habilitado: true,
              debe_cambiar_password: true
            });
            await supabase.rpc('confirmar_email_usuario', { user_id: authRes.data.user.id });
          }
        }
      }

      onRefresh();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div style={{ position: 'relative' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>{initialData ? 'Editar Perfil' : 'Alta de Personal'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestión centralizada del capital humano</p>
        </div>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </header>

      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 1fr) 2fr', gap: '40px', marginBottom: '40px' }}>
          {/* Photo Selection Area */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                width: '180px', 
                height: '180px', 
                borderRadius: '30px', 
                backgroundColor: 'rgba(255,255,255,0.02)',
                border: '2px dashed rgba(0, 212, 255, 0.3)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--accent-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)')}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <>
                  <Camera size={32} color="rgba(0, 212, 255, 0.4)" style={{ marginBottom: '10px' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Cargar Fotografía</span>
                </>
              )}
              <div style={{ 
                position: 'absolute', inset: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                opacity: 0, transition: 'opacity 0.3s' 
              }} onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}>
                <Upload size={24} color="white" />
              </div>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" style={{ display: 'none' }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.7rem', marginTop: '15px', textAlign: 'center' }}>Optimizado para .jpg, .png<br/>Max 2MB</p>
          </div>

          {/* Core Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="input-group">
              <label className="input-label">Primer Nombre *</label>
              <input name="primer_nombre" className="neon-input" value={formData.primer_nombre} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label">Primer Apellido *</label>
              <input name="primer_apellido" className="neon-input" value={formData.primer_apellido} onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label className="input-label">Segundo Nombre</label>
              <input name="segundo_nombre" className="neon-input" value={formData.segundo_nombre} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Segundo Apellido</label>
              <input name="segundo_apellido" className="neon-input" value={formData.segundo_apellido} onChange={handleChange} />
            </div>
            <div className="input-group">
              <label className="input-label">Documento *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select name="id_tipo_documento" className="neon-input" style={{ width: '80px', padding: '0 8px' }} value={formData.id_tipo_documento} onChange={handleChange} required>
                  <option value="">...</option>
                  {docTypes.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
                </select>
                <input name="numero_documento" className="neon-input" style={{ flex: 1 }} value={formData.numero_documento} onChange={handleChange} required />
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Teléfono *</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select name="id_pais" className="neon-input" style={{ width: '80px', padding: '0 8px' }} value={formData.id_pais} onChange={handleChange} required>
                  {countries.map(c => <option key={c.id} value={c.id}>{c.codigo_iso}</option>)}
                </select>
                <input name="telefono" type="tel" className="neon-input" style={{ flex: 1 }} value={formData.telefono} onChange={handleChange} required maxLength={10} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="input-group">
            <label className="input-label">Cargo Laboral *</label>
            <select name="id_cargo" className="neon-input" value={formData.id_cargo} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {jobs.map(j => <option key={j.id} value={j.id}>{j.nombre_cargo}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Grupo de Trabajo *</label>
            <select name="id_grupo_trabajo" className="neon-input" value={formData.id_grupo_trabajo} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.nombre_grupo}</option>)}
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Centro de Costos *</label>
            <select name="id_centro_costos" className="neon-input" value={formData.id_centro_costos} onChange={handleChange} required>
              <option value="">Seleccione...</option>
              {costCenters.map(cc => <option key={cc.id} value={cc.id}>{cc.codigo} - {cc.nombre_centro}</option>)}
            </select>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '30px' }}>
          <label className="input-label">Correo Electrónico Corporativo *</label>
          <input name="correo_electronico" type="email" className="neon-input" value={formData.correo_electronico} onChange={handleChange} required placeholder="nomina@staffcontrol.com" />
        </div>

        {/* Access Configuration */}
        <div style={{ 
          padding: '24px', 
          borderRadius: '16px', 
          background: 'rgba(0, 212, 255, 0.03)', 
          border: '1px solid rgba(0, 212, 255, 0.1)',
          marginBottom: '30px'
        }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Check size={18} /> CONFIGURACIÓN DE SEGURIDAD
          </h4>
          
          {!initialData && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <input type="checkbox" id="auth-check" checked={crearUsuario} onChange={(e) => setCrearUsuario(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} />
              <label htmlFor="auth-check" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>Habilitar acceso automático al sistema</label>
            </div>
          )}

          {!initialData && crearUsuario && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Nivel de Acceso (Rol)</label>
                <select className="neon-input" value={selectedRol} onChange={(e) => setSelectedRol(e.target.value)} required={crearUsuario}>
                  <option value="">Seleccione...</option>
                  {roles.map(r => <option key={r.id} value={r.id}>{r.nombre_rol}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Password Provisional</label>
                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
                  Abc567890 (Requiere cambio)
                </div>
              </div>
            </div>
          )}

          {initialData && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>La gestión de permisos avanzada se realiza desde el modulo de Auditoriía y Roles.</p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <input type="checkbox" id="active-check" name="esta_activo" checked={formData.esta_activo} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
          <label htmlFor="active-check" className="input-label" style={{ marginBottom: 0 }}>Estado del empleado: ACTIVO</label>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button type="submit" className="neon-btn" style={{ flex: 1, height: '50px', fontSize: '1rem', fontWeight: 800 }} disabled={loading}>
            {loading ? 'Sincronizando...' : initialData ? 'Guardar Cambios' : 'Confirmar y Guardar'}
          </button>
          <button type="button" onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', borderRadius: '12px', fontWeight: 700 }}>
            Descartar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
