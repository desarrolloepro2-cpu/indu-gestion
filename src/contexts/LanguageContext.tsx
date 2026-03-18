import React, { createContext, useContext, useState } from 'react';

type Language = 'es' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    // Dashboard / Sidebar
    'panel_general': 'Panel General',
    'gestion_talento': 'Gestión de Talento',
    'empleados': 'Empleados',
    'cargos': 'Catálogo de Cargos',
    'centros_costo': 'Centros de Costo',
    'grupos_trabajo': 'Grupos de Trabajo',
    'dias_festivos': 'Días Festivos',
    'seguimiento_operativo': 'Seguimiento Operativo',
    'programacion_diaria': 'Programación Diaria',
    'jornadas_laborales': 'Jornadas Laborales',
    'grupos_tareas': 'Grupos de Tareas',
    'subtareas': 'Subtareas Detalladas',
    'registro_actividades': 'Registro de Actividades',
    'calendario_trabajo': 'Calendario de Trabajo',
    'novedades': 'Novedades y Pendientes',
    'configuracion': 'Configuración del Sistema',
    'roles_permisos': 'Roles y Permisos',
    'usuarios_perfiles': 'Usuarios y Perfiles',
    'auditoria_logs': 'Auditoría y Logs',
    'cerrar_sesion': 'Cerrar Sesión',
    'buscar': 'Buscar en el sistema...',
    'registrar_nuevo': 'REGISTRAR NUEVO',
    
    // Stats
    'total_empleados': 'Total Empleados',
    'fuerza_laboral': 'Fuerza laboral activa',
    'centros_activos': 'Centros Activos',
    'operaciones_vigentes': 'Operaciones vigentes',
    'cumplimiento_general': 'Cumplimiento General',
    'eficiencia_operativa': 'Eficiencia operativa',
    'tareas_pendientes': 'Tareas Pendientes',
    'requieren_atencion': 'Requieren atención',
    
    // Calendar
    'cronograma_actividades': 'Cronograma de Actividades',
    'visualizacion_global': 'Visualización global de tiempos reportados por el equipo',
    'visualizacion_personal': 'Visualización de tus tiempos reportados',
    'todos_los_empleados': 'Todos los Empleados',
    'hoy': 'Hoy',
    'mes': 'Mes',
    'semana': 'Semana',
    'dia': 'Día',
    'agenda': 'Agenda',
    
    // Common
    'editar': 'Editar',
    'cancelar': 'Cancelar',
    'sesion_conflicto': 'Sesión Activa Detectada',
    'pregunta_sesion': '¿Desea desactivar la sesión del dispositivo "{device}" que está activa en el momento?',
    'si': 'SÍ',
    'no': 'NO',
    'sesion_expirada': 'Tu sesión ha sido cerrada porque se inició en otro dispositivo.',
    'dispositivo_desconocido': 'Dispositivo desconocido',
    'guardar': 'Guardar',
    'novedad': 'Novedad',
    'activo': 'Activo',
    'inactivo': 'Inactivo',
    'nombre': 'Nombre',
    'apellido': 'Apellido',
    'cargo': 'Cargo',
    'estado': 'Estado',
    'acciones': 'Acciones',
    'notificaciones': 'Notificaciones',
    'recientes': 'recientes',
    'no_hay_notificaciones': 'No hay notificaciones nuevas',
    'nueva_actividad': 'Nueva actividad asignada',
    'ver_toda_la_programacion': 'Ver toda la programación',
    'cambiar_password': 'Cambiar Contraseña',
    'nueva_password': 'Nueva Contraseña',
    'confirmar_password': 'Confirmar Contraseña',
    'actualizar_password': 'Actualizar Contraseña',
    'password_actualizada': '¡Contraseña actualizada con éxito!',
    'las_passwords_no_coinciden': 'Las contraseñas no coinciden.',
    'password_min_length': 'La contraseña debe tener al menos 8 caracteres.',
    'error_actualizar_password': 'Error al actualizar la contraseña',
    'configuracion_cuenta': 'Configuración de cuenta',
    'contraseñas': 'Contraseñas',
    'salir': 'Salir',
    'usuario': 'Usuario',
    'sesion_activa': 'Sesión Activa',
    'conectando': 'Conectando...'
  },
  en: {
    // Dashboard / Sidebar
    'panel_general': 'Overview Dashboard',
    'gestion_talento': 'Talent Management',
    'empleados': 'Employees',
    'cargos': 'Job Titles',
    'centros_costo': 'Cost Centers',
    'grupos_trabajo': 'Work Groups',
    'dias_festivos': 'Public Holidays',
    'seguimiento_operativo': 'Operations Tracking',
    'programacion_diaria': 'Daily Scheduling',
    'jornadas_laborales': 'Work Shifts',
    'grupos_tareas': 'Task Groups',
    'subtareas': 'Subtasks Details',
    'registro_actividades': 'Activity Logs',
    'calendario_trabajo': 'Work Calendar',
    'novedades': 'Issues & Pending',
    'configuracion': 'System Settings',
    'roles_permisos': 'Roles & Permissions',
    'usuarios_perfiles': 'Users & Profiles',
    'auditoria_logs': 'Audit & Logs',
    'cerrar_sesion': 'Logout',
    'buscar': 'Search system...',
    'registrar_nuevo': 'REGISTER NEW',
    
    // Page Titles
    'panel_ejecutivo': 'Executive Dashboard',
    'gestion_personal': 'Staff Management',
    'control_presupuesto': 'Budget Control',
    'planeacion_actividades': 'Activity Planning',
    'seguridad_sistemica': 'System Security',
    'gestion_identidades': 'Identity Management',
    'auditoria_operaciones': 'Operations Audit',
    'gestion_horarios': 'Shifts Management',
    'mis_actividades': 'My Activities',
    'calendario_actividades': 'Activity Calendar',
    'inteligencia_operativa': 'Operational Intelligence & Knowledge Inventory',
    
    // Stats
    'total_empleados': 'Total Employees',
    'fuerza_laboral': 'Active workforce',
    'centros_activos': 'Active Centers',
    'operaciones_vigentes': 'Current operations',
    'cumplimiento_general': 'Overall Compliance',
    'eficiencia_operativa': 'Operational efficiency',
    'tareas_pendientes': 'Pending Tasks',
    'requieren_atencion': 'Attention required',
    'personal_activo': 'Active Staff',
    'en_nomina': 'On Payroll',
    'centros_negocio': 'Business Centers',
    'operativos': 'Operational',
    'progreso_global': 'Global Progress',
    'ejecutado': 'Executed',
    'asignaciones_recientes': 'Recent Tactical Assignments',
    'conectando': 'Connecting...',
    'sesion_activa': 'Active Session',
    
    // Login
    'sistema_gestion': 'Knowledge Management System',
    'iniciar_sesion': 'Login',
    'correo': 'Email Address',
    'password': 'Password',
    'validando': 'Validating...',
    'ingresar': 'Sign In',
    
    // Calendar
    'cronograma_actividades': 'Activity Schedule',
    'visualizacion_global': 'Global view of team reported times',
    'visualizacion_personal': 'Your reported times view',
    'todos_los_empleados': 'All Employees',
    'hoy': 'Today',
    'mes': 'Month',
    'semana': 'Week',
    'dia': 'Day',
    'agenda': 'Agenda',

    // Sidebar Specific
    'seguridad_roles': 'Security & Roles',
    'auditoria_acceso': 'Access Audit',
    'reportes_maestros': 'Master Reports',
    'gestion_novedades': 'Issue Management',
    'trabajo_diario': 'Daily Work',
    'sistemas_auditoria': 'Systems & Audit',
    'operaciones_centrales': 'Central Operations',

    // Common
    'editar': 'Edit',
    'cancelar': 'Cancel',
    'sesion_conflicto': 'Active Session Detected',
    'pregunta_sesion': 'Do you want to deactivate the session on device "{device}" that is currently active?',
    'si': 'YES',
    'no': 'NO',
    'sesion_expirada': 'Your session has been closed because it was started on another device.',
    'dispositivo_desconocido': 'Unknown device',
    'guardar': 'Save',
    'novedad': 'New Issue',
    'activo': 'Active',
    'inactivo': 'Inactive',
    'nombre': 'First Name',
    'apellido': 'Last Name',
    'cargo': 'Position',
    'estado': 'Status',
    'acciones': 'Actions',
    'notificaciones': 'Notifications',
    'recientes': 'recent',
    'no_hay_notificaciones': 'No new notifications',
    'nueva_actividad': 'New activity assigned',
    'ver_toda_la_programacion': 'View all scheduling',
    'cambiar_password': 'Change Password',
    'nueva_password': 'New Password',
    'confirmar_password': 'Confirm Password',
    'actualizar_password': 'Update Password',
    'password_actualizada': 'Password updated successfully!',
    'las_passwords_no_coinciden': 'Passwords do not match.',
    'password_min_length': 'Password must be at least 8 characters long.',
    'error_actualizar_password': 'Error updating password',
    'configuracion_cuenta': 'Account Settings',
    'contraseñas': 'Passwords',
    'salir': 'Logout',
    'usuario': 'User'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
