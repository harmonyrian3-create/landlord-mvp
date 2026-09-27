'use client';

import { useEffect, useState, use } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Plus, User, Phone, Calendar, Trash2 } from 'lucide-react';
import type { Unit, Tenant } from '@/lib/types';

type UnitWithTenant = Unit & { tenants: Tenant[] };

export default function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [units, setUnits] = useState<UnitWithTenant[]>([]);
  const [propertyName, setPropertyName] = useState('');

  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitNumber, setUnitNumber] = useState('');
  const [rentAmount, setRentAmount] = useState('');

  const [tenantFormFor, setTenantFormFor] = useState<string | null>(null);
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantDueDay, setTenantDueDay] = useState('1');

  const [loading, setLoading] = useState(false);

  async function load() {
    const supabase = createClient();
    const { data: prop } = await supabase
      .from('properties')
      .select('name')
      .eq('id', id)
      .single();
    setPropertyName(prop?.name ?? '');

    const { data } = await supabase
      .from('units')
      .select('*, tenants(*)')
      .eq('property_id', id)
      .order('unit_number');
    setUnits((data as UnitWithTenant[]) ?? []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addUnit() {
    if (!unitNumber.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('units').insert({
      property_id: id,
      unit_number: unitNumber,
      rent_amount: Number(rentAmount) || 0,
    });
    setUnitNumber('');
    setRentAmount('');
    setShowUnitForm(false);
    setLoading(false);
    load();
  }

  async function addTenant(unitId: string) {
    if (!tenantName.trim() || !tenantPhone.trim()) return;
    setLoading(true);
    const supabase = createClient();
    await supabase.from('tenants').insert({
      unit_id: unitId,
      name: tenantName,
      phone: tenantPhone,
      due_day: Number(tenantDueDay) || 1,
    });
    setTenantName('');
    setTenantPhone('');
    setTenantDueDay('1');
    setTenantFormFor(null);
    setLoading(false);
    load();
  }

  async function deleteUnit(unitId: string, unitLabel: string) {
    const confirmed = window.confirm(
      `Delete Unit ${unitLabel}?\n\nThis will also delete any tenant in it. This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.from('units').delete().eq('id', unitId);
    setLoading(false);
    load();
  }

  async function deleteTenant(tenantId: string, tenantName: string) {
    const confirmed = window.confirm(
      `Remove tenant "${tenantName}"?\n\nTheir payment history will also be deleted. This cannot be undone.`
    );
    if (!confirmed) return;

    setLoading(true);
    const supabase = createClient();
    await supabase.from('tenants').delete().eq('id', tenantId);
    setLoading(false);
    load();
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{propertyName}</h1>
        <p className="text-slate-600">Units and tenants</p>
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowUnitForm(!showUnitForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add unit
        </Button>
      </div>

      {showUnitForm && (
        <Card className="mb-6">
          <CardBody className="space-y-4">
            <Input
              placeholder="Unit number (e.g. A1)"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
            />
            <Input
              placeholder="Monthly rent (KES)"
              type="number"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={addUnit} loading={loading}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => setShowUnitForm(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {units.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12 text-slate-500">
            No units yet. Add one above.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {units.map((u) => {
            const tenant = u.tenants?.[0];
            return (
              <Card key={u.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold text-slate-900">
                        Unit {u.unit_number}
                      </div>
                      <div className="text-sm text-slate-500">
                        KES {Number(u.rent_amount).toLocaleString()} / month
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!tenant && (
                        <Button
                          variant="secondary"
                          onClick={() =>
                            setTenantFormFor(tenantFormFor === u.id ? null : u.id)
                          }
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add tenant
                        </Button>
                      )}
                      <button
                        onClick={() => deleteUnit(u.id, u.unit_number)}
                        title="Delete unit"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  {tenant ? (
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <span className="flex items-center gap-2 text-slate-700">
                          <User className="w-4 h-4 text-slate-400" /> {tenant.name}
                        </span>
                        <span className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-4 h-4 text-slate-400" /> {tenant.phone}
                        </span>
                        <span className="flex items-center gap-2 text-slate-700">
                          <Calendar className="w-4 h-4 text-slate-400" /> Due on{' '}
                          {tenant.due_day}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTenant(tenant.id, tenant.name)}
                        title="Remove tenant"
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : tenantFormFor === u.id ? (
                    <div className="space-y-3">
                      <Input
                        placeholder="Tenant name"
                        value={tenantName}
                        onChange={(e) => setTenantName(e.target.value)}
                      />
                      <Input
                        placeholder="Phone (07XX...)"
                        value={tenantPhone}
                        onChange={(e) => setTenantPhone(e.target.value)}
                      />
                      <div>
                        <label className="text-sm text-slate-600 mb-1 block">
                          Rent due day of month
                        </label>
                        <select
                          value={tenantDueDay}
                          onChange={(e) => setTenantDueDay(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                        >
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => addTenant(u.id)} loading={loading}>
                          Save
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setTenantFormFor(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Vacant</p>
                  )}
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}