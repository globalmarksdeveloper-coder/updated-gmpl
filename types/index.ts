// ─── Auth & User ──────────────────────────────────────────────────────────────

export type Role = 'admin' | 'am' | 'tse' | 'ba';

export interface JwtPayload {
  userId: number;
  userCode: string;
  employeeId: number;
  employeeCode: string;
  email: string;
  fullName: string;
  role: Role;
  roleName: string;
  iat?: number;
  exp?: number;
}

export interface User {
  userId: number;
  userCode: string;
  employeeId: number;
  employeeCode: string;
  email: string;
  fullName: string;
  role: Role;
  roleName: string;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave';

export interface AttendanceRecord {
  attendance_id: number;
  check_in: string | null;
  check_out: string | null;
  break_start: string | null;
  break_end: string | null;
  status: AttendanceStatus;
  store_name: string;
  shift_name: string;
}

export interface StoreAssignment {
  assignment_id: number;
  employee_id: number;
  store_id: number;
  shift_id: number;
  store_name: string;
  shift_name: string;
  tse_employee_id?: number | null;
  is_active: boolean;
}

export type AttendanceAction = 'checkin' | 'checkout' | 'break_start' | 'break_end';

// ─── Sales ────────────────────────────────────────────────────────────────────

export interface Sku {
  sku_id: number;
  sku_name: string;
  unit_of_measure: string;
  retail_price: number;
  category_name: string;
  brand_name: string;
  category_id?: number;
  brand_id?: number;
  is_active?: boolean;
}

export interface SaleItem {
  sku_id: number;
  qty: number;
  retail_price: number;
}

export interface SalesEntry {
  sales_entry_id: number;
  sales_date: string;
  store_name: string;
  total_sales: number;
  item_count: number;
  remarks: string | null;
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_bas: number;
  approved_bas: number;
  pending_bas: number;
  today_present: number;
  today_sales: number;
  monthly_sales: number;
}

export interface AttendanceRow {
  attendance_id: number;
  attendance_date: string;
  check_in: string | null;
  check_out: string | null;
  status: AttendanceStatus;
  first_name: string;
  email: string;
  store_name: string;
}

export interface SalesRow {
  sales_entry_id: number;
  sale_date: string;
  first_name: string;
  email: string;
  store_name: string;
  amount: number;
  quantity: number;
}

export interface PendingUser {
  id: number;
  email: string;
  full_name: string;
  role_name: string;
  created_at: string;
}

// ─── Employee Management ──────────────────────────────────────────────────────

export interface Employee {
  employee_id: number;
  employee_code: string;
  status: string;
  user_id: number;
  full_name: string;
  email: string;
  is_active: boolean;
  role_name: string;
  role_id: number;
  store_name: string | null;
  shift_name: string | null;
  tse_name: string | null;
  am_name: string | null;
  city_name: string | null;
}

export interface Store {
  store_id: number;
  store_name: string;
}

export interface Shift {
  shift_id: number;
  shift_name: string;
  start_time: string;
  end_time: string;
}

export interface City {
  city_id: number;
  city_name: string;
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface Brand {
  brand_id: number;
  brand_name: string;
}

export interface Category {
  category_id: number;
  category_name: string;
  brand_id: number;
  brand_name: string;
}

// ─── Hierarchy (TSC / AM) ─────────────────────────────────────────────────────

export interface BaWithData {
  employee_id: number;
  employee_code: string;
  full_name: string;
  shift_name: string;
  checked_in: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus | 'Absent';
  sales: number;
}

export interface StoreWithData {
  store_id: number;
  store_name: string;
  bas: BaWithData[];
  sales: number;
  present: number;
}

export interface TscWithData {
  tse_id: number;
  tse_code: string;
  tse_name: string;
  stores: StoreWithData[];
  today_sales: number;
  present_today: number;
  total_bas: number;
}

// ─── Flat report rows ─────────────────────────────────────────────────────────

export interface FlatAttendanceRow {
  full_name: string;
  employee_code: string;
  tse_name: string;
  store_name: string;
  shift_name: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: string;
}

export interface FlatSalesRow {
  full_name: string;
  employee_code: string;
  tse_name: string;
  store_name: string;
  remarks: string | null;
  total_sales: number;
  item_count: number;
}

// ─── Sale form (BA dashboard) ─────────────────────────────────────────────────

export interface SkuRow {
  sku_id: number;
  sku_name: string;
  retail_price: number;
  uom: string;
  qty: number;
}

export interface SaleLine {
  brand: string;
  category: string;
  skuRows: SkuRow[];
  selectedSkuIds: number[];
}

// ─── Location ─────────────────────────────────────────────────────────────────

export interface GpsLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}
