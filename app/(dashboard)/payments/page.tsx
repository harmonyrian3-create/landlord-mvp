'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { buildWhatsAppLink, rentReminderMessage } from '@/lib/whatsapp';
import { CheckCircle2, Clock, AlertCircle, MessageCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';

type Row = {
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  dueDay: number;
  unitNumber: string;
  propertyName: string;
  rentAmount: number;
  paymentId: string | null;
  status: 'paid' | 'pending' | 'overdue' | 'none';
  paidAt: string | null;
};

export default function PaymentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [landlordName, setLandlordName] = useState('');
  const [loading, setLoading] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: landlord } = await supabase
      .from('landlords')
      .select('name')
      .eq('id', user.id)
      .single();
    setLandlordName(landlord?.name ?? '');

    const { data: tenants } = await supabase
      .from('tenants')
      .select(
        `id, name, phone, due_day,
         units!inner(
           unit_number, rent_amount,
           properties!inner(name, landlord_id)
         )`
      )
      .eq('is_active', true)
      .eq('units.properties.landlord_id', user.id);

    if (!tenants) return;

    const tenantIds = tenants.map((t: any) => t.id);
    const { data: payments } = await supabase
      .from('payments')
      .select('*')
      .in('tenant_id', tenantIds)
      .eq('month', month);

    const paymentMap = new Map(payments?.map((p) => [p.tenant_id, p]) ?? []);

    const built: Row[] = tenants.map((t: any) => {
      const p = paymentMap.get(t.id);
      return {
        tenantId: t.id,
        tenantName: t.name,
        tenantPhone: t.phone,
        dueDay: t.due_day ?? 1,
        unitNumber: t.units.unit_number,
        propertyName: t.units.properties.name,
        rentAmount: Number(t.units.rent_amount),
        paymentId: p?.id ?? null,
        status: (p?.status as any) ?? 'none',
        paidAt: p?.paid_at ?? null,
      };
    });

    setRows(built);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  async function markPaid(row: Row) {
    setLoading(true);
    const supabase = createClient();
    if (row.paymentId) {
      await supabase
        .from('payments')
        .update({ status: 'paid', paid_at: new Date().toISOString() })
        .eq('id', row.paymentId);
    } else {
      await supabase.from('payments').insert({
        tenant_id: row.tenantId,
        amount: row.rentAmount,
        month,
        status: 'paid',
        paid_at: new Date().toISOString(),
      });
    }
    setLoading(false);
    load();
  }

  async function markOverdue(row: Row) {
    setLoading(true);
    const supabase = createClient();
    if (row.paymentId) {
      await supabase
        .from('payments')
        .update({ status: 'overdue' })
        .eq('id', row.paymentId);
    } else {
      await supabase.from('payments').insert({
        tenant_id: row.tenantId,
        amount: row.rentAmount,
        month,
        status: 'overdue',
      });
    }
    setLoading(false);
    load();
  }

  function copyMsg(row: Row) {
    const msg = rentReminderMessage({
      tenantName: row.tenantName,
      amount: row.rentAmount,
      month,
      landlordName: landlordName || 'your landlord',
      dueDay: row.dueDay,
    });
    navigator.clipboard.writeText(msg);
    alert('Message copied. Paste it to the tenant.');
  }

  const statusBadge = (s: Row['status']) => {
    const map = {
      paid: { icon: CheckCircle2, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
      pending: { icon: Clock, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
      overdue: { icon: AlertCircle, cls: 'bg-red-50 text-red-700 border-red-200' },
      none: { icon: Clock, cls: 'bg-slate-50 text-slate-600 border-slate-200' },
    }[s];
    const Icon = map.icon;
    const label = s === 'none' ? 'Not recorded' : s;
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${map.cls} capitalize`}
      >
        <Icon className="w-3 h-3" /> {label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-600">Record and track rent by month</p>
        </div>
        <input
          type="month"
          name="month"
          id="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
        />
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12 text-slate-500">
            No active tenants. Add properties, units and tenants first.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.tenantId}>
              <CardBody className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{row.tenantName}</div>
                  <div className="text-sm text-slate-500">
                    {row.propertyName} · Unit {row.unitNumber} · KES{' '}
                    {row.rentAmount.toLocaleString()} · Due on {row.dueDay}
                  </div>
                  {row.paidAt && (
                    <div className="text-xs text-emerald-600 mt-1">
                      Paid {format(new Date(row.paidAt), 'dd MMM yyyy')}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {statusBadge(row.status)}

                  <a
                    href={buildWhatsAppLink(
                      row.tenantPhone,
                      rentReminderMessage({
                        tenantName: row.tenantName,
                        amount: row.rentAmount,
                        month,
                        landlordName: landlordName || 'your landlord',
                        dueDay: row.dueDay,
                      })
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg font-medium transition bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                  </a>

                  <Button variant="secondary" onClick={() => copyMsg(row)}>
                    <Copy className="w-4 h-4" />
                  </Button>

                  {row.status !== 'paid' && (
                    <Button onClick={() => markPaid(row)} loading={loading}>
                      Mark paid
                    </Button>
                  )}

                  {row.status !== 'overdue' && row.status !== 'paid' && (
                    <Button variant="danger" onClick={() => markOverdue(row)} loading={loading}>
                      Overdue
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}