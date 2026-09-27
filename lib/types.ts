export type Landlord = {
  id: string;
  phone: string;
  name: string;
  created_at: string;
};

export type Property = {
  id: string;
  landlord_id: string;
  name: string;
  location: string | null;
  created_at: string;
};

export type Unit = {
  id: string;
  property_id: string;
  unit_number: string;
  rent_amount: number;
  created_at: string;
};

export type Tenant = {
  id: string;
  unit_id: string;
  name: string;
  phone: string;
  due_day: number;
  move_in_date: string;
  is_active: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  tenant_id: string;
  amount: number;
  month: string;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
  created_at: string;
};