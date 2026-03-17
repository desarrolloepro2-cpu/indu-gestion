import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Users, 
  Calendar, 
  Clock, 
  LogOut,
  LayoutDashboard,
  Plus,
  DollarSign,
  Sun,
  Moon,
  Search,
  CheckSquare,
  User,
  Shield,
  Activity,
  Bell,
  History,
  Briefcase,
  Layers,
  ClipboardList,
  ListTodo,
  FileText,
  Palmtree
} from 'lucide-react';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import CostCenterList from './CostCenterList';
import CostCenterForm from './CostCenterForm';
import ProgramacionList from './ProgramacionList';
import ProgramacionForm from './ProgramacionForm';
import JobList from './JobList';
import JobForm from './JobForm';
import GroupList from './GroupList';
import GroupForm from './GroupForm';
import ShiftList from './ShiftList';
import HolidayList from './HolidayList';
import HolidayForm from './HolidayForm';
import TaskList from './TaskList';
import TaskForm from './TaskForm';
import TaskDetailList from './TaskDetailList';
import TaskDetailForm from './TaskDetailForm';
import NovedadList from './NovedadList';
import NovedadForm from './NovedadForm';
import ShiftForm from './ShiftForm';
import RoleList from './RoleList';
import RoleForm from './RoleForm';
import UserProfileList from './UserProfileList';
import UserProfileForm from './UserProfileForm';
import AccessLogList from './AccessLogList';
import ActivityLogList from './ActivityLogList';
import ActivityLogForm from './ActivityLogForm';
import ActivityCalendarView from './ActivityCalendarView';

interface DashboardProps {
  session: any;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'employees' | 'costs' | 'schedule' | 'roles' | 'shifts' | 'logs' | 'jobs' | 'groups' | 'holidays' | 'tasks' | 'task-details' | 'novedades' | 'users' | 'activity-log' | 'activity-calendar'>(() => (localStorage.getItem('dashboardTab') as any) || 'summary');

