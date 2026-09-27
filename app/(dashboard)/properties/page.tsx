'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import { Building2, Plus, Trash2 } from 'lucide-react';
import type { Property } from '@/lib/types';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });
    setProperties(data ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addProperty() {
    if (!name.trim()) return;
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('properties').insert({
      landlord_id: user!.id,
      name,
      location: location || null,
    });
    setName('');
    setLocation('');
    setShowForm(false);
    setLoading(false);
    load();
  }

  async function deleteProperty(e: React.MouseEvent, id: string, name: string) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${name}"?\n\nThis will also delete all units and tenants inside it. This cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(id);
    const supabase = createClient();
    await supabase.from('properties').delete().eq('id', id);
    setDeletingId(null);
    load();
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Properties</h1>
          <p className="text-slate-600">Buildings you manage</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add property
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardBody className="space-y-4">
            <Input
              placeholder="Property name (e.g. Kilimani Apartments)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              placeholder="Location (optional)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
            <div className="flex gap-3">
              <Button onClick={addProperty} loading={loading}>
                Save
              </Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {properties.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              No properties yet. Add your first one above.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`}>
              <Card className="hover:border-slate-400 transition cursor-pointer relative">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Building2 className="w-5 h-5 text-slate-400 mb-2" />
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="text-sm text-slate-500">
                        {p.location || 'No location'}
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteProperty(e, p.id, p.name)}
                      disabled={deletingId === p.id}
                      title="Delete property"
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}