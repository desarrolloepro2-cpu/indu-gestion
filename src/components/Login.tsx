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
  const [showConflict, setShowConflict] = useState(false);
  const [conflictDevice, setConflictDevice] = useState('');
  const [sessionData, setSessionData] = useState<any>(null);

  const getDeviceName = () => {
    const ua = navigator.userAgent;
    let browser = "Browser";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";
    
    let os = "Device";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "Mac";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("iPhone")) os = "iPhone";
    
    return `${browser} on ${os}`;
  };

  const updateActiveSession = async (userId: string, sessionId: string) => {
    await supabase.from('perfiles').update({
      id_sesion_activa: sessionId,
      nombre_dispositivo_activo: getDeviceName(),
      ultimo_acceso: new Date().toISOString()
    }).eq('id', userId);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (data?.user && data.session) {
      // Check for active session in profile
      const { data: profile } = await supabase
        .from('perfiles')
        .select('id_sesion_activa, nombre_dispositivo_activo')
        .eq('id', data.user.id)
        .single();

      if (profile?.id_sesion_activa && profile.id_sesion_activa !== data.session.access_token) {
        setConflictDevice(profile.nombre_dispositivo_activo || t('dispositivo_desconocido'));
        setSessionData(data);
        setShowConflict(true);
        setLoading(false);
        return;
      }

      await updateActiveSession(data.user.id, data.session.access_token);
      
      // Log access
      await supabase.from('logs_accesos').insert({
        id_usuario: data.user.id,
        fecha_ingreso: new Date().toISOString(),
        ip_acceso: getDeviceName(),
        exitoso: true
      });
    }
    setLoading(false);
  };

  const handleConfirmConflict = async (proceed: boolean) => {
    if (!sessionData) return;
    
    if (proceed) {
      setLoading(true);
      await updateActiveSession(sessionData.user.id, sessionData.session.access_token);
      setShowConflict(false);
      setLoading(false);
      // The session is already active in Supabase Auth, so the app will redirect to Dashboard automatically
    } else {
      await supabase.auth.signOut();
      setShowConflict(false);
      setSessionData(null);
    }
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
              src="/logo_indutronica.png" 
              alt="Logo" 
              style={{ 
                width: '100%', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 12px rgba(58, 75, 224, 0.5))'
              }} 
            />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-1px' }}>
            <span style={{ color: '#3A4BE0' }}>Indu</span>
            <span style={{ color: '#94A3B8' }}>Conocimiento</span>
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

      {showConflict && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animate-scale-in" style={{
            maxWidth: '400px',
            padding: '30px',
            textAlign: 'center',
            border: '1px solid var(--accent-primary)',
            backgroundColor: 'rgba(15, 15, 25, 0.98)'
          }}>
            <h3 style={{ marginBottom: '15px', color: 'var(--accent-primary)', fontWeight: 800 }}>{t('sesion_conflicto')}</h3>
            <p style={{ marginBottom: '25px', fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
              {t('pregunta_sesion').replace('{device}', conflictDevice)}
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => handleConfirmConflict(false)}
                className="glass-card"
                style={{ padding: '10px 25px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}
              >
                {t('no')}
              </button>
              <button 
                onClick={() => handleConfirmConflict(true)}
                className="neon-btn"
                style={{ padding: '10px 35px' }}
              >
                {t('si')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
