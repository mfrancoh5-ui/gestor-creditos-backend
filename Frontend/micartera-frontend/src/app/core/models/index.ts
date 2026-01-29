export interface Usuario {
  id: number;
  email: string;
  rol: 'ADMIN' | 'COBRADOR' | 'VIEWER';
  createdAt: string;
}

export interface LoginResponse {
  success: boolean;
  statusCode: number;
  data: {
    access_token: string;
    refresh_token: string;
    user: Usuario;
  };
  message: string;
}

export interface Cliente {
  id: number;
  nombre: string;
  dni: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface ClienteResponse {
  success: boolean;
  data: Cliente | Cliente[];
  message: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Credito {
  id: number;
  clienteId: number;
  monto: number;
  tasaInteres: number;
  plazoMeses: number;
  plan: string;
  estado: string;
  cuotaMensual?: number;
  cuotasRestantes?: number;
  createdAt: string;
}

export interface Pago {
  id: number;
  creditoId: number;
  monto: number;
  fecha: string;
  tipo: string;
  estado: string;
  createdAt: string;
}

export interface DashboardStats {
  totalClientes: number;
  totalCreditos: number;
  creditosActivos: number;
  montoTotal: number;
  recaudacion: number;
  morosidad: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}
