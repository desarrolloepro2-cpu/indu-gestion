import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Palette, 
  Image, 
  Save, 
  RefreshCcw, 
  CheckCircle, 
  AlertCircle,
  Type,
  Layout
} from 'lucide-react';

const CustomAppearanceForm: React.FC = () => {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [config, setConfig] = useState({
    nombre_organizacion: 'InduConocimiento',
    logo_url: '/logo_indutronica.png',
    color_primario: '#00d4ff',
    color_secundario: '#3b82f6',
    color_fondo: '#05070a',
    color_primario_claro: '#2563eb',
    color_secundario_claro: '#1d4ed8',
    color_fondo_claro: '#ffffff'
  });

  useEffect(() => {
    fetchConfig();
    
    // Escuchar cambios de tema para re-aplicar colores si es necesario
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          fetchConfig();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('configuracion_apariencia')
      .select('*')
      .eq('id', 1)
      .single();

    if (data && !error) {
      setConfig({
        nombre_organizacion: data.nombre_organizacion,
        logo_url: data.logo_url,
        color_primario: data.color_primario,
        color_secundario: data.color_secundario,
        color_fondo: data.color_fondo,
        color_primario_claro: data.color_primario_claro || '#2563eb',
        color_secundario_claro: data.color_secundario_claro || '#1d4ed8',
        color_fondo_claro: data.color_fondo_claro || '#ffffff'
      });
      applyColors({
        ...data,
        color_primario_claro: data.color_primario_claro || '#2563eb',
        color_secundario_claro: data.color_secundario_claro || '#1d4ed8',
        color_fondo_claro: data.color_fondo_claro || '#ffffff'
      });
    }
  };

  const applyColors = (data: any) => {
    let styleEl = document.getElementById('dynamic-appearance');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'dynamic-appearance';
      document.head.appendChild(styleEl);
    }

    styleEl.innerHTML = `
      :root {
        --bg-color: ${data.color_fondo || '#05070a'};
        --accent-primary: ${data.color_primario || '#00d4ff'};
        --accent-secondary: ${data.color_secundario || '#3b82f6'};
        --shadow-neon: 0 0 25px ${data.color_primario || '#00d4ff'}4d;
      }
      :root[data-theme='light'] {
        --bg-color: ${data.color_fondo_claro || '#ffffff'};
        --accent-primary: ${data.color_primario_claro || '#2563eb'};
        --accent-secondary: ${data.color_secundario_claro || '#1d4ed8'};
        --shadow-neon: 0 10px 30px ${data.color_primario_claro || '#2563eb'}26;
      }
    `;
    
    // Clean inherited overrides for immediate preview
    const root = document.documentElement;
    root.style.removeProperty('--accent-primary');
    root.style.removeProperty('--accent-secondary');
    root.style.removeProperty('--bg-color');
    root.style.removeProperty('--shadow-neon');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setConfig(prev => ({ ...prev, logo_url: publicUrl }));
    } catch (error: any) {
      alert('Error subiendo logo: ' + error.message);
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    const { error } = await supabase
      .from('configuracion_apariencia')
      .update({
        ...config,
        updated_at: new Date()
      })
      .eq('id', 1);

    if (error) {
      console.error(error);
      setSaveStatus('error');
    } else {
      setSaveStatus('success');
      applyColors(config);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const resetToDefault = () => {
    const defaults = {
      nombre_organizacion: 'InduConocimiento',
      logo_url: '/logo_indutronica.png',
      color_primario: '#00d4ff',
      color_secundario: '#3b82f6',
      color_fondo: '#05070a',
      color_primario_claro: '#2563eb',
      color_secundario_claro: '#1d4ed8',
      color_fondo_claro: '#ffffff'
    };
    setConfig(defaults);
    applyColors(defaults);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 500px) 1fr', gap: '40px' }}>
        
        {/* Formulario de Configuración */}
        <form onSubmit={handleSave} className="glass-card" style={{ padding: '30px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Palette color="var(--accent-primary)" size={28} />
              Personalización Visual
            </h3>
            <p className="sub-index">Configura la identidad visual de tu plataforma corporativa</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Nombre e Identidad */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Type size={16} /> Nombre de la Organización
              </label>
              <input 
                name="nombre_organizacion"
                className="neon-input"
                value={config.nombre_organizacion}
                onChange={handleChange}
                placeholder="Ej: Indutrónica S.A.S"
              />
            </div>

            {/* Logo File Upload */}
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image size={16} /> Logo de la Empresa (PNG/SVG)
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ 
                  width: '100%', 
                  height: '100px', 
                  borderRadius: '12px', 
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '2px dashed rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px'
                }}>
                  <img 
                    src={config.logo_url} 
                    alt="Current Logo" 
                    style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }}
                    onError={(e) => (e.currentTarget.src = '/logo_indutronica.png')}
                  />
                </div>
                <label className="neon-btn" style={{ 
                  textAlign: 'center', 
                  fontSize: '0.75rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px',
                  cursor: uploadingLogo ? 'not-allowed' : 'pointer',
                  opacity: uploadingLogo ? 0.6 : 1
                }}>
                  {uploadingLogo ? <RefreshCcw className="animate-spin" size={16} /> : <Image size={16} />}
                  {uploadingLogo ? 'Subiendo...' : 'Cargar Nuevo Archivo'}
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploadingLogo} />
                </label>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '10px 0' }} />
            
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Tema Oscuro</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Color Primario</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" name="color_primario" value={config.color_primario} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input name="color_primario" className="neon-input" value={config.color_primario} onChange={handleChange} style={{ fontSize: '0.8rem', height: '40px', fontFamily: 'monospace' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Color Secundario</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" name="color_secundario" value={config.color_secundario} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input name="color_secundario" className="neon-input" value={config.color_secundario} onChange={handleChange} style={{ fontSize: '0.8rem', height: '40px', fontFamily: 'monospace' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Color de Fondo Principal</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" name="color_fondo" value={config.color_fondo} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input name="color_fondo" className="neon-input" value={config.color_fondo} onChange={handleChange} style={{ fontSize: '0.8rem', height: '40px', fontFamily: 'monospace' }} />
                </div>
              </div>
            </div>

            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '20px' }}>Tema Claro</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="input-group">
                <label className="input-label">Color Primario</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" name="color_primario_claro" value={config.color_primario_claro} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input name="color_primario_claro" className="neon-input" value={config.color_primario_claro} onChange={handleChange} style={{ fontSize: '0.8rem', height: '40px', fontFamily: 'monospace' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Color Secundario</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" name="color_secundario_claro" value={config.color_secundario_claro} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input name="color_secundario_claro" className="neon-input" value={config.color_secundario_claro} onChange={handleChange} style={{ fontSize: '0.8rem', height: '40px', fontFamily: 'monospace' }} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Color de Fondo Principal</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input type="color" name="color_fondo_claro" value={config.color_fondo_claro} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }} />
                  <input name="color_fondo_claro" className="neon-input" value={config.color_fondo_claro} onChange={handleChange} style={{ fontSize: '0.8rem', height: '40px', fontFamily: 'monospace' }} />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '10px' }}>
              <button 
                type="submit" 
                className="neon-btn" 
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                disabled={saveStatus === 'saving'}
              >
                {saveStatus === 'saving' ? (
                  <RefreshCcw className="animate-spin" size={20} />
                ) : (
                  <Save size={20} />
                )}
                {saveStatus === 'saving' ? 'Guardando...' : 'Aplicar Cambios'}
              </button>
              
              <button 
                type="button" 
                onClick={resetToDefault}
                className="glass-card" 
                style={{ padding: '0 20px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--text-secondary)' }}
                title="Resetear a valores por defecto"
              >
                <RefreshCcw size={20} />
              </button>
            </div>

            {saveStatus === 'success' && (
              <div className="animate-scale-in" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <CheckCircle size={18} /> ¡Configuración guardada y aplicada con éxito!
              </div>
            )}
            
            {saveStatus === 'error' && (
              <div className="animate-scale-in" style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle size={18} /> Error al guardar la configuración. Revisa tus permisos.
              </div>
            )}
          </div>
        </form>

        {/* Vista Previa */}
        <section>
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.1rem', fontWeight: 800 }}>
              <Layout size={20} color="var(--accent-primary)" />
              Vista Previa en Tiempo Real
            </h4>
          </div>

          <div 
            className="glass-card" 
            style={{ 
              height: '400px', 
              overflow: 'hidden', 
              border: '4px solid #1e293b', 
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
              backgroundColor: config.color_fondo,
              position: 'relative'
            }}
          >
            {/* Header Mini Simulado */}
            <div style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={config.logo_url} alt="Logo" style={{ height: '24px', filter: `drop-shadow(0 0 5px ${config.color_primario}66)` }} onError={(e) => (e.currentTarget.src = '/logo_indutronica.png')} />
                <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{config.nombre_organizacion}</span>
              </div>
              <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: config.color_primario + '33', border: `1px solid ${config.color_primario}` }} />
            </div>

            {/* Sidebar Mini Simulado */}
            <div style={{ position: 'absolute', left: 0, top: '54px', bottom: 0, width: '60px', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '15px', padding: '15px 10px', backgroundColor: 'rgba(0,0,0,0.2)' }}>
              {[1,2,3,4].map(i => (
                <div key={i} style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', backgroundColor: i === 1 ? config.color_primario + '22' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: i === 1 ? config.color_primario : 'rgba(255,255,255,0.1)' }} />
                </div>
              ))}
            </div>

            {/* Contenido Mini Simulado */}
            <div style={{ marginLeft: '60px', padding: '30px' }}>
              <div style={{ width: '60%', height: '24px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '15px' }} />
              <div style={{ width: '90%', height: '12px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '24px' }} />
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ padding: '15px', borderRadius: '12px', backgroundColor: config.color_primario + '11', border: `1px solid ${config.color_primario}33` }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: config.color_primario, marginBottom: '10px' }} />
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                </div>
                <div style={{ padding: '15px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: config.color_secundario, marginBottom: '10px' }} />
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />
                </div>
              </div>

              <div style={{ 
                marginTop: '30px', 
                height: '40px', 
                width: '100%', 
                borderRadius: '8px', 
                background: `linear-gradient(135deg, ${config.color_primario}, ${config.color_secundario})`,
                boxShadow: `0 4px 15px ${config.color_primario}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '0.7rem',
                fontWeight: 800
              }}>
                BOTÓN DE ACCIÓN
              </div>
            </div>
          </div>

          <div style={{ marginTop: '20px', padding: '16px', borderRadius: '12px', backgroundColor: 'rgba(0, 212, 255, 0.05)', border: '1px solid rgba(0, 212, 255, 0.1)' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              <strong>Nota:</strong> Los cambios aplicados se verán reflejados en todos los usuarios de la plataforma de forma inmediata una vez que guarden la configuración.
            </p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default CustomAppearanceForm;
