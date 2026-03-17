import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
// @ts-ignore
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { supabase } from '../supabaseClient';
import { Calendar as CalendarIcon, Filter, CheckCircle, Clock } from 'lucide-react';

moment.locale('es');
const localizer = momentLocalizer(moment);

interface ActivityCalendarViewProps {
  currentUser: any;
  onEdit: (log: any) => void;
  refreshKey: number;
}

const ActivityCalendarView: React.FC<ActivityCalendarViewProps> = ({ currentUser, onEdit, refreshKey }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<any>('week');

  const isAdmin = ['administrador', 'superadmin', 'supervisor'].includes((currentUser?.role_name || '').toLowerCase());

  useEffect(() => {
    if (currentUser?.id && currentUser.id !== 'undefined' && currentUser.id !== '[object Object]') {
      fetchData();
    }
  }, [currentUser, refreshKey]);

  const fetchData = async () => {
    if (!currentUser?.id || currentUser.id === 'undefined' || currentUser.id === '[object Object]') return;
    setLoading(true);
    try {
      let query = supabase
        .from('registro_actividades')
        .select(`
          *,
          tareas(nombre),
          det_tareas(nombre),
          perfiles:ejecutor_id(
            empleados(primer_nombre, primer_apellido)
          )
        `);

      if (!isAdmin) {
        query = query.eq('ejecutor_id', currentUser.id);
      }

      const { data: logsData, error: logsError } = await query;
      
      if (logsError) throw logsError;

      const formattedEvents = (logsData || []).map((log: any) => {
        const empName = log.perfiles?.empleados 
          ? `${log.perfiles.empleados.primer_nombre} ${log.perfiles.empleados.primer_apellido}`
          : 'Usuario Desconocido';
        
        let end = log.fecha_fin ? new Date(log.fecha_fin) : new Date(log.fecha_inicio);
        // Add 1 hour default duration if no end date
        if (!log.fecha_fin) {
          end = new Date(end.getTime() + 60 * 60 * 1000);
        }

        return {
          id: log.id,
          title: `${empName} - ${log.tareas?.nombre || 'Actividad'}`,
          start: new Date(log.fecha_inicio),
          end: end,
          resource: log,
          desc: log.det_tareas?.nombre || '',
          employeeInfo: empName,
          status: log.aprobado
        };
      });

      setEvents(formattedEvents);

      if (isAdmin) {
        const uniqueUsers = Array.from(new Set(formattedEvents.map(e => e.employeeInfo)));
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (newDate: Date) => {
    setDate(newDate);
  };

  const handleViewChange = (newView: any) => {
    setView(newView);
  };

  const filteredEvents = selectedUser === 'all' 
    ? events 
    : events.filter(e => e.employeeInfo === selectedUser);

  const eventStyleGetter = (event: any, _start: Date, _end: Date, _isSelected: boolean) => {
    let backgroundColor = event.status ? 'rgba(34, 197, 94, 0.2)' : 'rgba(0, 212, 255, 0.2)';
    let borderColor = event.status ? 'var(--success)' : 'var(--accent-primary)';
    
    // Asignar colores por usuario para administradores para diferenciarlos
    if (isAdmin && selectedUser === 'all') {
      const colors = ['#00d4ff', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6'];
      const index = users.indexOf(event.employeeInfo) % colors.length;
      borderColor = colors[index] || borderColor;
      backgroundColor = `${borderColor}33`; // 20% opacity
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        opacity: 0.9,
        color: 'var(--text-primary)',
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${borderColor}`,
        display: 'block',
        fontSize: '0.75rem',
        fontWeight: 600,
        textShadow: '0 0 10px rgba(0,0,0,0.5)',
        boxShadow: `0 0 5px ${borderColor}40` // soft neon glow
      }
    };
  };

  return (
    <div className="glass-card animate-fade-in" style={{ padding: '25px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: '800px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CalendarIcon size={24} color="var(--accent-primary)" />
            Cronograma de Actividades
          </h2>
          <p style={{ margin: '5px 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {isAdmin ? 'Visualización global de tiempos reportados por el equipo' : 'Visualización de tus tiempos reportados'}
          </p>
        </div>

        {isAdmin && users.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.05)', padding: '10px 15px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Filter size={18} color="var(--text-secondary)" />
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <option value="all" style={{ background: 'var(--bg-color)' }}>Todos los Empleados</option>
              {users.map((u, i) => (
                <option key={i} value={u} style={{ background: 'var(--bg-color)' }}>{u}</option>
              ))}
            </select>
          </div>
        )}
      </header>

      <div style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(255, 255, 255, 0.05)', position: 'relative' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0, 212, 255, 0.3)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ height: '700px' }} className="custom-calendar-container">
            <Calendar
              key={currentUser?.id || 'anonymous'}
              localizer={localizer}
              events={filteredEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              view={view}
              date={date}
              onNavigate={handleNavigate}
              onView={handleViewChange}
              onSelectEvent={(event) => {
                const isOwner = event.resource.ejecutor_id === currentUser?.id;
                if (isAdmin || isOwner) {
                  onEdit(event.resource);
                }
              }}
              messages={{
                next: "Sig",
                previous: "Ant",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Actividad",
                noEventsInRange: "No hay actividades registradas en este período."
              }}
              components={{
                event: (props: any) => (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '2px' }} title={`${props.event.title}\n${props.event.desc}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.event.resource.tareas?.nombre}</span>
                      {props.event.status ? <CheckCircle size={10} color="var(--success)" /> : <Clock size={10} color="var(--text-primary)" />}
                    </div>
                    {props.event.resource.det_tareas?.nombre && (
                      <span style={{ fontSize: '0.65rem', opacity: 0.8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{props.event.resource.det_tareas?.nombre}</span>
                    )}
                    {isAdmin && (
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2px', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {props.event.employeeInfo}
                      </span>
                    )}
                  </div>
                )
              }}
            />
          </div>
        )}
      </div>

      <style>{`
        /* Overriding react-big-calendar default light styles */
        .custom-calendar-container .rbc-calendar {
          font-family: inherit;
          color: var(--text-primary);
        }
        .custom-calendar-container .rbc-header {
          padding: 10px;
          background: rgba(0, 0, 0, 0.4);
          color: var(--text-secondary);
          font-weight: 700;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          text-transform: uppercase;
        }
        .custom-calendar-container .rbc-month-view,
        .custom-calendar-container .rbc-time-view,
        .custom-calendar-container .rbc-agenda-view {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.2);
        }
        .custom-calendar-container .rbc-day-bg + .rbc-day-bg {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-calendar-container .rbc-month-row + .rbc-month-row {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-calendar-container .rbc-time-content {
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-calendar-container .rbc-time-header-content {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-calendar-container .rbc-time-slot {
          border-bottom: 1px solid rgba(255, 255, 255, 0.02);
        }
        .custom-calendar-container .rbc-timeslot-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-calendar-container .rbc-day-slot .rbc-time-slot {
          border-top: 1px solid rgba(255, 255, 255, 0.02);
        }
        .custom-calendar-container .rbc-off-range-bg {
          background: rgba(0, 0, 0, 0.3);
        }
        .custom-calendar-container .rbc-today {
          background: rgba(0, 212, 255, 0.05);
        }
        .custom-calendar-container .rbc-btn-group button {
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s;
        }
        .custom-calendar-container .rbc-btn-group button:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.1);
        }
        .custom-calendar-container .rbc-btn-group button.rbc-active {
          background: var(--accent-primary);
          color: #000;
          box-shadow: 0 0 10px var(--accent-primary);
          border-color: var(--accent-primary);
          font-weight: 700;
        }
        .custom-calendar-container .rbc-toolbar button:active,
        .custom-calendar-container .rbc-toolbar button.rbc-active:hover,
        .custom-calendar-container .rbc-toolbar button.rbc-active:focus {
          background-color: var(--accent-primary);
          color: #000;
        }
        .custom-calendar-container .rbc-button-link {
          color: var(--accent-primary);
          font-weight: 700;
        }
        .custom-calendar-container .rbc-agenda-date-cell,
        .custom-calendar-container .rbc-agenda-time-cell {
          background: rgba(0,0,0,0.2);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-calendar-container .rbc-agenda-event-cell {
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default ActivityCalendarView;
