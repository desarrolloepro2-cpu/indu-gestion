import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, AlertCircle, Mail, Clock, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const SystemConfigForm: React.FC = () => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [config, setConfig] = useState<any>({
    proveedor_correo: 'gmail',
    correo_remitente: '',
    password_app: '',
    dias_inactividad_alerta: 3,
    horas_repeticion_alerta: 6,
    dias_envio_activos: '1,2,3,4,5',
    asunto_alerta_inactividad: '',
    mensaje_alerta_inactividad: '',
    horas_repeticion_aprobacion_alerta: 24,
    asunto_alerta_aprobacion: '',
    mensaje_alerta_aprobacion: ''
  });

  const daysOfWeek = [
    { value: '1', label: 'Lu' },
    { value: '2', label: 'Ma' },
    { value: '3', label: 'Mi' },
    { value: '4', label: 'Ju' },
    { value: '5', label: 'Vi' },
    { value: '6', label: 'Sá' },
    { value: '0', label: 'Do' }
  ];

  const toggleDay = (dayValue: string) => {
    let currentDays = (config.dias_envio_activos || '1,2,3,4,5').split(',').filter(Boolean);
    if (currentDays.includes(dayValue)) {
      currentDays = currentDays.filter((d: string) => d !== dayValue);
    } else {
      currentDays.push(dayValue);
    }
    setConfig((prev: any) => ({ ...prev, dias_envio_activos: currentDays.join(',') }));
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase.from('configuracion_sistema').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) setConfig(data);
    } catch (err: any) {
      console.error('Error fetching config:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { ...config, id: 1 };
      const { error } = await supabase.from('configuracion_sistema').upsert(payload);
      if (error) throw error;
      setSuccess('Configuración guardada exitosamente.');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div style={{ color: 'var(--text-secondary)' }}>Cargando...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {error && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
          <AlertCircle size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
        </div>
      )}
      {success && (
        <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <Check size={20} />
          <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{success}</span>
        </div>
      )}

      {/* Tarjeta SMTP */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Mail size={22} /> {t('config_email')}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '25px' }}>
          Configura la cuenta de correo que el sistema usará para enviar notificaciones automáticas y alertas por inactividad.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="input-group">
            <label className="input-label">Proveedor de Correo</label>
            <select name="proveedor_correo" className="neon-input" value={config.proveedor_correo || 'gmail'} onChange={handleChange}>
              <option value="gmail">Gmail</option>
              <option value="office365">Office 365 (Outlook/Microsoft)</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Correo Remitente</label>
            <input name="correo_remitente" type="email" className="neon-input" value={config.correo_remitente || ''} onChange={handleChange} placeholder="ej. notificaciones@empresa.com" />
          </div>
          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label">Contraseña de Aplicación (App Password)</label>
            <input name="password_app" type="password" className="neon-input" value={config.password_app || ''} onChange={handleChange} placeholder="••••••••••••••••" />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Para Gmail u Office, debes usar una contraseña de aplicación de 16 letras generada desde los ajustes de seguridad de la cuenta. No usar tu contraseña habitual.</span>
          </div>
        </div>
      </div>

      {/* Tarjeta Alertas Inactividad */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-secondary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Clock size={22} /> Reglas de Recordatorio por Inactividad
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '25px' }}>
          Estas reglas aplican un límite de tiempo a los usuarios para actualizar su "Registro de Actividades". El sistema envía de forma automatizada (CRON) estas alertas.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="input-group">
            <label className="input-label">Límite de Días sin Actividad</label>
            <input name="dias_inactividad_alerta" type="number" min="1" className="neon-input" value={config.dias_inactividad_alerta || 3} onChange={handleChange} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Ej: 3 (Enviará la primera alerta tras 3 días sin registrar nada).</span>
          </div>
          <div className="input-group">
            <label className="input-label">Frecuencia de Repetición (Horas)</label>
            <input name="horas_repeticion_alerta" type="number" min="1" className="neon-input" value={config.horas_repeticion_alerta || 6} onChange={handleChange} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Ej: 6 (Si el usuario sigue inactivo, seguirá enviando la alerta cada 6 horas).</span>
          </div>

          <div className="input-group" style={{ gridColumn: '1 / -1' }}>
            <label className="input-label" style={{ display: 'block', marginBottom: '8px' }}>Días Permitidos para Enviar Alertas</label>
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {daysOfWeek.map(day => {
                const currentDays = (config.dias_envio_activos || '1,2,3,4,5').split(',').filter(Boolean);
                const isChecked = currentDays.includes(day.value);
                return (
                  <label key={day.value} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem', color: isChecked ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleDay(day.value)}
                      style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    {day.label}
                  </label>
                );
              })}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'block' }}>Si el día actual no está marcado, las alertas entrarán en pausa.</span>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Asunto del Correo de Alerta</label>
          <input name="asunto_alerta_inactividad" type="text" className="neon-input" value={config.asunto_alerta_inactividad || ''} onChange={handleChange} />
        </div>

        <div className="input-group">
          <label className="input-label">Cuerpo del Mensaje (Soporta HTML)</label>
          <textarea 
            name="mensaje_alerta_inactividad" 
            className="neon-input" 
            style={{ height: '150px', resize: 'vertical' }} 
            value={config.mensaje_alerta_inactividad || ''} 
            onChange={handleChange} 
            placeholder="<p>Hola,</p><p>Actualiza tus actividades.</p>" 
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
            <strong>Variables disponibles:</strong> %DIAS_SIN_ACTIVIDAD%
          </span>
        </div>
      </div>

      {/* Tarjeta Alertas Aprobacion Supervisor */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--success)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Check size={22} /> Reglas de Aprobación del Supervisor
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '25px' }}>
          Configura cada cuántas horas el sistema le enviará un correo a los supervisores recordándoles que tienen registros de actividad en espera de su aprobación.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div className="input-group">
            <label className="input-label">Frecuencia de Repetición (Horas)</label>
            <input name="horas_repeticion_aprobacion_alerta" type="number" min="1" className="neon-input" value={config.horas_repeticion_aprobacion_alerta || 24} onChange={handleChange} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>Ej: 24 (Alerta diaria).</span>
          </div>
        </div>

        <div className="input-group" style={{ marginBottom: '20px' }}>
          <label className="input-label">Asunto del Correo de Alerta</label>
          <input name="asunto_alerta_aprobacion" type="text" className="neon-input" value={config.asunto_alerta_aprobacion || ''} onChange={handleChange} />
        </div>

        <div className="input-group">
          <label className="input-label">Cuerpo del Mensaje (Soporta HTML)</label>
          <textarea 
            name="mensaje_alerta_aprobacion" 
            className="neon-input" 
            style={{ height: '150px', resize: 'vertical' }} 
            value={config.mensaje_alerta_aprobacion || ''} 
            onChange={handleChange} 
            placeholder="<p>Hola,</p><p>Tienes %TOTAL_PENDIENTES% registros pendientes.</p>" 
          />
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '5px', display: 'block' }}>
            <strong>Variables disponibles:</strong> %TOTAL_PENDIENTES%
          </span>
        </div>
      </div>

      {/* Tarjeta Notificaciones en Tiempo Real */}
      <div className="glass-card" style={{ padding: '30px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-primary)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Check size={22} style={{ color: 'var(--accent-secondary)' }} /> {t('msg_notif_auto')}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '25px' }}>
          {t('desc_notif_auto')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
            <input 
              type="checkbox" 
              name="notificar_responsable_actividad"
              checked={config.notificar_responsable_actividad !== false} 
              onChange={(e) => setConfig((prev: any) => ({ ...prev, notificar_responsable_actividad: e.target.checked }))} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} 
            />
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block' }}>{t('notificar_responsable')}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{language === 'es' ? 'Envía una confirmación al técnico o ingeniero que realizó el trabajo.' : 'Sends a confirmation to the technician or engineer who performed the work.'}</span>
            </div>
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
            <input 
              type="checkbox" 
              name="notificar_supervisor_actividad"
              checked={config.notificar_supervisor_actividad === true} 
              onChange={(e) => setConfig((prev: any) => ({ ...prev, notificar_supervisor_actividad: e.target.checked }))} 
              style={{ width: '20px', height: '20px', accentColor: 'var(--accent-primary)' }} 
            />
            <div>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, display: 'block' }}>{t('notificar_supervisor')}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{language === 'es' ? 'Envía una copia inmediata al supervisor asignado en la programación para su conocimiento.' : 'Sends an immediate copy to the assigned supervisor in the schedule for their information.'}</span>
            </div>
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button 
          onClick={handleSave} 
          className="neon-btn" 
          disabled={loading}
          style={{ width: '200px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
        >
          <Save size={20} />
          {loading ? 'Guardando...' : 'Guardar Ajustes'}
        </button>
      </div>

    </div>
  );
};

export default SystemConfigForm;
