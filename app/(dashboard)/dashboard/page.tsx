import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Building2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: properties } = await supabase
    .from('properties')
    .select('id')
    .eq('landlord_id', user!.id);

  const propertyIds = properties?.map((p) => p.id) ?? [];

  const { data: units } = propertyIds.length
    ? await supabase.from('units').select('id').in('property_id', propertyIds)
    : { data: [] };

  const unitIds = units?.map((u) => u.id) ?? [];

  const { data: tenants } = unitIds.length
    ? await supabase
        .from('tenants')
        .select('id')
        .in('unit_id', unitIds)
        .eq('is_active', true)
    : { data: [] };

  const tenantIds = tenants?.map((t) => t.id) ?? [];

  const currentMonth = new Date().toISOString().slice(0, 7);

  const { data: payments } = tenantIds.length
    ? await supabase
        .from('payments')
        .select('status, amount')
        .in('tenant_id', tenantIds)
        .eq('month', currentMonth)
    : { data: [] };

  const paid = payments?.filter((p) => p.status === 'paid').length ?? 0;
  const overdue = payments?.filter((p) => p.status === 'overdue').length ?? 0;
  const collected =
    payments
      ?.filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;

  const stats = [
    { label: 'Properties', value: properties?.length ?? 0, icon: Building2, color: 'text-blue-600' },
    { label: 'Active tenants', value: tenants?.length ?? 0, icon: Users, color: 'text-slate-700' },
    { label: 'Paid this month', value: paid, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: 'Overdue', value: overdue, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
      <p className="text-slate-600 mb-8">
        {new Date().toLocaleString('en-KE', { month: 'long', year: 'numeric' })}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardBody>
              <Icon className={`w-5 h-5 mb-3 ${color}`} />
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-500">{label}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Collected this month</h2>
            <span className="text-2xl font-bold text-emerald-600">
              KES {collected.toLocaleString()}
            </span>
          </div>
        </CardHeader>
        <CardBody>
          {propertyIds.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">
                You haven&apos;t added any properties yet.
              </p>
              <Link
                href="/properties"
                className="inline-block bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800"
              >
                Add your first property
              </Link>
            </div>
          ) : (
            <Link href="/payments" className="text-sm text-slate-600 hover:text-slate-900">
              View all payments →
            </Link>
          )}
        </CardBody>
      </Card>
    </div>
  );
}