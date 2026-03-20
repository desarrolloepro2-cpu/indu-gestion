import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, User, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Login = () => {
  const { language, setLanguage, t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [appConfig, setAppConfig] = useState<any>(null);

  React.useEffect(() => {
    const fetchAppAppearance = async () => {
      const { data } = await supabase.from('configuracion_apariencia').select('*').eq('id', 1).single();
      if (data) setAppConfig(data);
    };
    fetchAppAppearance();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Log the access attempt
    try {
      if (!error && data?.user) {
        await supabase.from('logs_accesos').insert({
          id_usuario: data.user.id,
          fecha_ingreso: new Date().toISOString(),
          ip_acceso: 'web-client',
          exitoso: true
        });
      }
    } catch (logErr) {
      console.error('Error logging access:', logErr);
    }

    if (error) {
      setMessage(error.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '400px', 
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Language Toggle in Login */}
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <button 
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="glass-card"
            style={{ 
              padding: '6px 10px', 
              fontSize: '0.7rem', 
              fontWeight: 800,
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)'
            }}
          >
            <Globe size={14} />
            {language === 'es' ? 'ES' : 'EN'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            display: 'inline-block',
            padding: '15px',
            borderRadius: '20px',
            background: 'rgba(58, 75, 224, 0.04)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 30px rgba(58, 75, 224, 0.15)',
            marginBottom: '15px',
            width: '100%'
          }}>
            <img 
              src={appConfig?.logo_url || "/logo_indutronica.png"} 
              alt="Logo" 
              style={{ 
                width: '100%', 
                maxHeight: '100px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 12px var(--accent-glow))'
              }} 
            />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-1px', color: 'var(--text-primary)' }}>
            {appConfig?.nombre_organizacion || 'InduConocimiento'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.94rem', marginTop: '10px', fontWeight: 500 }}>
            {t('sistema_gestion')}
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">{t('correo')}</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input 
                type="email" 
                className="neon-input" 
                style={{ paddingLeft: '40px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">{t('password')}</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: 'var(--text-secondary)'
              }} />
              <input 
                type="password" 
                className="neon-input" 
                style={{ paddingLeft: '40px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {message && <p style={{ color: 'var(--error)', fontSize: '0.8rem', marginBottom: '20px' }}>{message}</p>}

          <button 
            type="submit" 
            className="neon-btn" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
          >
            {loading ? t('validando') : t('ingresar')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
