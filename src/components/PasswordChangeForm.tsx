import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface PasswordChangeFormProps {
  onClose: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword.length < 8) {
      setError(t('password_min_length'));
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('las_passwords_no_coinciden'));
      setLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

    if (updateError) {
      setError(`${t('error_actualizar_password')}: ${updateError.message}`);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => {
      onClose();
    }, 2000);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: 'rgba(58, 75, 224, 0.1)', 
          padding: '12px', 
          borderRadius: '12px',
          color: 'var(--accent-primary)'
        }}>
          <Shield size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{t('cambiar_password')}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Actualiza tus credenciales de acceso</p>
        </div>
      </div>

      {error && (
        <div className="animate-scale-in" style={{ 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          color: 'var(--error)', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          border: '1px solid rgba(239, 68, 68, 0.2)'
        }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{error}</span>
        </div>
      )}

      {success && (
        <div className="animate-scale-in" style={{ 
          backgroundColor: 'rgba(34, 197, 94, 0.1)', 
          color: 'var(--success)', 
          padding: '16px', 
          borderRadius: '12px', 
          marginBottom: '20px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          border: '1px solid rgba(34, 197, 94, 0.2)'
        }}>
          <CheckCircle2 size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{t('password_actualizada')}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label">{t('nueva_password')}</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="password" 
              className="neon-input" 
              style={{ paddingLeft: '45px' }}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading || success}
              placeholder="••••••••"
            />
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '6px' }}>{t('password_min_length')}</div>
        </div>

        <div className="input-group" style={{ marginTop: '20px' }}>
          <label className="input-label">{t('confirmar_password')}</label>
          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="password" 
              className="neon-input" 
              style={{ paddingLeft: '45px' }}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading || success}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
          <button 
            type="button" 
            onClick={onClose}
            className="neon-btn-secondary"
            style={{ flex: 1 }}
            disabled={loading}
          >
            {t('cancelar')}
          </button>
          <button 
            type="submit" 
            className="neon-btn" 
            style={{ flex: 2 }}
            disabled={loading || success}
          >
            {loading ? '...' : t('actualizar_password')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
