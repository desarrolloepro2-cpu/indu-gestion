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
  Palmtree,
  Globe,
  Menu,
  X,
  Settings,
  Bot,
  Upload,
  Palette
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
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
import PasswordChangeForm from './PasswordChangeForm';
import SystemConfigForm from './SystemConfigForm';
import AIAssistantChat from './AIAssistantChat';
import BulkUpload from './BulkUpload';
import CustomAppearanceForm from './CustomAppearanceForm';

interface DashboardProps {
  session: any;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const { language, setLanguage, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'summary' | 'employees' | 'costs' | 'schedule' | 'roles' | 'shifts' | 'logs' | 'jobs' | 'groups' | 'holidays' | 'tasks' | 'task-details' | 'novedades' | 'users' | 'activity-log' | 'activity-calendar' | 'configuracion' | 'bulk-upload' | 'apariencia'>(() => {
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['summary', 'employees', 'costs', 'schedule', 'roles', 'shifts', 'logs', 'jobs', 'groups', 'holidays', 'tasks', 'task-details', 'novedades', 'users', 'activity-log', 'activity-calendar', 'configuracion', 'bulk-upload', 'apariencia'];
    if (hash && validTabs.includes(hash)) return hash as any;
    return (localStorage.getItem('dashboardTab') as any) || 'summary';
  });

  // Sync hash with State
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['summary', 'employees', 'costs', 'schedule', 'roles', 'shifts' , 'logs', 'jobs', 'groups', 'holidays', 'tasks', 'task-details', 'novedades', 'users', 'activity-log', 'activity-calendar', 'configuracion', 'bulk-upload', 'apariencia'];
      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash as any);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync State with Hash and Storage
  useEffect(() => {
    localStorage.setItem('dashboardTab', activeTab);
    if (window.location.hash !== `#${activeTab}`) {
      window.location.hash = activeTab;
    }
  }, [activeTab]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [permissions, setPermissions] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic Tab Title
  useEffect(() => {
    const tabTitles: Record<string, string> = {
      summary: t('panel_general'),
      employees: t('gestion_talento'),
      costs: t('centros_costo'),
      schedule: t('programacion_diaria'),
      roles: t('seguridad_roles'),
      shifts: t('jornadas_laborales'),
      logs: t('auditoria_acceso'),
      jobs: t('cargos'),
      groups: t('grupos_trabajo'),
      holidays: t('dias_festivos'),
      tasks: t('grupos_tareas'),
      'task-details': t('subtareas'),
      novedades: t('gestion_novedades'),
      users: t('usuarios_perfiles'),
      'activity-calendar': t('calendario_trabajo'),
      configuracion: t('configuracion_sistema'),
      'bulk-upload': t('cargue_masivo'),
      apariencia: t('personalizacion')
    };
    document.title = `${tabTitles[activeTab] || 'Dashboard'} | InduConocimiento`;
  }, [activeTab, t]);

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

  // Notifications Effect
  useEffect(() => {
    if (currentUser?.id) {
      const fetchInitialNotifications = async () => {
        const { data } = await supabase
          .from('programacion')
          .select(`
            id,
            serial,
            created_at,
            id_tarea (nombre)
          `)
          .eq('id_responsable', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(6);
        
        if (data) setNotifications(data);
      };

      fetchInitialNotifications();

      const channel = supabase
        .channel('new_programacion')
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'programacion',
          filter: `id_responsable=eq.${currentUser.id}`
        }, async (payload) => {
          // Fetch task name for the new record
          const { data: taskData } = await supabase
            .from('tareas')
            .select('nombre')
            .eq('id', payload.new.id_tarea)
            .single();

          const newNotif = {
            ...payload.new,
            id_tarea: taskData
          };
          
          setNotifications(prev => [newNotif, ...prev].slice(0, 6));
          setUnreadCount(prev => prev + 1);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [currentUser]);

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

  const SidebarItem = ({ id, icon: Icon, label, subKey }: { id: any, icon: any, label: string, subKey?: string }) => {
    const subLabel = subKey ? t(subKey) : null;
    return (
      <a 
        href={`#${id}`}
        onClick={(e) => {
          if (!e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            setActiveTab(id);
          }
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: subLabel ? '10px 20px' : '12px 20px',
          cursor: 'pointer',
          borderRadius: '12px',
          color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
          backgroundColor: activeTab === id ? 'rgba(0, 212, 255, 0.08)' : 'transparent',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          marginBottom: '4px',
          position: 'relative',
          overflow: 'hidden',
          textDecoration: 'none'
        }}
        className={activeTab === id ? 'active-sidebar-item' : 'sidebar-item'}
      >
        <Icon size={18} style={{ 
          filter: activeTab === id ? 'drop-shadow(0 0 8px rgba(0, 212, 255, 0.5))' : 'none',
          transition: 'all 0.3s'
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <span style={{ 
            fontWeight: activeTab === id ? 700 : 500, 
            fontSize: '0.9rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {label}
          </span>
          {subLabel && (
            <span className="sub-index" style={{ fontSize: '0.65rem', marginTop: '-2px' }}>
              {subLabel}
            </span>
          )}
        </div>
        {activeTab === id && (
          <div style={{ 
            position: 'absolute', 
            right: 0, top: '20%', bottom: '20%', width: '3px', 
            backgroundColor: 'var(--accent-primary)',
            borderRadius: '3px 0 0 3px',
            boxShadow: '0 0 10px var(--accent-primary)'
          }} />
        )}
      </a>
    );
  };

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
  };

  const [appConfig, setAppConfig] = useState<any>(null);

  useEffect(() => {
    const fetchAppAppearance = async () => {
      const { data } = await supabase.from('configuracion_apariencia').select('*').eq('id', 1).single();
      if (data) setAppConfig(data);
    };
    fetchAppAppearance();
  }, [refreshKey]);

  const renderForm = () => {
    const props = { onClose: handleCloseForm, onRefresh: triggerRefresh, initialData: editingItem };
    
    // Prioritize form by editing item properties for context-independent editing
    if (editingItem && editingItem.primer_nombre) return <EmployeeForm {...props} />;
    if (editingItem && editingItem.nombre_centro) return <CostCenterForm {...props} />;
    if (editingItem && editingItem.serial) return <ProgramacionForm {...props} />;
    if (editingItem && editingItem.isPasswordChange) return <PasswordChangeForm onClose={handleCloseForm} />;

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
      {/* Mobile Drawer Backdrop */}
      {isMobile && isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            zIndex: 998,
            animation: 'fadeIn 0.3s ease'
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '280px',
        backgroundColor: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '30px 20px',
        position: isMobile ? 'fixed' : 'sticky',
        left: isMobile ? (isSidebarOpen ? '0' : '-280px') : '0',
        top: 0,
        height: '100vh',
        zIndex: 999,
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: isMobile && isSidebarOpen ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
      }}>
        {isMobile && (
          <button 
            onClick={() => setIsSidebarOpen(false)}
            style={{
              position: 'absolute',
              right: '15px',
              top: '15px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        )}
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
              src={appConfig?.logo_url || "/logo_indutronica.png"} 
              alt="Logo" 
              style={{ 
                width: '100%', 
                maxHeight: '40px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 10px var(--accent-glow))'
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
            {t('operaciones_centrales')}
          </div>
          <SidebarItem id="summary" icon={LayoutDashboard} label={t('panel_general')} />
          {hasPermission('empleados') && <SidebarItem id="employees" icon={Users} label={t('gestion_talento')} subKey="gestion_talento_sub" />}
          {hasPermission('cargos') && <SidebarItem id="jobs" icon={Briefcase} label={t('cargos')} subKey="cargos_sub" />}
          {hasPermission('costos') && <SidebarItem id="costs" icon={DollarSign} label={t('centros_costo')} subKey="centros_costo_sub" />}
          {hasPermission('grupos') && <SidebarItem id="groups" icon={Layers} label={t('grupos_trabajo')} subKey="grupos_trabajo_sub" />}
          
          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('seguimiento_operativo')}
          </div>
          {hasPermission('programacion') && <SidebarItem id="schedule" icon={Calendar} label={t('programacion_diaria')} subKey="programacion_diaria_sub" />}
          {hasPermission('turnos') && <SidebarItem id="shifts" icon={Clock} label={t('jornadas_laborales')} subKey="jornadas_laborales_sub" />}
          {hasPermission('festivos') && <SidebarItem id="holidays" icon={Palmtree} label={t('dias_festivos')} subKey="dias_festivos_sub" />}
          {hasPermission('tareas') && <SidebarItem id="tasks" icon={ClipboardList} label={t('grupos_tareas')} subKey="grupos_tareas_sub" />}
          {hasPermission('det_tareas') && <SidebarItem id="task-details" icon={ListTodo} label={t('subtareas')} subKey="subtareas_sub" />}
          {hasPermission('novedades') && <SidebarItem id="novedades" icon={Activity} label={t('novedades')} subKey="novedades_sub" />}

          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('trabajo_diario')}
          </div>
          {hasPermission('actividades') && <SidebarItem id="activity-log" icon={CheckSquare} label={t('registro_actividades')} subKey="registro_actividades_sub" />}
          {hasPermission('actividades') && <SidebarItem id="activity-calendar" icon={Calendar} label={t('calendario_trabajo')} subKey="calendario_trabajo_sub" />}

          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('sistemas_auditoria')}
          </div>
          {hasPermission('usuarios') && <SidebarItem id="users" icon={User} label={t('usuarios_perfiles')} subKey="usuarios_perfiles_sub" />}
          {hasPermission('roles') && <SidebarItem id="roles" icon={Shield} label={t('roles_permisos')} subKey="roles_permisos_sub" />}
          {hasPermission('logs') && <SidebarItem id="logs" icon={History} label={t('auditoria_logs')} subKey="auditoria_logs_sub" />}
          {hasPermission('reportes') && <SidebarItem id="summary" icon={FileText} label={t('reportes_maestros')} />}
          {hasPermission('cargue_masivo') && <SidebarItem id="bulk-upload" icon={Upload} label={t('cargue_masivo')} subKey="cargue_masivo_sub" />}
          {hasPermission('configuracion') && <SidebarItem id="apariencia" icon={Palette} label={t('personalizacion')} subKey="apariencia_sub" />}

          <div style={{ padding: '30px 10px 10px', fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {t('configuracion_sistema')}
          </div>
          {hasPermission('configuracion') && <SidebarItem id="configuracion" icon={Settings} label={t('configuracion_correo')} subKey="configuracion_correo_sub" />}
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
                {currentUser ? `${currentUser.primer_nombre} ${currentUser.primer_apellido || ''}` : t('conectando')}
              </div>
              <div style={{ 
                fontSize: '0.7rem', 
                color: 'var(--text-secondary)',
                fontWeight: 500
              }}>
                {t('sesion_activa')} • {currentUser?.role_name || 'Personal'}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: isMobile ? '20px 15px' : '40px 60px', overflowY: 'auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'center' : 'flex-start', 
          marginBottom: isMobile ? '30px' : '50px',
          flexDirection: isMobile ? 'row' : 'row'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {isMobile && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  padding: '10px',
                  borderRadius: '12px',
                  color: 'var(--accent-primary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Menu size={24} />
              </button>
            )}
            <div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
              {activeTab === 'summary' && t('panel_general')}
              {activeTab === 'employees' && t('gestion_talento')}
              {activeTab === 'costs' && t('centros_costo')}
              {activeTab === 'schedule' && t('programacion_diaria')}
              {activeTab === 'roles' && t('roles_permisos')}
              {activeTab === 'users' && t('usuarios_perfiles')}
              {activeTab === 'logs' && t('auditoria_logs')}
              {activeTab === 'shifts' && t('jornadas_laborales')}
              {activeTab === 'activity-log' && t('registro_actividades')}
              {activeTab === 'activity-calendar' && t('calendario_trabajo')}
              {activeTab === 'configuracion' && t('configuracion_sistema')}
              {activeTab === 'jobs' && t('cargos')}
              {activeTab === 'groups' && t('grupos_trabajo')}
              {activeTab === 'holidays' && t('dias_festivos')}
              {activeTab === 'tasks' && t('grupos_tareas')}
              {activeTab === 'task-details' && t('subtareas')}
              {activeTab === 'novedades' && t('novedades')}
              {activeTab === 'bulk-upload' && t('cargue_masivo')}
            </h2>
            <p className="sub-index" style={{ marginTop: '6px', fontSize: isMobile ? '0.8rem' : '1.1rem' }}>
              {activeTab === 'summary' && t('informacion_personal')}
              {activeTab === 'employees' && t('gestion_talento_sub')}
              {activeTab === 'costs' && t('centros_costo_sub')}
              {activeTab === 'schedule' && t('programacion_diaria_sub')}
              {activeTab === 'roles' && t('roles_permisos_sub')}
              {activeTab === 'users' && t('usuarios_perfiles_sub')}
              {activeTab === 'logs' && t('auditoria_logs_sub')}
              {activeTab === 'shifts' && t('jornadas_laborales_sub')}
              {activeTab === 'activity-log' && t('registro_actividades_sub')}
              {activeTab === 'activity-calendar' && t('calendario_trabajo_sub')}
              {activeTab === 'jobs' && t('cargos_sub')}
              {activeTab === 'groups' && t('grupos_trabajo_sub')}
              {activeTab === 'holidays' && t('dias_festivos_sub')}
              {activeTab === 'tasks' && t('grupos_tareas_sub')}
              {activeTab === 'task-details' && t('subtareas_sub')}
              {activeTab === 'novedades' && t('novedades_sub')}
              {activeTab === 'bulk-upload' && t('cargue_masivo_sub')}
            </p>
          </div>
        </div>

          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            {!isMobile && (
              <div style={{ 
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: '12px',
                padding: '10px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <Search size={18} color="var(--text-secondary)" />
                <input 
                  placeholder={t('buscar')} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ 
                    background: 'transparent', 
                    border: 'none', 
                    color: 'var(--text-primary)', 
                    outline: 'none',
                    fontSize: '0.9rem',
                    minWidth: '250px'
                  }} 
                />
              </div>
            )}
            
            <button 
              onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
              className="glass-card neon-btn-active"
              style={{ 
                padding: '8px 12px', 
                height: '42px', 
                fontSize: '0.75rem', 
                fontWeight: 800,
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer',
                color: 'var(--text-primary)',
                border: '1px solid var(--accent-primary)'
              }}
              title={language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe size={16} />
              {language === 'es' ? 'ES' : 'EN'}
            </button>
            
            <button className="glass-card" style={{ padding: isMobile ? '10px' : '12px', cursor: 'pointer', border: 'none' }} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={isMobile ? 18 : 20} color="var(--accent-primary)" /> : <Moon size={isMobile ? 18 : 20} color="var(--accent-primary)" />}
            </button>
            <div style={{ position: 'relative' }}>
              <button 
                className="glass-card" 
                style={{ 
                  padding: '12px', 
                  cursor: 'pointer', 
                  border: showNotifications ? '1px solid var(--accent-primary)' : 'none',
                  position: 'relative',
                  backgroundColor: showNotifications ? 'rgba(0, 212, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'
                }} 
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setUnreadCount(0);
                }}
              >
                <Bell size={isMobile ? 18 : 20} color={unreadCount > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: 'var(--error)',
                    borderRadius: '50%',
                    border: '2px solid var(--bg-color)',
                    boxShadow: '0 0 5px var(--error)'
                  }} />
                )}
              </button>

              {showNotifications && (
                <div className="glass-card animate-scale-in" style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '15px',
                  width: '320px',
                  zIndex: 1001,
                  padding: '20px',
                  border: '1px solid var(--accent-primary)',
                  boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                  backgroundColor: 'rgba(15, 15, 25, 0.98)',
                  backdropFilter: 'blur(20px)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {t('notificaciones')}
                    </h4>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 700 }}>{notifications.length} {t('recientes')}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {t('no_hay_notificaciones')}
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} style={{
                          padding: '12px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          borderLeft: '3px solid var(--accent-primary)',
                          cursor: 'pointer'
                        }} onClick={() => { setShowNotifications(false); window.location.hash = '#schedule'; }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 800, marginBottom: '2px' }}>{n.serial}</div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                            {n.id_tarea?.nombre || t('nueva_actividad')}
                          </div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <button 
                      onClick={() => { setShowNotifications(false); window.location.hash = '#schedule'; }}
                      style={{ 
                        width: '100%', 
                        marginTop: '15px', 
                        padding: '10px', 
                        background: 'transparent', 
                        border: '1px dashed rgba(255,255,255,0.1)', 
                        color: 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      {t('ver_toda_la_programacion')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Profile Avatar Top Right with Dropdown */}
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ 
                  width: '45px', 
                  height: '45px', 
                  borderRadius: '12px', 
                  border: isProfileOpen ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  boxShadow: isProfileOpen ? '0 0 15px rgba(0, 212, 255, 0.4)' : '0 0 10px rgba(0, 212, 255, 0.2)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'rgba(255,255,255,0.02)'
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

              {isProfileOpen && (
                <>
                  <div 
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }} 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <div className="glass-card animate-scale-in" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '15px',
                    width: '220px',
                    zIndex: 1000,
                    padding: '8px',
                    border: '1px solid var(--accent-primary)',
                    boxShadow: '0 15px 35px rgba(0,0,0,0.5)',
                    backgroundColor: 'rgba(15, 15, 25, 0.98)',
                    backdropFilter: 'blur(20px)'
                  }}>
                    <div style={{ padding: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {currentUser?.primer_nombre} {currentUser?.primer_apellido}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {currentUser?.role_name || t('usuario')}
                      </div>
                    </div>

                    <button 
                      onClick={() => { setIsProfileOpen(false); handleEdit(currentUser); }}
                      style={{ 
                        width: '100%', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 'none', 
                        color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '0.85rem'
                      }}
                      className="dropdown-item"
                    >
                      <User size={16} color="var(--accent-primary)" />
                      {t('configuracion_cuenta')}
                    </button>

                    <button 
                      onClick={() => { setIsProfileOpen(false); handleEdit({ isPasswordChange: true }); }}
                      style={{ 
                        width: '100%', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 'none', 
                        color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '0.85rem'
                      }}
                      className="dropdown-item"
                    >
                      <Shield size={16} color="var(--accent-primary)" />
                      {t('contraseñas')}
                    </button>

                    <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '8px 0' }} />

                    <button 
                      onClick={() => {
                        window.location.hash = '';
                        supabase.auth.signOut();
                      }}
                      style={{ 
                        width: '100%', padding: '10px 12px', textAlign: 'left', background: 'transparent', border: 'none', 
                        color: '#f43f5e', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px',
                        fontSize: '0.85rem', fontWeight: 600
                      }}
                      className="dropdown-item logout"
                    >
                      <LogOut size={16} />
                      {t('salir')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* New Button logic */}
        {(activeTab === 'employees' || activeTab === 'costs' || activeTab === 'schedule' || activeTab === 'activity-log' || activeTab === 'activity-calendar' || activeTab === 'shifts' || activeTab === 'holidays' || activeTab === 'jobs' || activeTab === 'groups' || activeTab === 'tasks' || activeTab === 'task-details' || activeTab === 'novedades' || activeTab === 'roles' || activeTab === 'users') && (
          <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'flex-end' }}>
            {(() => {
              const moduleMap: Record<string, string> = {
                employees: 'empleados',
                costs: 'costos',
                schedule: 'programacion',
                shifts: 'turnos',
                holidays: 'festivos',
                jobs: 'cargos',
                groups: 'grupos',
                tasks: 'tareas',
                'task-details': 'det_tareas',
                novedades: 'novedades',
                roles: 'roles',
                users: 'usuarios'
              };
              const module = moduleMap[activeTab as string] || activeTab;
              if (activeTab === 'activity-log' || activeTab === 'activity-calendar' || hasPermission(module, 'crear')) {
                return (
                  <button onClick={() => { setEditingItem(null); setIsFormOpen(true); }} className="neon-btn" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Plus size={20} />
                    <span>{t('registrar_nuevo')}</span>
                  </button>
                );
              }
              return null;
            })()}
          </div>
        )}

        <section className="animate-fade-in" key={refreshKey + searchTerm}>
          {activeTab === 'summary' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px', marginBottom: '40px' }}>
              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{t('personal_activo')}</div>
                  <Users size={18} color="var(--accent-primary)" />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loadingStats ? '...' : stats.totalEmployees} <span style={{ fontSize: '1rem', color: 'var(--success)' }}>{t('en_nomina')}</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-primary)', boxShadow: '0 0 10px var(--accent-primary)' }} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{t('centros_negocio')}</div>
                  <DollarSign size={18} color="var(--accent-secondary)" />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loadingStats ? '...' : stats.activeCostCenters} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{t('operativos')}</span></div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginTop: '20px', overflow: 'hidden' }}>
                  <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--accent-secondary)' }} />
                </div>
              </div>

              <div className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>{t('progreso_global')}</div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success)', boxShadow: '0 0 10px var(--success)' }} />
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800 }}>{loadingStats ? '...' : stats.overallProgress}% <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>{t('ejecutado')}</span></div>
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
                  {t('asignaciones_recientes')}
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
             <RoleList 
               onEdit={handleEdit} 
               refreshKey={refreshKey} 
               searchTerm={searchTerm} 
               canEdit={hasPermission('roles', 'editar')}
               canDelete={hasPermission('roles', 'eliminar')}
             />
          )}

          {activeTab === 'shifts' && (
             <ShiftList 
               onEdit={handleEdit} 
               refreshKey={refreshKey} 
               searchTerm={searchTerm} 
               canEdit={hasPermission('turnos', 'editar')}
               canDelete={hasPermission('turnos', 'eliminar')}
             />
          )}

          {activeTab === 'logs' && (
             <AccessLogList searchTerm={searchTerm} refreshKey={refreshKey} />
          )}

          {activeTab === 'jobs' && (
            <JobList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('cargos', 'editar')}
              canDelete={hasPermission('cargos', 'eliminar')}
            />
          )}

          {activeTab === 'groups' && (
            <GroupList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('grupos', 'editar')}
              canDelete={hasPermission('grupos', 'eliminar')}
            />
          )}

          {activeTab === 'holidays' && (
            <HolidayList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('festivos', 'editar')}
              canDelete={hasPermission('festivos', 'eliminar')}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('tareas', 'editar')}
              canDelete={hasPermission('tareas', 'eliminar')}
            />
          )}

          {activeTab === 'task-details' && (
            <TaskDetailList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('det_tareas', 'editar')}
              canDelete={hasPermission('det_tareas', 'eliminar')}
            />
          )}

          {activeTab === 'novedades' && (
            <NovedadList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('novedades', 'editar')}
              canDelete={hasPermission('novedades', 'eliminar')}
            />
          )}

          {activeTab === 'activity-calendar' && (
            <ActivityCalendarView currentUser={currentUser} onEdit={handleEdit} refreshKey={refreshKey} />
          )}
          
          {activeTab === 'users' && (
            <UserProfileList 
              onEdit={handleEdit} 
              refreshKey={refreshKey} 
              searchTerm={searchTerm} 
              canEdit={hasPermission('usuarios', 'editar')}
              canDelete={hasPermission('usuarios', 'eliminar')}
            />
          )}

          {activeTab === 'configuracion' && (
            <SystemConfigForm />
          )}

          {activeTab === 'bulk-upload' && (
            <BulkUpload />
          )}

          {activeTab === 'apariencia' && (
            <CustomAppearanceForm />
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

        {currentUser && ['administrador', 'superadmin'].includes((currentUser?.role_name || '').toLowerCase()) && (
          <>
            {isAiChatOpen ? (
              <AIAssistantChat onClose={() => setIsAiChatOpen(false)} currentUser={currentUser} />
            ) : (
              <button 
                onClick={() => setIsAiChatOpen(true)}
                style={{
                  position: 'fixed',
                  bottom: '20px',
                  right: '20px',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  boxShadow: '0 5px 20px rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 9999,
                  animation: 'aiPulse 2s infinite'
                }}
                title="Soporte de Inteligencia Artificial"
              >
                <Bot size={28} color="var(--text-secondary)" />
              </button>
            )}
          </>
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
        .sub-index {
          color: var(--text-secondary);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          opacity: 0.8;
        }
        @keyframes aiPulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 240, 255, 0.4); }
          70% { transform: scale(1.05); box-shadow: 0 0 0 15px rgba(0, 240, 255, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(0, 240, 255, 0); }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
