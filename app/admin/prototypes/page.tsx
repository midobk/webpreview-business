'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '../_components/AdminShell';
import { PrototypeCard } from '../_components/PrototypeCard';
import { ToastStack, type Toast } from '../_components/Toast';
import { IconPrototypes, IconShowcase, IconBolt } from '../_components/icons';
import type { Lead, Prototype } from '../_components/types';

export default function PrototypesPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [protoFilter, setProtoFilter] = useState<'all' | 'needs_review' | 'eligible' | 'showcase'>('all');
  const [toast, setToast] = useState<Toast | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      const [leadsRes, protoRes] = await Promise.all([
        fetch('/api/admin/leads'),
        fetch('/api/admin/prototypes'),
      ]);
      if (!leadsRes.ok) throw new Error('Failed to fetch leads');
      const leadsData = await leadsRes.json();
      setLeads(Array.isArray(leadsData) ? leadsData : []);

      if (!protoRes.ok) throw new Error('Failed to fetch prototypes');
      const protoData = await protoRes.json();
      setPrototypes(Array.isArray(protoData) ? protoData : []);
    } catch (err) {
      console.error(err);
      setToast({ id: Date.now(), message: 'Failed to load data', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (
    message: string,
    tone: 'default' | 'success' | 'error' = 'default',
    undo?: () => void
  ) => {
    setToast({ id: Date.now(), message, tone, undo });
  };

  const toggleShowcase = async (id: string, approved: boolean) => {
    const previous = prototypes.find((p) => p.id === id)?.showcase_approved;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/prototypes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, showcase_approved: approved }),
      });
      if (!res.ok) throw new Error('Toggle failed');
      setPrototypes((prev) =>
        prev.map((p): Prototype => (p.id === id ? { ...p, showcase_approved: approved } : p))
      );
      showToast(
        approved ? 'Approved for showcase' : 'Removed from showcase',
        'success',
        previous !== undefined
          ? async () => {
              try {
                await fetch('/api/admin/prototypes', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id, showcase_approved: previous }),
                });
                setPrototypes((prev) =>
                  prev.map((p): Prototype => (p.id === id ? { ...p, showcase_approved: previous } : p))
                );
              } catch (e) {
                console.error('Undo failed:', e);
              }
            }
          : undefined
      );
    } catch (err) {
      console.error('Toggle failed:', err);
      showToast('Toggle failed — please try again', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const toggleEligible = async (id: string, eligible: boolean) => {
    const target = prototypes.find((p) => p.id === id);
    const previous = target?.showcase_eligible;
    const previousApproved = target?.showcase_approved ?? false;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/prototypes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, showcase_eligible: eligible }),
      });
      if (!res.ok) throw new Error('Eligibility update failed');
      // Mirror the server side: when a prototype is moved back out of
      // eligibility, the API also clears `showcase_approved` so the card
      // disappears from the public showcase. The local state has to match
      // that, otherwise the admin card, count and undo button keep showing
      // the prototype as live even after Supabase/local JSON unpublished it.
      setPrototypes((prev) =>
        prev.map((p): Prototype =>
          p.id === id
            ? eligible
              ? { ...p, showcase_eligible: eligible }
              : { ...p, showcase_eligible: eligible, showcase_approved: false }
            : p
        )
      );
      showToast(eligible ? 'Marked ready for showcase review' : 'Moved back to review', 'success', previous !== undefined ? async () => {
        await fetch('/api/admin/prototypes', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, showcase_eligible: previous }) });
        setPrototypes((prev) =>
          prev.map((p): Prototype =>
            p.id === id
              ? { ...p, showcase_eligible: previous as boolean, showcase_approved: previousApproved }
              : p
          )
        );
      } : undefined);
    } catch (err) {
      console.error(err);
      showToast('Eligibility update failed — please try again', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (e) {
      /* ignore */
    }
    router.push('/admin');
  };

  const filteredPrototypes = useMemo(() => {
    let list = prototypes;
    if (protoFilter === 'needs_review') list = list.filter((p) => !p.showcase_eligible && !p.showcase_approved);
    if (protoFilter === 'eligible') list = list.filter((p) => p.showcase_eligible && !p.showcase_approved);
    if (protoFilter === 'showcase') list = list.filter((p) => p.showcase_approved);
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((p) => {
      const lead = leads.find((l) => l.id === p.lead_id);
      return (
        (p.title || '').toLowerCase().includes(q) ||
        (p.design_summary || '').toLowerCase().includes(q) ||
        (lead?.business_name || lead?.businessName || '').toLowerCase().includes(q) ||
        (lead?.industry || '').toLowerCase().includes(q) ||
        (lead?.city || '').toLowerCase().includes(q)
      );
    });
  }, [prototypes, leads, search, protoFilter]);

  const showcaseCount = prototypes.filter((p) => p.showcase_approved).length;
  const recentCount = prototypes.filter((p) => {
    if (!p.created_at) return false;
    const ageMs = Date.now() - new Date(p.created_at).getTime();
    return ageMs < 1000 * 60 * 60 * 24 * 7;
  }).length;

  if (loading) {
    return (
      <div
        className="admin-shell min-h-screen grid place-items-center"
        style={{ background: 'var(--adm-bg-app)' }}
      >
        <div className="text-center">
          <div
            className="mx-auto rounded-full"
            style={{
              width: 36,
              height: 36,
              border: '3px solid var(--adm-bg-active)',
              borderTopColor: 'var(--adm-accent)',
              animation: 'admSpin 0.9s linear infinite',
            }}
            aria-hidden
          />
          <style>{`@keyframes admSpin { to { transform: rotate(360deg); } }`}</style>
          <p className="mt-3 text-sm" style={{ color: 'var(--adm-text-secondary)' }}>
            Loading prototypes…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminShell
        title="Prototypes"
        breadcrumb={
          <>
            <span>Seaway Sites</span>
            <span>/</span>
            <span style={{ color: 'var(--adm-text-primary)' }}>Prototypes</span>
          </>
        }
        actions={
          <button
            onClick={handleLogout}
            className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors"
            style={{
              background: 'var(--adm-bg-subtle)',
              color: 'var(--adm-text-secondary)',
              border: '1px solid var(--adm-border)',
            }}
          >
            Logout
          </button>
        }
      >
        {/* KPI strip */}
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div
            className="rounded-xl p-5 adm-lift"
            style={{
              background: 'var(--adm-bg-surface)',
              border: '1px solid var(--adm-border)',
              boxShadow: 'var(--adm-shadow-sm)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--adm-text-muted)' }}
              >
                Total prototypes
              </span>
              <span
                className="grid place-items-center rounded-lg"
                style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(99, 102, 241, 0.10)',
                  color: 'var(--adm-accent)',
                }}
              >
                <IconPrototypes size={14} />
              </span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: 'var(--adm-text-primary)' }}
            >
              {prototypes.length}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>
              Across all leads
            </p>
          </div>

          <div
            className="rounded-xl p-5 adm-lift"
            style={{
              background: 'var(--adm-bg-surface)',
              border: '1px solid var(--adm-border)',
              boxShadow: 'var(--adm-shadow-sm)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--adm-text-muted)' }}
              >
                On showcase
              </span>
              <span
                className="grid place-items-center rounded-lg"
                style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(236, 72, 153, 0.10)',
                  color: 'var(--adm-accent-3)',
                }}
              >
                <IconShowcase size={14} />
              </span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: 'var(--adm-text-primary)' }}
            >
              {showcaseCount}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>
              Approved and live
            </p>
          </div>

          <div
            className="rounded-xl p-5 adm-lift col-span-2 lg:col-span-1"
            style={{
              background: 'var(--adm-bg-surface)',
              border: '1px solid var(--adm-border)',
              boxShadow: 'var(--adm-shadow-sm)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--adm-text-muted)' }}
              >
                Added this week
              </span>
              <span
                className="grid place-items-center rounded-lg"
                style={{
                  width: 28,
                  height: 28,
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--adm-warning)',
                }}
              >
                <IconBolt size={14} />
              </span>
            </div>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: 'var(--adm-text-primary)' }}
            >
              {recentCount}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--adm-text-muted)' }}>
              Last 7 days
            </p>
          </div>
        </section>

        {/* Filter + gallery */}
        <section
          className="rounded-xl overflow-hidden"
          style={{
            background: 'var(--adm-bg-surface)',
            border: '1px solid var(--adm-border)',
            boxShadow: 'var(--adm-shadow-sm)',
          }}
        >
          <div
            className="flex flex-col sm:flex-row gap-2 px-4 py-3"
            style={{
              borderBottom: '1px solid var(--adm-border)',
              background: 'var(--adm-bg-subtle)',
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by business, industry, city, style…"
              aria-label="Search prototypes"
              className="flex-1 text-sm rounded-md px-3 py-2 outline-none"
              style={{
                background: 'var(--adm-bg-surface)',
                border: '1px solid var(--adm-border)',
                color: 'var(--adm-text-primary)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--adm-accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--adm-accent-soft)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--adm-border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            <div
              className="inline-flex p-0.5 rounded-lg self-start"
              style={{
                background: 'var(--adm-bg-subtle)',
                border: '1px solid var(--adm-border)',
              }}
            >
              {(['all', 'needs_review', 'eligible', 'showcase'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setProtoFilter(f)}
                  className="text-xs font-medium px-3 py-1.5 rounded-md transition-colors capitalize"
                  style={{
                    background: protoFilter === f ? 'var(--adm-bg-surface)' : 'transparent',
                    color:
                      protoFilter === f ? 'var(--adm-text-primary)' : 'var(--adm-text-secondary)',
                    boxShadow: protoFilter === f ? 'var(--adm-shadow-sm)' : 'none',
                  }}
                >
                  {f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4">
            {filteredPrototypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPrototypes.map((proto) => (
                  <PrototypeCard
                    key={proto.id}
                    proto={proto}
                    lead={leads.find((l) => l.id === proto.lead_id)}
                    onToggleShowcase={toggleShowcase}
                    onToggleEligible={toggleEligible}
                    updating={updating}
                  />
                ))}
              </div>
            ) : (
              <div
                className="text-center py-14 rounded-xl"
                style={{
                  background: 'var(--adm-bg-subtle)',
                  border: '1px dashed var(--adm-border-strong)',
                }}
              >
                <p className="text-sm" style={{ color: 'var(--adm-text-secondary)' }}>
                  {search
                    ? 'No prototypes match your search.'
                    : protoFilter === 'showcase'
                    ? 'No prototypes approved for showcase yet.'
                    : protoFilter === 'eligible'
                    ? 'No prototypes are waiting for showcase approval.'
                    : protoFilter === 'needs_review'
                    ? 'No prototypes need review.'
                    : 'No prototypes generated yet.'}
                </p>
              </div>
            )}
          </div>

          <div
            className="px-4 py-2.5 text-[11px]"
            style={{
              borderTop: '1px solid var(--adm-border)',
              background: 'var(--adm-bg-subtle)',
              color: 'var(--adm-text-muted)',
            }}
          >
            Showing {filteredPrototypes.length} of {prototypes.length} prototypes
          </div>
        </section>
      </AdminShell>

      <ToastStack toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
