'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface Lead {
  id: string;
  business_name?: string;
  businessName?: string;
  slug?: string;
  industry?: string;
  city?: string;
  province?: string;
  email?: string;
  email_source_url?: string;
  website_url?: string | null;
  website_status?: string;
  lead_score?: number;
  score_reasoning?: string;
  contact_safety_status?: string;
  status?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  services?: string[];
  description?: string;
  phone?: string;
  source_urls?: string[];
}

interface Prototype {
  id: string;
  lead_id?: string;
  title?: string;
  prototype_url?: string;
  screenshot_url?: string;
  design_summary?: string;
  prototype_score?: number;
  generation_model?: string;
  generation_status?: string;
  watermark_enabled?: boolean;
  demo_locked?: boolean;
  showcase_eligible?: boolean | null;
  showcase_approved?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function AdminDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedPrototype, setSelectedPrototype] = useState<Prototype | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savedNoteId, setSavedNoteId] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toast, setToast] = useState<{ id: number; message: string; undo?: () => void } | null>(null);
  const [activeTab, setActiveTab] = useState<'leads' | 'prototypes'>('leads');
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
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showToast = (
    message: string,
    undo?: () => void,
    duration = 5000
  ) => {
    const id = Date.now();
    setToast({ id, message, undo });
    window.setTimeout(() => {
      setToast((t) => (t?.id === id ? null : t));
    }, duration);
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
      if (selectedLead?.id === id) setSelectedLead((prev) => (prev ? { ...prev, status } : null));
      showToast(
        `Status updated to "${status.replace(/_/g, ' ')}"`,
        previous
          ? async () => {
              try {
                await fetch('/api/admin/leads', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id, status: previous }),
                });
                setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status: previous } : l)));
              } catch (e) {
                console.error('Undo failed:', e);
              }
            }
          : undefined
      );
    } catch (err) {
      console.error('Update failed:', err);
      showToast('Update failed — please try again');
    } finally {
      setUpdating(false);
    }
  };

  const saveNote = async (id: string) => {
    if (!noteText.trim()) return;
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, notes: noteText }),
      });
      if (!res.ok) throw new Error('Save failed');
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, notes: noteText } : l)));
      if (selectedLead?.id === id) setSelectedLead((prev) => (prev ? { ...prev, notes: noteText } : null));
      setSavedNoteId(id);
      window.setTimeout(() => setSavedNoteId((s) => (s === id ? null : s)), 2000);
    } catch (err) {
      console.error('Save note failed:', err);
      showToast('Failed to save note');
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
        prev.map((p) => (p.id === id ? { ...p, showcase_approved: approved } : p))
      );
      showToast(
        approved ? 'Approved for showcase' : 'Removed from showcase',
        previous !== undefined
          ? async () => {
              try {
                await fetch('/api/admin/prototypes', {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ id, showcase_approved: previous }),
                });
                setPrototypes((prev) =>
                  prev.map((p) => (p.id === id ? { ...p, showcase_approved: previous } : p))
                );
              } catch (e) {
                console.error('Undo failed:', e);
              }
            }
          : undefined
      );
    } catch (err) {
      console.error('Toggle failed:', err);
      showToast('Toggle failed — please try again');
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/login', { method: 'DELETE' });
    } catch (e) {}
    router.push('/admin');
  };

  const getLeadName = (l: Lead) => l.business_name || l.businessName || 'Unknown';
  const getLeadScore = (l: Lead) => l.lead_score ?? 0;
  const getLeadStatus = (l: Lead) => l.status || 'unknown';
  const getPrototypeSlug = (p: Prototype) => {
    const lead = leads.find((l) => l.id === p.lead_id);
    return lead?.slug || '';
  };

  const statusColors: Record<string, string> = {
    discovered: 'bg-blue-100 text-blue-800',
    ready_for_prototype: 'bg-purple-100 text-purple-800',
    prototype_generated: 'bg-indigo-100 text-indigo-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    replied: 'bg-cyan-100 text-cyan-800',
    won: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
    do_not_contact: 'bg-gray-300 text-gray-800',
    new: 'bg-blue-100 text-blue-800',
  };

  const filteredLeads = leads.filter((lead) => {
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

  const allStatuses = Array.from(new Set(leads.map(getLeadStatus))).sort();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 text-white font-bold w-9 h-9 rounded-lg flex items-center justify-center text-lg">S</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none">Admin</h1>
              <nav aria-label="Breadcrumb" className="text-xs text-gray-500 mt-0.5">
                <span className="text-gray-700">{activeTab === 'leads' ? 'Leads' : 'Prototypes'}</span>
              </nav>
            </div>
          </div>
          <button onClick={handleLogout} className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50">
            Logout
          </button>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-gray-900 text-white rounded-lg shadow-2xl px-4 py-3 flex items-center gap-3">
          <span className="text-sm">{toast.message}</span>
          {toast.undo && (
            <button
              onClick={() => {
                toast.undo?.();
                setToast(null);
              }}
              className="text-sm font-semibold text-indigo-300 hover:text-indigo-200"
            >
              Undo
            </button>
          )}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Total Leads</p>
            <p className="text-2xl font-bold text-gray-900">{leads.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Prototypes</p>
            <p className="text-2xl font-bold text-gray-900">{prototypes.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Ready for Prototype</p>
            <p className="text-2xl font-bold text-indigo-600">
              {leads.filter(l => getLeadStatus(l) === 'ready_for_prototype').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500">Avg Lead Score</p>
            <p className="text-2xl font-bold text-green-600">
              {leads.length ? Math.round(leads.reduce((s, l) => s + getLeadScore(l), 0) / leads.length) : 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('leads')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'leads' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('prototypes')}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${activeTab === 'prototypes' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Prototypes ({prototypes.length})
          </button>
        </div>

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead List */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Search + filter row */}
              <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row gap-2 bg-gray-50">
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, city, email, or industry…"
                  className="flex-1 text-sm border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label="Search leads"
                />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-3 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  aria-label="Filter leads by status"
                >
                  <option value="all">All statuses</option>
                  {allStatuses.map((s) => (
                    <option key={s} value={s}>
                      {s.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Industry</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => { setSelectedLead(lead); setNoteText(lead.notes || ''); }}
                        aria-label={`View details for ${getLeadName(lead)}`}
                        className={`cursor-pointer hover:bg-gray-50 ${selectedLead?.id === lead.id ? 'bg-indigo-50' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{getLeadName(lead)}</div>
                          <div className="text-xs text-gray-500">{lead.city}, {lead.province}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{lead.industry?.replace(/_/g, ' ') || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${getLeadScore(lead) >= 80 ? 'text-green-600' : getLeadScore(lead) >= 60 ? 'text-yellow-600' : 'text-gray-400'}`}>
                            {getLeadScore(lead)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${lead.website_status === 'none' ? 'bg-red-100 text-red-700' : lead.website_status === 'ugly' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                            {lead.website_status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[getLeadStatus(lead)] || 'bg-gray-100 text-gray-600'}`}>
                            {getLeadStatus(lead).replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px]">
                          <span className="block truncate" title={lead.email || ''}>
                            {lead.email || '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && (
                  <div className="py-12 text-center text-gray-400 text-sm">
                    {search || statusFilter !== 'all'
                      ? 'No leads match your search.'
                      : 'No leads yet — run discovery to populate.'}
                  </div>
                )}
              </div>
              <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100 bg-gray-50">
                Showing {filteredLeads.length} of {leads.length} — click any row to view details.
              </p>
            </div>

            {/* Lead Detail Panel */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit sticky top-6">
              {selectedLead ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{getLeadName(selectedLead)}</h3>
                    <p className="text-sm text-gray-500">{selectedLead.city}, {selectedLead.province}</p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-500">Industry:</span> <span className="text-gray-900 capitalize">{selectedLead.industry?.replace(/_/g, ' ')}</span></div>
                    <div><span className="text-gray-500">Score:</span> <span className="font-bold text-gray-900">{getLeadScore(selectedLead)}/100</span></div>
                    <div><span className="text-gray-500">Website:</span> <span className="text-gray-900">{selectedLead.website_status || 'none'}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="text-gray-900">{selectedLead.phone || '—'}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="text-gray-900 block truncate" title={selectedLead.email || ''}>{selectedLead.email || '—'}</span></div>
                    {selectedLead.email_source_url && <div><span className="text-gray-500">Email source:</span> <a href={selectedLead.email_source_url} target="_blank" rel="noopener noreferrer" title={selectedLead.email_source_url} className="text-indigo-600 hover:underline truncate block">{selectedLead.email_source_url}</a></div>}
                    <div><span className="text-gray-500">Contact safety:</span> <span className="text-gray-900">{selectedLead.contact_safety_status || '—'}</span></div>
                  </div>

                  {selectedLead.services && selectedLead.services.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {selectedLead.services.map((s, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedLead.score_reasoning && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Score reasoning:</p>
                      <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">{selectedLead.score_reasoning}</p>
                    </div>
                  )}

                  {selectedLead.description && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Description:</p>
                      <p className="text-sm text-gray-600">{selectedLead.description}</p>
                    </div>
                  )}

                  {/* Status Actions */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Update status:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => updateLeadStatus(selectedLead.id, 'won')} disabled={updating} className="text-xs bg-green-600 text-white py-1.5 rounded hover:bg-green-700 disabled:opacity-50">✓ Won</button>
                      <button onClick={() => updateLeadStatus(selectedLead.id, 'lost')} disabled={updating} className="text-xs bg-red-600 text-white py-1.5 rounded hover:bg-red-700 disabled:opacity-50">✗ Lost</button>
                      <button onClick={() => updateLeadStatus(selectedLead.id, 'do_not_contact')} disabled={updating} className="text-xs bg-gray-600 text-white py-1.5 rounded hover:bg-gray-700 disabled:opacity-50">Do Not Contact</button>
                      <button onClick={() => updateLeadStatus(selectedLead.id, 'contacted')} disabled={updating} className="text-xs bg-yellow-500 text-white py-1.5 rounded hover:bg-yellow-600 disabled:opacity-50">Mark Contacted</button>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Notes:</p>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add notes about this lead..."
                      className="w-full text-sm border border-gray-300 rounded p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      rows={3}
                    />
                    <div className="mt-1 flex items-center gap-2">
                      <button
                        onClick={() => saveNote(selectedLead.id)}
                        disabled={updating || !noteText.trim()}
                        className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savedNoteId === selectedLead.id ? '✓ Saved' : 'Save Note'}
                      </button>
                      {noteText.trim() && noteText !== (selectedLead.notes || '') && (
                        <span className="text-xs text-amber-600">Unsaved changes</span>
                      )}
                    </div>
                  </div>

                  {/* Source URLs */}
                  {selectedLead.source_urls && selectedLead.source_urls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Sources:</p>
                      {selectedLead.source_urls.map((url, i) => (
                        <a key={i} href={url} target="_blank" className="text-xs text-indigo-600 hover:underline block truncate">{url}</a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">Select a lead to view details</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Prototypes Tab */}
        {activeTab === 'prototypes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prototypes.map((proto) => {
              const lead = leads.find(l => l.id === proto.lead_id);
              const slug = lead?.slug || '';
              return (
                <div key={proto.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Screenshot */}
                  <div className="bg-gray-100 h-48 flex items-center justify-center overflow-hidden">
                    {proto.screenshot_url ? (
                      <img src={proto.screenshot_url} alt={proto.title} className="w-full h-full object-cover object-top" />
                    ) : (
                      <span className="text-gray-400 text-sm">No screenshot</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{proto.title || 'Untitled'}</h3>
                      <p className="text-xs text-gray-500">{lead ? getLeadName(lead) : 'Unknown business'}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {proto.generation_model && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{proto.generation_model.split('/').pop()}</span>}
                      {proto.watermark_enabled && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Watermarked</span>}
                      {proto.demo_locked && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">Demo Locked</span>}
                      {proto.generation_status && <span className={`px-2 py-0.5 rounded ${proto.generation_status === 'complete' || proto.generation_status === 'generated' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{proto.generation_status}</span>}
                    </div>

                    {proto.design_summary && <p className="text-xs text-gray-600">{proto.design_summary}</p>}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <a href={`/preview/${slug}`} target="_blank" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 flex-1 text-center">
                        Open Preview
                      </a>
                      {proto.showcase_approved ? (
                        <button onClick={() => toggleShowcase(proto.id, false)} disabled={updating} className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded hover:bg-green-200">
                          ✓ Showcase On
                        </button>
                      ) : (
                        <button onClick={() => toggleShowcase(proto.id, true)} disabled={updating} className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded hover:bg-gray-200">
                          Approve Showcase
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {prototypes.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500 text-sm font-medium">No prototypes yet</p>
                <p className="text-gray-400 text-xs mt-1">Generate a prototype from any lead marked "ready_for_prototype".</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}