import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldAlert, Lock, AlertCircle } from 'lucide-react';

const PasswordChangeForce = ({ onPasswordChanged }: { onPasswordChanged: () => void }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setError('No hay sesión activa.');
      setLoading(false);
      return;
    }

    // Actualizar contraseña en Auth
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError('Error al actualizar contraseña: ' + updateError.message);
      setLoading(false);
      return;
    }

    // Actualizar perfil para quitar la bandera
    const { error: dbError } = await supabase.from('perfiles')
      .update({ debe_cambiar_password: false })
      .eq('id', user.id);

    if (dbError) {
      setError('Contraseña actualizada, pero error validando perfil en DB: ' + dbError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onPasswordChanged();
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', padding: '20px' }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '450px', padding: '40px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', color: 'var(--accent-primary)' }}>
          <ShieldAlert size={60} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '10px' }}>Cambio de Contraseña Requerido</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '0.9rem' }}>
          Por motivos de seguridad, debes actualizar tu contraseña temporal ("Abc567890") antes de acceder al sistema.
        </p>

        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', fontSize: '0.85rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="input-group">
            <label className="input-label">Nueva Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="neon-input" 
                style={{ paddingLeft: '40px' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mínimo 8 caracteres</div>
          </div>

          <div className="input-group" style={{ marginTop: '15px' }}>
            <label className="input-label">Confirmar Contraseña</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="neon-input" 
                style={{ paddingLeft: '40px' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="neon-btn" 
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Actualizando...' : 'Cambiar y Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeForce;
