import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, XCircle } from 'lucide-react';

interface AccessLogListProps {
  refreshKey: number;
  searchTerm: string;
}

const AccessLogList: React.FC<AccessLogListProps> = ({ refreshKey, searchTerm }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, [refreshKey]);

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('logs_accesos')
      .select('*')
      .order('fecha_ingreso', { ascending: false })
      .limit(100);

    if (!error && data) {
      setLogs(data);
    }
    setLoading(false);
  };

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    const ip = (log.ip_acceso || '').toLowerCase();
    const date = new Date(log.fecha_ingreso).toLocaleString().toLowerCase();
    return ip.includes(search) || date.includes(search);
  });

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Cargando auditoría de accesos...</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
      {filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {searchTerm ? 'No se encontraron registros de auditoría.' : 'No hay actividad registrada.'}
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <th style={{ padding: '12px 10px' }}>Fecha y Hora</th>
                <th style={{ padding: '12px 10px' }}>IP de Acceso</th>
                <th style={{ padding: '12px 10px' }}>Estado</th>
                <th style={{ padding: '12px 10px' }}>ID Usuario (Auth)</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '12px 10px' }}>{new Date(log.fecha_ingreso).toLocaleString()}</td>
                  <td style={{ padding: '12px 10px', color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{log.ip_acceso || 'Desconocida'}</td>
                  <td style={{ padding: '12px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: log.exitoso ? 'var(--success)' : 'var(--error)' }}>
                      {log.exitoso ? <CheckCircle size={14} /> : <XCircle size={14} />}
                      {log.exitoso ? 'Exitoso' : 'Denegado'}
                    </div>
                  </td>
                  <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{log.id_usuario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AccessLogList;