  useEffect(() => {
    localStorage.setItem('dashboardTab', activeTab);
  }, [activeTab]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>(null);

  // Stats State
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeCostCenters: 0,
    overallProgress: 0,
    pendingTasks: 0
  });
  const [recentAssignments, setRecentAssignments] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      const fetchUser = async () => {
        const { data, error: userError } = await supabase.from('perfiles').select(`
          id,
          id_rol,
          empleados ( * ),
          roles ( nombre_rol, permisos )
        `).eq('id', session.user.id).single();
        
        if (data && !userError) {
          const profile = data as any;
          if (profile.empleados) {
            // Unify data for the current user object
            const empData = { ...profile.empleados, role_name: profile.roles?.nombre_rol, perfil_id: profile.id };
            setCurrentUser(empData);
          } else {
            setCurrentUser({ correo_electronico: session.user.email, primer_nombre: 'Admin (Sin Perfil)', foto_url: null, role_name: profile.roles?.nombre_rol, perfil_id: profile.id, id: session.user.id });
          }
          
          if (profile.roles && profile.roles.permisos) {
            setPermissions(profile.roles.permisos);
          } else {
            setPermissions({});
          }
        }
      };
      fetchUser();
    }
  }, [session]);

  const hasPermission = (module: string, action: string = 'ver') => {
    if (!permissions) return false;
    // Permisos definidos como: { "empleados": ["ver", "crear", "editar", "eliminar"], ... }
    return permissions[module]?.includes(action) || false;
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Fetch Stats Effect
  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const [empRes, ccRes, progRes, recentRes] = await Promise.all([
        supabase.from('empleados').select('id', { count: 'exact' }).eq('esta_activo', true),
        supabase.from('centros_costos').select('id', { count: 'exact' }).eq('habilitado', true),
        supabase.from('programacion').select('porcentaje_ejecucion'),
        supabase.from('programacion').select(`
          id,
          serial,
          porcentaje_ejecucion,
          id_tarea (nombre),
          id_responsable (primer_nombre, primer_apellido, foto_url)
        `).order('created_at', { ascending: false }).limit(5)
      ]);

      const totalEmp = empRes.count || 0;
      const totalCC = ccRes.count || 0;
      
      let progAvg = 0;
      let pending = 0;
      if (progRes.data && progRes.data.length > 0) {
        const filteredData = progRes.data.filter(t => t.porcentaje_ejecucion !== null);
        if (filteredData.length > 0) {
          const sum = filteredData.reduce((acc, curr) => acc + (curr.porcentaje_ejecucion || 0), 0);
          progAvg = Math.round(sum / filteredData.length);
        }
        pending = progRes.data.filter(t => (t.porcentaje_ejecucion || 0) < 100).length;
      }

      setStats({
        totalEmployees: totalEmp,
        activeCostCenters: totalCC,
        overallProgress: progAvg,
        pendingTasks: pending
      });
      setRecentAssignments((recentRes.data || []) as any[]);
      setLoadingStats(false);
    };

    if (activeTab === 'summary') {
      fetchStats();
    }
  }, [activeTab, refreshKey]);

  const SidebarItem = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <div 
      onClick={() => setActiveTab(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 20px',
        cursor: 'pointer',
        borderRadius: '12px',
        color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
        backgroundColor: activeTab === id ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: '4px',
        position: 'relative',
        overflow: 'hidden'
      }}
      className={activeTab === id ? 'active-sidebar-item' : 'sidebar-item'}
    >
      <Icon size={18} style={{ 
        filter: activeTab === id ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))' : 'none',
        transition: 'all 0.3s'
      }} />
      <span style={{ fontWeight: activeTab === id ? 700 : 500, fontSize: '0.9rem' }}>{label}</span>
      {activeTab === id && (
        <div style={{ 
          position: 'absolute', 
          right: 0, top: '20%', bottom: '20%', width: '3px', 
          backgroundColor: 'var(--accent-primary)',
          borderRadius: '3px 0 0 3px',
          boxShadow: '0 0 10px var(--accent-primary)'
        }} />
      )}
    </div>
  );

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const renderForm = () => {
    const props = { onClose: handleCloseForm, onRefresh: triggerRefresh, initialData: editingItem };
    
    // Prioritize form by editing item properties for context-independent editing
    if (editingItem && editingItem.primer_nombre) return <EmployeeForm {...props} />;
    if (editingItem && editingItem.nombre_centro) return <CostCenterForm {...props} />;
    if (editingItem && editingItem.serial) return <ProgramacionForm {...props} />;

    if (activeTab === 'employees') return <EmployeeForm {...props} />;
    if (activeTab === 'costs') return <CostCenterForm {...props} />;
    if (activeTab === 'schedule') return <ProgramacionForm {...props} />;
    if (activeTab === 'jobs') return <JobForm {...props} />;
    if (activeTab === 'groups') return <GroupForm {...props} />;
    if (activeTab === 'shifts') return <ShiftForm {...props} />;
    if (activeTab === 'holidays') return <HolidayForm {...props} />;
    if (activeTab === 'tasks') return <TaskForm {...props} />;
    if (activeTab === 'task-details') return <TaskDetailForm {...props} />;
    if (activeTab === 'novedades') return <NovedadForm {...props} />;
    if (activeTab === 'roles') return <RoleForm {...props} />;
    if (activeTab === 'users') return <UserProfileForm {...props} />;
    if (activeTab === 'activity-log' || activeTab === 'activity-calendar') return <ActivityLogForm log={editingItem} onSave={() => { setIsFormOpen(false); triggerRefresh(); setEditingItem(null); }} onCancel={handleCloseForm} currentUser={currentUser} />;
    return null;
  };

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-color)',
      position: 'relative'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 20px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 50
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '12px', 
          marginBottom: '50px',
          padding: '0 10px',
          width: '100%'
        }}>
          <div style={{
            position: 'relative',
            padding: '10px',
            borderRadius: '16px',
            background: 'rgba(58, 75, 224, 0.03)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 0 20px rgba(58, 75, 224, 0.1)',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <img 
              src="/logo_indutronica.png" 
              alt="Logo" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px rgba(58, 75, 224, 0.4))'
              }} 
            />
          </div>
          <h1 style={{ 
            fontSize: '1.4rem', 
            fontWeight: 800, 
            letterSpacing: '-1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%'
          }}>
            <span style={{ color: '#3A4BE0' }}>Indu</span>
            <span style={{ color: '#94A3B8' }}>Conocimiento</span>
          </h1>
        </div>

        <nav style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
          <div style={{ padding: '0 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Operaciones Centrales
          </div>
          <SidebarItem id="summary" icon={LayoutDashboard} label="Panel General" />
          {hasPermission('empleados') && <SidebarItem id="employees" icon={Users} label="Gestión de Talento" />}
          {hasPermission('cargos') && <SidebarItem id="jobs" icon={Briefcase} label="Catálogo de Cargos" />}
          {hasPermission('costos') && <SidebarItem id="costs" icon={DollarSign} label="Centros de Costo" />}
          {hasPermission('grupos') && <SidebarItem id="groups" icon={Layers} label="Grupos de Trabajo" />}
          
          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Seguimiento Operativo
          </div>
          {hasPermission('programacion') && <SidebarItem id="schedule" icon={Calendar} label="Programación Diaria" />}
          {hasPermission('turnos') && <SidebarItem id="shifts" icon={Clock} label="Jornadas Laborales" />}
          {hasPermission('festivos') && <SidebarItem id="holidays" icon={Palmtree} label="Días Festivos" />}
          {hasPermission('tareas') && <SidebarItem id="tasks" icon={ClipboardList} label="Grupos de Tareas" />}
          {hasPermission('det_tareas') && <SidebarItem id="task-details" icon={ListTodo} label="Subtareas Detalladas" />}
          {hasPermission('novedades') && <SidebarItem id="novedades" icon={Activity} label="Gestión de Novedades" />}

          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Trabajo Diario
          </div>
          <SidebarItem id="activity-log" icon={CheckSquare} label="Mis Actividades" />
          <SidebarItem id="activity-calendar" icon={Calendar} label="Calendario de Trabajo" />

          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Sistemas y Auditoría
          </div>
          {hasPermission('usuarios') && <SidebarItem id="users" icon={User} label="Gestión de Usuarios" />}
          {hasPermission('roles') && <SidebarItem id="roles" icon={Shield} label="Seguridad y Roles" />}
          {hasPermission('logs') && <SidebarItem id="logs" icon={History} label="Auditoría de Acceso" />}
          {hasPermission('reportes') && <SidebarItem id="summary" icon={FileText} label="Reportes Maestros" />}
        </nav>

        {/* User Card */}
        <div 
          className="glass-card" 
          onClick={() => currentUser?.id && handleEdit(currentUser)}
          style={{ 
            marginTop: 'auto', 
            padding: '16px',
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            cursor: 'pointer'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ 
                width: '42px', 
                height: '42px', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                overflow: 'hidden'
              }}>
                {currentUser?.foto_url ? (
                  <img src={currentUser.foto_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <User size={20} color="var(--accent-primary)" />
                )}
              </div>
              <div style={{ 
                position: 'absolute', 
                bottom: '-2px', 
                right: '-2px', 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--success)',
                border: '2px solid var(--sidebar-bg)'
              }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {currentUser ? `${currentUser.primer_nombre} ${currentUser.primer_apellido || ''}` : 'Conectando...'}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}>
                Sesión Activa • {currentUser?.role_name || 'Personal'}
              </div>
            </div>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()}
            style={{ 
              width: '100%', 
              marginTop: '15px', 
              padding: '8px', 
              backgroundColor: 'rgba(244, 63, 94, 0.1)', 
              color: '#f43f5e',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={14} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start', 
          marginBottom: '50px' 
        }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              {activeTab === 'summary' && 'Panel Ejecutivo'}
              {activeTab === 'employees' && 'Gestión de Personal'}
              {activeTab === 'costs' && 'Control de Presupuesto'}
              {activeTab === 'schedule' && 'Planeación de Actividades'}
              {activeTab === 'roles' && 'Seguridad Sistémica'}
              {activeTab === 'users' && 'Gestión de Identidades'}
              {activeTab === 'logs' && 'Auditoría de Operaciones'}
              {activeTab === 'shifts' && 'Gestión de Horarios'}
              {activeTab === 'activity-log' && 'Mis Actividades'}
              {activeTab === 'activity-calendar' && 'Calendario de Actividades'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '6px', fontSize: '1rem' }}>
              Inteligencia Operativa e Inventario de Conocimiento
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.03)',
              borderRadius: '12px',
              padding: '10px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              border: '1px solid var(--border-color)'
            }}>
              <Search size={18} color="rgba(255,255,255,0.2)" />
              <input 
                placeholder="Buscar en el sistema..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'white', 
                  outline: 'none',
                  fontSize: '0.9rem',
                  minWidth: '250px'
                }} 
              />
            </div>
            
            <button className="glass-card" style={{ padding: '12px', cursor: 'pointer', border: 'none' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={20} color="var(--accent-primary)" /> : <Moon size={20} color="var(--accent-primary)" />}
            </button>
            <button className="glass-card" style={{ padding: '12px', cursor: 'pointer', border: 'none' }}>
              <Bell size={20} color="var(--text-secondary)" />
            </button>

            {/* Profile Avatar Top Right */}
            <div 
              onClick={() => currentUser?.id && handleEdit(currentUser)}
              style={{ 
                width: '45px', 
                height: '45px', 
                borderRadius: '12px', 
                border: '2px solid var(--accent-primary)',
                boxShadow: '0 0 10px rgba(0, 212, 255, 0.2)',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              {currentUser?.foto_url ? (
                <img src={currentUser.foto_url} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ 
                  width: '100%', height: '100%', 
                  backgroundColor: 'var(--surface-color)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <User size={24} color="var(--accent-primary)" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* New Button logic */}
        {(activeTab === 'employees' || activeTab === 'costs' || activeTab === 'schedule' || activeTab === 'activity-log' || activeTab === 'activity-calendar' || activeTab === 'shifts') && (
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            {(activeTab === 'activity-log' || activeTab === 'activity-calendar' || hasPermission(activeTab === 'schedule' ? 'programacion' : (activeTab === 'costs' ? 'costos' : (activeTab === 'employees' ? 'empleados' : (activeTab === 'shifts' ? 'turnos' : activeTab))), 'crear')) && (
              <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="neon-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Plus size={20} />
                <span>Registrar Nuevo</span>
              </button>
            )}
          </div>
        )}

        <section className="animate-fade-in" key={refreshKey + searchTerm}>
          {activeTab === 'summary' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Personal Activo</div>
                  <Users size={18} color="var(--accent-primary)" />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loadingStats ? '...' : stats.totalEmployees} <span style={{ fontSize: '1rem', color: 'var(--success)' }}>En Nómina</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Centros de Negocio</div>
                  <DollarSign size={18} color="var(--accent-secondary)" />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loadingStats ? '...' : stats.activeCostCenters} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Operativos</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-secondary)' }} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>Progreso Global</div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loadingStats ? '...' : stats.overallProgress}% <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>Ejecutado</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
                  <div style={{ width: `${stats.overallProgress}%`, height: '100%', backgroundColor: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                </div>
              </div>
            </div>

            {/* Recent Activity / Fichas de Resumen */}
            <div style={{ marginTop: '50px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Activity size={20} color="var(--accent-primary)" />
                  Asignaciones Tácticas Recientes
                </h3>
                <button 
                  onClick={() => setActiveTab('schedule')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Ver toda la programación →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {loadingStats ? (
                  [1,2,3].map(i => <div key={i} className="glass-card" style={{ height: '100px', opacity: 0.1 }} />)
                ) : (
                  // We'll need to fetch recent items in the useEffect
                  recentAssignments.map((item: any) => (
                    <div key={item.id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', border: '2px solid var(--accent-primary)', overflow: 'hidden' }}>
                          {item.id_responsable?.foto_url ? (
                            <img src={item.id_responsable.foto_url} alt="Rec" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '100%', height: '100%', backgroundColor: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <User size={20} color="var(--text-secondary)" />
                            </div>
                          )}
                        </div>
                        <div style={{ position: 'absolute', right: '-4px', bottom: '-4px', backgroundColor: 'var(--bg-color)', borderRadius: '50%', padding: '2px' }}>
                          {item.porcentaje_ejecucion === 100 ? <CheckSquare size={14} color="var(--success)" /> : <Clock size={14} color="var(--accent-primary)" />}
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '2px' }}>{item.serial}</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.id_tarea?.nombre || 'Actividad'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {item.id_responsable?.primer_nombre} {item.id_responsable?.primer_apellido}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: item.porcentaje_ejecucion === 100 ? 'var(--success)' : 'var(--text-primary)' }}>
                          {item.porcentaje_ejecucion}%
                        </div>
                        <div style={{ width: '60px', height: '4px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginTop: '4px' }}>
                           <div style={{ width: `${item.porcentaje_ejecucion}%`, height: '100%', backgroundColor: item.porcentaje_ejecucion === 100 ? 'var(--success)' : 'var(--accent-primary)' }} />
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loadingStats && recentAssignments.length === 0 && (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', opacity: 0.5 }}>
                    No hay actividades registradas recientemente
                  </div>
                )}
              </div>
            </div>
          </>
        )}

          {activeTab === 'activity-log' && (
            <ActivityLogList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              currentUser={currentUser}
            />
          )}

          {activeTab === 'employees' && (
            <EmployeeList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('empleados', 'editar')}
              canDelete={hasPermission('empleados', 'eliminar')}
            />
          )}

          {activeTab === 'costs' && (
            <CostCenterList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('costos', 'editar')}
              canDelete={hasPermission('costos', 'eliminar')}
            />
          )}

          {activeTab === 'schedule' && (
            <ProgramacionList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('programacion', 'editar')}
              canDelete={hasPermission('programacion', 'eliminar')}
            />
          )}

          {activeTab === 'roles' && (
             <RoleList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'shifts' && (
             <ShiftList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'logs' && (
             <AccessLogList searchTerm={searchTerm} refreshKey={refreshKey} />
          )}

          {activeTab === 'jobs' && (
            <JobList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'groups' && (
            <GroupList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'holidays' && (
            <HolidayList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'tasks' && (
            <TaskList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'task-details' && (
            <TaskDetailList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'novedades' && (
            <NovedadList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}

          {activeTab === 'activity-calendar' && (
            <ActivityCalendarView currentUser={currentUser} onEdit={handleEdit} refreshKey={refreshKey} />
          )}
          
          {activeTab === 'users' && (
            <UserProfileList onEdit={handleEdit} refreshKey={refreshKey} searchTerm={searchTerm} />
          )}
        </section>

        {isFormOpen && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}>
            <div className="glass-card animate-fade-in" style={{ 
              width: '95%', 
              maxWidth: activeTab === 'shifts' ? '1100px' : (activeTab === 'schedule' || activeTab === 'employees' || activeTab === 'activity-log' ? '850px' : '650px'), 
              maxHeight: '90vh', 
              overflowY: 'auto', 
              padding: '40px',
              border: '1px solid rgba(0, 212, 255, 0.2)',
              boxShadow: '0 0 50px rgba(0, 212, 255, 0.1)'
            }}>
              {renderForm()}
            </div>
          </div>
        )}
      </main>

      <style>{`
        .sidebar-item:hover {
          background-color: rgba(255,255,255,0.03);
          color: var(--text-primary);
        }
        .active-sidebar-item {
          box-shadow: inset 0 0 15px rgba(0, 212, 255, 0.05);
        }
        .animate-scale-in {
          animation: scaleIn 0.3s cubic-bezier(0, 0, 0.2, 1);
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
