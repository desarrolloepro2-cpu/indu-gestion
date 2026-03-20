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
    'panel_general': 'Tablero General',
    'gestion_talento': 'Gestion Empleados',
    'gestion_talento_sub': 'Personal de Indutronica',
    'empleados': 'Empleados',
    'cargos': 'Cargos del Personal',
    'cargos_sub': 'Gestion de Cargo del Personal',
    'centros_costo': 'Centro de Costos',
    'centros_costo_sub': 'CC',
    'grupos_trabajo': 'Grupo de Trabajo',
    'grupos_trabajo_sub': 'GT',
    'dias_festivos': 'Dias Festivos',
    'dias_festivos_sub': 'Admin. dias Festivos',
    'seguimiento_operativo': 'Seguimiento Operativo',
    'programacion_diaria': 'Programación Actividades',
    'programacion_diaria_sub': 'Asigne tarea',
    'jornadas_laborales': 'Gestion de Turnos',
    'jornadas_laborales_sub': 'Turnos Ind.',
    'grupos_tareas': 'Actividades Globales',
    'grupos_tareas_sub': 'Admin. Actividades',
    'subtareas': 'Actividades Especificas',
    'subtareas_sub': 'Admin. Actividades',
    'registro_actividades': 'Registro de Actividades',
    'registro_actividades_sub': 'Mis actividades',
    'calendario_trabajo': 'Calendario',
    'calendario_trabajo_sub': 'Actividades Registradas',
    'novedades': 'Novedades',
    'novedades_sub': 'Admin. Novedades',
    'configuracion': 'Configuración Sistema de Correos',
    'configuracion_sistema': 'Configuración Sistema de Correos',
    'configuracion_correo': 'Correo y Alertas',
    'configuracion_correo_sub': 'Notificaciones',
    'config_email': 'Correo y Notificaciones',
    'roles_permisos': 'Roles de Sistema',
    'roles_permisos_sub': 'Roles',
    'usuarios_perfiles': 'Usuarios del Sistema',
    'usuarios_perfiles_sub': 'Usuarios APP',
    'auditoria_logs': 'Log de Ingreso',
    'auditoria_logs_sub': 'Ingresos Usuarios',
    'cargue_masivo': 'Cargue Masivo de Datos',
    'cargue_masivo_sub': 'Cargar desde .CSV',
    'personalizacion': 'Apariencia y Logo',
    'personalizacion_sub': 'Personalizar Interfaz',
    'cerrar_sesion': 'Cerrar Sesión',
    'buscar': 'Buscar en el sistema...',
    'registrar_nuevo': 'REGISTRAR NUEVO',
    'informacion_personal': 'informacion del personal',
    
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
    'conectando': 'Conectando...',
    'notificar_responsable': 'Notificar al Responsable de Ejecución',
    'notificar_supervisor': 'Notificar al Supervisor Directo',
    'msg_notif_auto': 'Notificaciones Automáticas de Actividad',
    'desc_notif_auto': 'Define quién debe recibir un correo electrónico informativo en el momento exacto en que se asienta un nuevo reporte de actividad diaria.'
  },
  en: {
    // Dashboard / Sidebar
    'panel_general': 'General Dashboard',
    'gestion_talento': 'Staff Management',
    'gestion_talento_sub': 'Indutronica Personnel',
    'empleados': 'Employees',
    'cargos': 'Staff Positions',
    'cargos_sub': 'Staff Position Management',
    'centros_costo': 'Cost Center',
    'centros_costo_sub': 'CC',
    'grupos_trabajo': 'Work Group',
    'grupos_trabajo_sub': 'GT',
    'dias_festivos': 'Public Holidays',
    'dias_festivos_sub': 'Holidays Admin',
    'seguimiento_operativo': 'Operations Tracking',
    'programacion_diaria': 'Activity Scheduling',
    'programacion_diaria_sub': 'Assign Task',
    'jornadas_laborales': 'Shifts Management',
    'jornadas_laborales_sub': 'Ind. Shifts',
    'grupos_tareas': 'Global Activities',
    'grupos_tareas_sub': 'Activities Admin',
    'subtareas': 'Specific Activities',
    'subtareas_sub': 'Activities Admin',
    'registro_actividades': 'Activity Log',
    'registro_actividades_sub': 'My Activities',
    'calendario_trabajo': 'Calendar',
    'calendario_trabajo_sub': 'Registered Activities',
    'novedades': 'Issues',
    'novedades_sub': 'Issues Admin',
    'configuracion': 'Email System Settings',
    'configuracion_sistema': 'Email System Configuration',
    'configuracion_correo': 'Email & Alerts',
    'configuracion_correo_sub': 'Notifications',
    'config_email': 'Email & Notifications',
    'roles_permisos': 'System Roles',
    'roles_permisos_sub': 'Roles',
    'usuarios_perfiles': 'System Users',
    'usuarios_perfiles_sub': 'APP Users',
    'auditoria_logs': 'Access Log',
    'auditoria_logs_sub': 'User Access',
    'cerrar_sesion': 'Logout',
    'buscar': 'Search system...',
    'registrar_nuevo': 'REGISTER NEW',
    'informacion_personal': 'Personal Information',
    
    // Page Titles
    'panel_ejecutivo': 'General Dashboard',
    'gestion_personal': 'Staff Management',
    'control_presupuesto': 'Cost Center',
    'planeacion_actividades': 'Activity Scheduling',
    'seguridad_sistemica': 'System Roles',
    'gestion_identidades': 'System Users',
    'auditoria_operaciones': 'Access Log',
    'gestion_horarios': 'Shifts Management',
    'mis_actividades': 'Activity Log',
    'calendario_actividades': 'Calendar',
    'inteligencia_operativa': 'Personal Information',
    
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
    'cargue_masivo': 'Bulk Data Upload',
    'cargue_masivo_sub': 'Upload from .CSV',
    'personalizacion': 'Appearance & Logo',
    'personalizacion_sub': 'Customize UI',
    'operaciones_centrales': 'Central Operations',

    // Common
    'editar': 'Edit',
    'cancelar': 'Cancel',
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
    'usuario': 'User',
    'notificar_responsable': 'Notify Execution Responsible',
    'notificar_supervisor': 'Notify Direct Supervisor',
    'msg_notif_auto': 'Automatic Activity Notifications',
    'desc_notif_auto': 'Define who should receive an informational email at the exact moment a new daily activity report is submitted.'
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
