import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Download, 
  Search, 
  Calendar
} from 'lucide-react';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  isSunday, 
  parseISO, 
  differenceInMinutes, 
  addMinutes 
} from 'date-fns';

interface HoursReportViewProps {
  currentUser: any;
}

const HoursReportView: React.FC<HoursReportViewProps> = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: holidayData } = await supabase.from('dias_festivos').select('fecha');
      if (holidayData) {
        setHolidays(holidayData.map(h => h.fecha));
      }

      const { data: logData, error } = await supabase
        .from('registro_actividades')
        .select(`
          *,
          perfiles:ejecutor_id (
            id,
            empleados (id, primer_nombre, segundo_nombre, primer_apellido, segundo_apellido, correo_electronico)
          ),
          centros_costos (id, codigo, nombre_centro),
          turnos (*),
          programacion (serial, id_tarea (nombre))
        `)
        .gte('fecha_inicio', `${dateRange.start}T00:00:00`)
        .lte('fecha_inicio', `${dateRange.end}T23:59:59`)
        .order('fecha_inicio', { ascending: true });

      if (error) throw error;
      
      const processedResults = processLogs(logData || []);
      setLogs(processedResults);
    } catch (err) {
      console.error('Error fetching report data:', err);
    } finally {
      setLoading(false);
    }
  };

  const isHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return isSunday(date) || holidays.includes(dateStr);
  };

  const isNightRange = (date: Date) => {
    const hour = date.getHours();
    return hour >= 19 || hour < 6;
  };

  const calculateIntervals = (start: Date, end: Date, turno: any) => {
    const intervals: { type: string, minutes: number }[] = [];
    const current = new Date(start);
    
    const dayKey = ['dom', 'lun', 'mar', 'mie', 'jue', 'vie', 'sab'];
    const dayOfWeek = current.getDay();
    const dayShort = dayKey[dayOfWeek];

    const hInicioStr = turno?.[`h_inicio_${dayShort}`] || '08:00';
    const durationHours = turno?.[`duracion_${dayShort}`] || 8;
    
    const [h, m] = hInicioStr.split(':').map(Number);
    const shiftStart = new Date(current);
    shiftStart.setHours(h, m, 0, 0);
    
    const shiftEnd = addMinutes(shiftStart, durationHours * 60);
    const holiday = isHoliday(current);

    let temp = new Date(start);
    while (temp < end) {
      const nextMinute = addMinutes(temp, 1);
      const inShift = temp >= shiftStart && temp < shiftEnd;
      const night = isNightRange(temp);
      
      let category = '';
      if (holiday) {
        if (!inShift) category = night ? 'HENDF' : 'HEDDF';
        else category = night ? 'RNDF' : 'DF'; 
      } else {
        if (!inShift) category = night ? 'HENO' : 'HEDO';
        else category = night ? 'RNO' : 'DO';
      }

      intervals.push({ type: category, minutes: 1 });
      temp = nextMinute;
    }

    return intervals;
  };

  const processLogs = (logData: any[]) => {
    const employeeWeekOvertime: Record<string, number> = {};

    return logData.map(log => {
      const start = new Date(log.fecha_inicio);
      const end = new Date(log.fecha_fin);
      const totalMinutes = differenceInMinutes(end, start);
      
      const intervals = calculateIntervals(start, end, log.turnos);
      const totals: any = {
        DO: 0, RNO: 0, HEDO: 0, HENO: 0,
        DF: 0, RNDF: 0, HEDDF: 0, HENDF: 0,
        HEDO1053: 0, HENO1053: 0, HEDDF1053: 0, HENDF1053: 0
      };

      intervals.forEach(interval => { totals[interval.type] += 1; });

      Object.keys(totals).forEach(key => {
        totals[key] = parseFloat((totals[key] / 60).toFixed(2));
      });

      const empId = log.perfiles?.empleados?.id;
      const weekKey = `${empId}-${format(startOfWeek(start, { weekStartsOn: 1 }), 'yyyy-ww')}`;
      if (!employeeWeekOvertime[weekKey]) employeeWeekOvertime[weekKey] = 0;
      
      ['HEDO', 'HENO', 'HEDDF', 'HENDF'].forEach(key => {
        const amount = totals[key];
        if (amount > 0) {
          const currentWeekOvertime = employeeWeekOvertime[weekKey];
          const remainingLimit = Math.max(0, 10 - currentWeekOvertime);
          
          if (remainingLimit === 0) {
            totals[`${key}1053`] = amount;
            totals[key] = 0;
          } else if (amount > remainingLimit) {
            totals[`${key}1053`] = parseFloat((amount - remainingLimit).toFixed(2));
            totals[key] = remainingLimit;
            employeeWeekOvertime[weekKey] += remainingLimit;
          } else {
            employeeWeekOvertime[weekKey] += amount;
          }
        }
      });

      return { ...log, ...totals, totalHours: parseFloat((totalMinutes / 60).toFixed(2)) };
    });
  };

  const handleExport = () => {
    const headers = ['Fecha', 'Empleado', 'CC', 'Actividad', 'Turno', 'Ingreso', 'Salida', 'Total', 'DO', 'RNO', 'HEDO', 'HENO', 'DF', 'RNDF', 'HEDDF', 'HENDF', 'HEDO 1053', 'HENO 1053', 'HEDDF 1053', 'HENDF 1053'];
    const rows = logs.map(log => [
      format(parseISO(log.fecha_inicio), 'dd/MM/yyyy'),
      `${log.perfiles?.empleados?.primer_nombre} ${log.perfiles?.empleados?.primer_apellido}`,
      log.centros_costos?.codigo,
      log.programacion?.serial || 'N/A',
      log.turnos?.nombre_turno,
      format(parseISO(log.fecha_inicio), 'HH:mm'),
      format(parseISO(log.fecha_fin), 'HH:mm'),
      log.totalHours,
      log.DO, log.RNO, log.HEDO, log.HENO, log.DF, log.RNDF, log.HEDDF, log.HENDF,
      log.HEDO1053, log.HENO1053, log.HEDDF1053, log.HENDF1053
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_Horas_${dateRange.start}.csv`;
    link.click();
  };

  const setRange = (type: 'week' | 'month' | 'year') => {
    const now = new Date();
    let start, end;
    if (type === 'week') {
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
    } else if (type === 'month') {
      start = startOfMonth(now);
      end = endOfMonth(now);
    } else {
      start = startOfYear(now);
      end = endOfYear(now);
    }
    setDateRange({ start: format(start, 'yyyy-MM-dd'), end: format(end, 'yyyy-MM-dd') });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Reporte de Horas</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setRange('week')} className="mini-badge" style={{ cursor: 'pointer', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>Esta Semana</button>
          <button onClick={() => setRange('month')} className="mini-badge" style={{ cursor: 'pointer', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>Este Mes</button>
          <button onClick={() => setRange('year')} className="mini-badge" style={{ cursor: 'pointer', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.1)' }}>Este Año</button>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div className="input-group">
            <label className="input-label">Desde</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input type="date" className="neon-input" style={{ paddingLeft: '40px' }} value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Hasta</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input type="date" className="neon-input" style={{ paddingLeft: '40px' }} value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Buscar...</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} />
              <input placeholder="Empleado, CC..." className="neon-input" style={{ paddingLeft: '40px' }} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
        </div>
        <button onClick={handleExport} className="neon-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '45px' }}>
          <Download size={18} /> Exportar
        </button>
      </div>

      <div className="glass-card" style={{ padding: '0', overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{ 
              background: 'linear-gradient(90deg, var(--sidebar-bg), rgba(0, 212, 255, 0.05))', 
              color: 'var(--accent-primary)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              borderBottom: '2px solid rgba(0, 212, 255, 0.2)'
            }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>Fecha</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Empleado</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>CC</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Actividad</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Turno</th>
              <th style={{ padding: '16px', textAlign: 'center', fontWeight: 800 }}>Total</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>DO</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>RNO</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HEDO</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HENO</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>DF</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>RNDF</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HEDDF</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HENDF</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HEDO1053</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HENO1053</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HEDDF1053</th>
              <th style={{ padding: '16px', textAlign: 'center' }}>HENDF1053</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={18} style={{ padding: '40px', textAlign: 'center' }}><div className="spinner-small" style={{margin:'0 auto'}}></div></td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={18} style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No hay datos para este periodo.</td></tr>
            ) : (
              logs.filter(l => {
                const s = searchTerm.toLowerCase();
                const userName = `${l.perfiles?.empleados?.primer_nombre} ${l.perfiles?.empleados?.primer_apellido}`.toLowerCase();
                return userName.includes(s) || (l.centros_costos?.codigo || '').toLowerCase().includes(s) || (l.programacion?.serial || '').toLowerCase().includes(s);
              }).map((log, idx) => (
                <tr key={idx} style={{ 
                  backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                  borderBottom: '1px solid rgba(255,255,255,0.02)' 
                }}>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{format(parseISO(log.fecha_inicio), 'dd/MM/yy')}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{log.perfiles?.empleados?.primer_nombre} {log.perfiles?.empleados?.primer_apellido}</td>
                  <td style={{ padding: '12px 16px' }}><span className="mini-badge" style={{fontSize:'0.65rem'}}>{log.centros_costos?.codigo}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontSize: '0.7rem' }}>{log.programacion?.serial || 'S/P'}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.7, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.programacion?.id_tarea?.nombre || '-'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', opacity: 0.8 }}>{log.turnos?.nombre_turno}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: 800 }}>{log.totalHours}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.DO || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.RNO || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.HEDO || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.HENO || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.DF || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.RNDF || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.HEDDF || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>{log.HENDF || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: log.HEDO1053 > 0 ? 800 : 400, color: log.HEDO1053 > 0 ? 'var(--error)' : 'inherit' }}>{log.HEDO1053 || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: log.HENO1053 > 0 ? 800 : 400, color: log.HENO1053 > 0 ? 'var(--error)' : 'inherit' }}>{log.HENO1053 || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: log.HEDDF1053 > 0 ? 800 : 400, color: log.HEDDF1053 > 0 ? 'var(--error)' : 'inherit' }}>{log.HEDDF1053 || '-'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: log.HENDF1053 > 0 ? 800 : 400, color: log.HENDF1053 > 0 ? 'var(--error)' : 'inherit' }}>{log.HENDF1053 || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoursReportView;
