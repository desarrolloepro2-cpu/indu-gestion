import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, User } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
            Sistema de Gestión de Conocimiento
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label className="input-label">Correo Electrónico</label>
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
            <label className="input-label">Contraseña</label>
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
            {loading ? 'Validando...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
