'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '../_components/AdminShell';
import { StatCard } from '../_components/StatCard';
import { StatusBadge } from '../_components/StatusBadge';
import { LeadDetailDrawer } from '../_components/LeadDetailDrawer';
import { PrototypeCard } from '../_components/PrototypeCard';
import { ToastStack, type Toast } from '../_components/Toast';
import {
  IconLeads,
  IconPrototypes,
  IconBolt,
  IconSearch,
  IconSparkle,
} from '../_components/icons';
import type { Lead, Prototype } from '../_components/types';

const getLeadName = (l: Lead) => l.business_name || l.businessName || 'Unknown';
const getLeadScore = (l: Lead) => l.lead_score ?? 0;
const getLeadStatus = (l: Lead) => l.status || 'unknown';

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<Toast | null>(null);
  const [protoFilter, setProtoFilter] = useState<'all' | 'showcase'>('all');
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
      showToast('Failed to load data', 'error');
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

  const updateLeadStatus = async (id: string, status: string) => {
    const previous = leads.find((l) => l.id === id)?.status;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Update failed');
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selectedLead?.id === id)
        setSelectedLead((prev): Lead | null => (prev ? { ...prev, status } : null));
      showToast(
        `Status updated to "${status.replace(/_/g, ' ')}"`,
        'success',
        previous
          ? async () => {
              try {
                await fetch('/api/admin/leads', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id, status: previous }),
                });
                setLeads((prev) =>
                  prev.map((l) => (l.id === id ? { ...l, status: previous } : l))
                );
              } catch (e) {
                console.error('Undo failed:', e);
              }
            }
          : undefined
      );
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Update failed — please try again', 'error');
    } finally {
      setUpdating(false);
    }
  };

  const saveNote = async (id: string, note: string) => {
    if (!note.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: note }),
      });
      if (!res.ok) throw new Error('Save failed');
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: note } : l)));
      if (selectedLead?.id === id)
        setSelectedLead((prev): Lead | null => (prev ? { ...prev, notes: note } : null));
      showToast('Note saved', 'success');
    } catch (err) {
      console.error('Save note failed:', err);
      showToast('Failed to save note', 'error');
    } finally {
      setUpdating(false);
    }
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

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (e) {
      /* ignore */
    }
    router.push('/admin');
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && getLeadStatus(lead) !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        getLeadName(lead).toLowerCase().includes(q) ||
        (lead.city || '').toLowerCase().includes(q) ||
        (lead.province || '').toLowerCase().includes(q) ||
        (lead.email || '').toLowerCase().includes(q) ||
        (lead.industry || '').toLowerCase().includes(q)
      );
    });
  }, [leads, search, statusFilter]);

  const allStatuses = useMemo(
    () => Array.from(new Set(leads.map(getLeadStatus))).sort(),
    [leads]
  );

  const readyCount = leads.filter((l) => getLeadStatus(l) === 'ready_for_prototype').length;
  const wonCount = leads.filter((l) => getLeadStatus(l) === 'won').length;
  const avgScore = leads.length
    ? Math.round(leads.reduce((s, l) => s + getLeadScore(l), 0) / leads.length)
    : 0;
  const showcaseCount = prototypes.filter((p) => p.showcase_approved).length;

  const filteredPrototypes = useMemo(
    () =>
      protoFilter === 'showcase'
        ? prototypes.filter((p) => p.showcase_approved)
        : prototypes,
    [prototypes, protoFilter]
  );

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
            Loading console…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <AdminShell
        title="Leads"
        breadcrumb={
          <>
            <span>SiteSprint</span>
            <span>/</span>
            <span style={{ color: 'var(--adm-text-primary)' }}>Console</span>
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
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total leads"
            value={leads.length}
            hint={`${filteredLeads.length} matching filters`}
            icon={<IconLeads size={18} />}
            accent="indigo"
          />
          <StatCard
            label="Prototypes"
            value={prototypes.length}
            hint={`${showcaseCount} on showcase`}
            icon={<IconPrototypes size={18} />}
            accent="violet"
          />
          <StatCard
            label="Ready for prototype"
            value={readyCount}
            hint="High-intent next up"
            icon={<IconBolt size={18} />}
            accent="pink"
          />
          <StatCard
            label="Avg lead score"
            value={avgScore}
            hint={`${wonCount} won`}
            icon={<IconSparkle size={18} />}
            accent="green"
          />
        </section>

        {/* Filter bar + table */}
        <section
          className="rounded-xl overflow-hidden mb-6"
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
            <div className="relative flex-1">
              <span
                className="absolute inset-y-0 left-0 grid place-items-center pl-3"
                style={{ color: 'var(--adm-text-muted)' }}
              >
                <IconSearch size={14} />
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, city, email, industry…"
                aria-label="Search leads"
                className="w-full text-sm rounded-md pl-9 pr-3 py-2 outline-none"
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
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter leads by status"
              className="text-sm rounded-md px-3 py-2 outline-none cursor-pointer"
              style={{
                background: 'var(--adm-bg-surface)',
                border: '1px solid var(--adm-border)',
                color: 'var(--adm-text-primary)',
              }}
            >
              <option value="all">All statuses ({leads.length})</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')} ({leads.filter((l) => getLeadStatus(l) === s).length})
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ background: 'var(--adm-bg-subtle)' }}>
                  {['Business', 'Industry', 'Score', 'Website', 'Status', 'Email'].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--adm-text-muted)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead, i) => {
                  const score = getLeadScore(lead);
                  const scoreColor =
                    score >= 80
                      ? 'var(--adm-success)'
                      : score >= 60
                      ? 'var(--adm-warning)'
                      : 'var(--adm-text-muted)';
                  const selected = selectedLead?.id === lead.id;
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      aria-label={`View details for ${getLeadName(lead)}`}
                      className="cursor-pointer transition-colors"
                      style={{
                        borderTop: i === 0 ? 'none' : '1px solid var(--adm-border-subtle)',
                        background: selected ? 'var(--adm-accent-soft)' : 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        if (!selected) e.currentTarget.style.background = 'var(--adm-bg-hover)';
                      }}
                      onMouseLeave={(e) => {
                        if (!selected) e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p
                          className="text-sm font-medium"
                          style={{ color: 'var(--adm-text-primary)' }}
                        >
                          {getLeadName(lead)}
                        </p>
                        <p className="text-[11px]" style={{ color: 'var(--adm-text-muted)' }}>
                          {lead.city || '—'}, {lead.province || '—'}
                        </p>
                      </td>
                      <td
                        className="px-4 py-3 text-sm capitalize"
                        style={{ color: 'var(--adm-text-secondary)' }}
                      >
                        {lead.industry?.replace(/_/g, ' ') || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-sm font-semibold tabular-nums"
                          style={{ color: scoreColor }}
                        >
                          {score}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {lead.website_status ? (
                          <StatusBadge status={lead.website_status} size="sm" withDot={false} />
                        ) : (
                          <span style={{ color: 'var(--adm-text-muted)' }} className="text-xs">
                            —
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={getLeadStatus(lead)} size="sm" />
                      </td>
                      <td className="px-4 py-3 max-w-[220px]">
                        <span
                          className="text-sm block truncate"
                          style={{ color: 'var(--adm-text-secondary)' }}
                          title={lead.email || ''}
                        >
                          {lead.email || '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredLeads.length === 0 && (
              <div className="py-14 text-center">
                <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>
                  {search || statusFilter !== 'all'
                    ? 'No leads match your filters.'
                    : 'No leads yet — run discovery to populate.'}
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
            Showing {filteredLeads.length} of {leads.length} — click any row to view details
          </div>
        </section>

        {/* Prototypes gallery */}
        <section id="prototypes">
          <div className="flex items-end justify-between mb-3">
            <div>
              <h2
                className="text-base font-semibold"
                style={{ color: 'var(--adm-text-primary)' }}
              >
                Prototypes
              </h2>
              <p className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>
                {prototypes.length} total · {showcaseCount} approved for showcase
              </p>
            </div>
            <div
              className="inline-flex p-0.5 rounded-lg"
              style={{
                background: 'var(--adm-bg-subtle)',
                border: '1px solid var(--adm-border)',
              }}
            >
              {(['all', 'showcase'] as const).map((f) => (
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
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredPrototypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPrototypes.map((proto) => (
                <PrototypeCard
                  key={proto.id}
                  proto={proto}
                  lead={leads.find((l) => l.id === proto.lead_id)}
                  onToggleShowcase={toggleShowcase}
                  updating={updating}
                />
              ))}
            </div>
          ) : (
            <div
              className="text-center py-12 rounded-xl"
              style={{
                background: 'var(--adm-bg-surface)',
                border: '1px dashed var(--adm-border-strong)',
              }}
            >
              <p className="text-sm" style={{ color: 'var(--adm-text-secondary)' }}>
                {protoFilter === 'showcase'
                  ? 'No prototypes approved for showcase yet.'
                  : 'No prototypes generated yet.'}
              </p>
            </div>
          )}
        </section>
      </AdminShell>

      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdateStatus={updateLeadStatus}
          onSaveNote={saveNote}
          updating={updating}
        />
      )}

      <ToastStack toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}