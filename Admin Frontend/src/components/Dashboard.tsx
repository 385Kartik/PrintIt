import React, { useEffect, useState } from 'react';
import { LogOut, RefreshCw, Package, Clock, Printer, CheckCircle2, Search, School } from 'lucide-react';
import { adminService, authService, type PrintRequest } from '../services/api.service';
import PrintRequestCard from './PrintRequestCard';
import FilePreviewModal from './FilePreviewModal';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [requests, setRequests] = useState<PrintRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PrintRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'delivered' | 'printed' | 'college_pickup'>('all');
  const [previewFile, setPreviewFile] = useState<{ s3Key: string; filename: string; mimeType?: string } | null>(null);
  const [pinQuery, setPinQuery] = useState('');
  const [pinSearchActive, setPinSearchActive] = useState(false);
  const [pinSearchLoading, setPinSearchLoading] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());

  const allVisibleIds = filteredRequests.map((r) => r._id);
  const allSelected = allVisibleIds.length > 0 && allVisibleIds.every((id) => selectedOrders.has(id));
  const someSelected = allVisibleIds.some((id) => selectedOrders.has(id));

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllPrintRequests();
      setRequests(data);
      applyFilter(data, filter);
      setPinSearchActive(false);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error(error?.response?.data?.message || 'Failed to fetch print requests');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (data: PrintRequest[], filterType: 'all' | 'pending' | 'delivered' | 'printed' | 'college_pickup') => {
    if (filterType === 'all') { setFilteredRequests(data); return; }
    if (filterType === 'college_pickup') {
      setFilteredRequests(data.filter((req) => req.delivery_type === 'college_pickup'));
      return;
    }
    setFilteredRequests(
      data.filter((req) => filterType === 'pending' ? req.status === 'pending' : req.status === filterType)
    );
  };

  useEffect(() => { fetchRequests(); }, []);

  useEffect(() => {
    applyFilter(requests, filter);
    setSelectedOrders(new Set());
  }, [filter, requests]);

  // ── selection ──────────────────────────────────────────────────────────────
  const handleToggleSelect = (id: string) => {
    setSelectedOrders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (allSelected) {
      setSelectedOrders((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedOrders((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  // ── core: open a file blob in a new window and trigger print dialog ────────
  const printFileBlob = async (s3Key: string, _filename: string): Promise<void> => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('adminToken');

    const response = await axios.get(
      `${API_URL}/admin/download/${encodeURIComponent(s3Key)}`,
      { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
    );

    const blobUrl = URL.createObjectURL(response.data);
    const pw = window.open(blobUrl, '_blank');
    if (!pw) {
      URL.revokeObjectURL(blobUrl);
      throw new Error('popup_blocked');
    }
    // Give the tab time to load, then trigger print
    pw.onload = () => {
      pw.focus();
      pw.print();
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    };
  };

  // ── single order print ─────────────────────────────────────────────────────
  const handlePrintSingle = async (requestId: string) => {
    const req = requests.find((r) => r._id === requestId);
    if (!req) return;

    if (req.files.length === 0) {
      toast.error('No files in this order');
      return;
    }

    try {
      setActionLoading(true);

      for (const file of req.files) {
        await printFileBlob(file.s3Key, file.filename);
        // Small delay between opening tabs so browser doesn't block them
        if (req.files.length > 1) await new Promise((r) => setTimeout(r, 600));
      }

      await adminService.updatePrintStatus(requestId, 'printed');
      await fetchRequests();
      toast.success('Files sent to printer');
    } catch (err: any) {
      if (err.message === 'popup_blocked') {
        toast.error('Popup blocked! Please allow popups for this site.');
      } else {
        toast.error('Failed to open files for printing');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ── bulk print ─────────────────────────────────────────────────────────────
  const handlePrintSelected = async () => {
    if (selectedOrders.size === 0) return;
    const reqs = requests.filter((r) => selectedOrders.has(r._id));

    try {
      setActionLoading(true);

      for (const req of reqs) {
        for (const file of req.files) {
          await printFileBlob(file.s3Key, file.filename);
          if (req.files.length > 1) await new Promise((r) => setTimeout(r, 600));
        }
      }

      await Promise.all(reqs.map((r) => adminService.updatePrintStatus(r._id, 'printed')));
      setSelectedOrders(new Set());
      await fetchRequests();
      toast.success(`${reqs.length} order(s) sent to printer`);
    } catch (err: any) {
      if (err.message === 'popup_blocked') {
        toast.error('Popup blocked! Please allow popups for this site.');
      } else {
        toast.error('Failed to open some files for printing');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // ── pin search ─────────────────────────────────────────────────────────────
  const handlePinSearch = () => {
    const sanitized = pinQuery.trim();
    if (!/^[0-9]{3,6}$/.test(sanitized)) { toast.error('Enter a valid PIN (3–6 digits)'); return; }
    setPinSearchLoading(true);
    try {
      const filtered = requests.filter((req) => {
        const pins = [
          req.collection_pin,
          (req as any).collectionPin,
          (req as any).collection_otp,
          (req as any).security_pin,
        ].filter(Boolean) as string[];
        return pins.some((p) => p === sanitized);
      });
      if (filtered.length === 0) toast.error('PIN not found');
      setFilteredRequests(filtered);
      setPinSearchActive(true);
    } finally {
      setPinSearchLoading(false);
    }
  };

  const clearPinSearch = async () => { setPinQuery(''); await fetchRequests(); };

  // ── download ───────────────────────────────────────────────────────────────
  const handleDownloadFile = async (s3Key: string, filename: string) => {
    try {
      setActionLoading(true);
      await adminService.downloadFile(s3Key, filename);
    } catch {
      toast.error('Failed to download file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadAll = async (requestId: string) => {
    try {
      setActionLoading(true);
      const request = requests.find((r) => r._id === requestId);
      if (!request) return;
      for (const file of request.files) {
        await adminService.downloadFile(file.s3Key, file.filename);
        await new Promise((res) => setTimeout(res, 500));
      }
    } catch {
      toast.error('Failed to download all files');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadZip = async (requestId: string) => {
    try {
      setActionLoading(true);
      const request = requests.find((r) => r._id === requestId);
      if (!request) return;
      const zip = new JSZip();
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken');
      for (const file of request.files) {
        const response = await axios.get(
          `${API_URL}/admin/download/${encodeURIComponent(file.s3Key)}`,
          { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
        );
        zip.file(file.filename, response.data);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `PrintRequest_${request.user.name}_${requestId}.zip`);
    } catch {
      toast.error('Failed to create ZIP file');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDelivered = async (requestId: string) => {
    toast('Marking as delivered will delete all files from server', { icon: '⚠️', duration: 3000 });
    try {
      setActionLoading(true);
      await adminService.markAsDelivered(requestId);
      await fetchRequests();
      toast.success('Request marked as delivered and files deleted from server');
    } catch {
      toast.error('Failed to mark as delivered');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'pending' | 'printed') => {
    try {
      setActionLoading(true);
      await adminService.updatePrintStatus(requestId, status);
      await fetchRequests();
      toast.success(`Status updated to ${status}`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => { authService.logout(); onLogout(); };

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'pending').length,
    printed: requests.filter((r) => r.status === 'printed').length,
    delivered: requests.filter((r) => r.status === 'delivered').length,
    collegePickup: requests.filter((r) => r.delivery_type === 'college_pickup').length,
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white text-neutral-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-neutral-100 bg-neutral-50 flex flex-col justify-between">
        <div>
          <div className="p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Operations Console</p>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 mt-1">PrintIt Admin</h1>
          </div>
          <nav className="px-4 flex flex-col gap-1.5">
            <p className="px-2 text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2 mt-4">Filters & Views</p>
            {[
              { value: 'all', label: 'All Orders', count: stats.total, icon: <Package className="h-4 w-4" />, color: 'text-neutral-700' },
              { value: 'pending', label: 'Pending', count: stats.pending, icon: <Clock className="h-4 w-4" />, color: 'text-amber-600' },
              { value: 'printed', label: 'Printed', count: stats.printed, icon: <Printer className="h-4 w-4" />, color: 'text-blue-600' },
              { value: 'delivered', label: 'Delivered', count: stats.delivered, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-600' },
              { value: 'college_pickup', label: 'In-College', count: stats.collegePickup, icon: <School className="h-4 w-4" />, color: 'text-orange-600' },
            ].map(({ value, label, count, icon, color }) => {
              const isActive = filter === value;
              return (
                <button
                  key={value}
                  onClick={() => setFilter(value as typeof filter)}
                  className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white shadow-sm border border-neutral-200 text-neutral-900'
                      : 'text-neutral-600 hover:bg-neutral-100/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? color : 'text-neutral-400 group-hover:text-neutral-600'}>{icon}</span>
                    {label}
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    isActive ? 'bg-neutral-100 text-neutral-900 font-semibold' : 'bg-neutral-200/50 text-neutral-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-neutral-100">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-200/50 hover:text-neutral-900 transition-colors"
          >
            <LogOut className="h-4 w-4 text-neutral-400" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#FAFAFA]">
        {/* Header */}
        <header className="flex-shrink-0 h-16 border-b border-neutral-100 bg-white px-6 flex items-center justify-between">
          <div className="flex-1 max-w-md relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-neutral-400" />
            <input
              value={pinQuery}
              onChange={(e) => setPinQuery(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Search by PIN (3-6 digits)..."
              className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-24 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none focus:ring-0 transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handlePinSearch()}
            />
            <div className="absolute right-1.5 flex items-center gap-1">
              {pinSearchActive && (
                <button onClick={clearPinSearch} className="px-2 py-1 text-xs font-medium text-neutral-500 hover:text-neutral-800 transition-colors">
                  Clear
                </button>
              )}
              <button
                onClick={handlePinSearch}
                disabled={pinSearchLoading || !pinQuery}
                className="rounded-md bg-neutral-900 px-3 py-1 text-xs font-medium text-white hover:bg-neutral-800 disabled:opacity-30 transition-colors"
              >
                {pinSearchLoading ? '...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {someSelected && (
              <button
                onClick={handlePrintSelected}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm"
              >
                <Printer className="h-4 w-4" />
                {actionLoading ? 'Opening...' : `Print Selected (${selectedOrders.size})`}
              </button>
            )}
            <button
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <div className="max-w-6xl mx-auto">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 capitalize">
                  {filter === 'all' ? 'All Requests' : filter.replace('_', ' ')}
                </h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Showing {filteredRequests.length} result{filteredRequests.length !== 1 && 's'}
                  {someSelected && (
                    <span className="ml-2 text-blue-600 font-medium">· {selectedOrders.size} selected</span>
                  )}
                </p>
              </div>

              {filteredRequests.length > 0 && (
                <button
                  onClick={handleToggleSelectAll}
                  className="flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
                    allSelected
                      ? 'bg-blue-600 border-blue-600'
                      : someSelected
                      ? 'bg-blue-100 border-blue-400'
                      : 'bg-white border-neutral-300 hover:border-neutral-400'
                  }`}>
                    {allSelected && (
                      <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {someSelected && !allSelected && <div className="h-2 w-2 rounded-sm bg-blue-500" />}
                  </div>
                  Select All
                </button>
              )}
            </div>

            {filter === 'college_pickup' && (
              <div className="mb-6 flex items-center gap-3 rounded-lg border border-orange-100 bg-orange-50/50 p-4">
                <div className="rounded-full bg-orange-100 p-2">
                  <School className="h-4 w-4 text-orange-600 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-medium text-orange-900">In-College Same-Day Pickup Orders</p>
                  <p className="text-xs text-orange-700 mt-0.5">High priority. Students use their daily PIN to collect.</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white/50 py-20 text-center">
                <RefreshCw className="mb-3 h-5 w-5 animate-spin text-neutral-400" />
                <p className="text-sm text-neutral-500 font-medium">Syncing data...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-200 bg-white/50 py-20 text-center">
                <Package className="mb-3 h-8 w-8 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-900">No requests found</p>
                <p className="text-sm text-neutral-500 mt-1">Try changing your filters or searching another PIN</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredRequests.map((request) => (
                  <PrintRequestCard
                    key={request._id}
                    request={request}
                    onDownloadFile={handleDownloadFile}
                    onDownloadAll={handleDownloadAll}
                    onDownloadZip={handleDownloadZip}
                    onMarkDelivered={handleMarkDelivered}
                    onUpdateStatus={handleUpdateStatus}
                    onPreviewFile={(file) => setPreviewFile({ ...file })}
                    onPrint={handlePrintSingle}
                    isSelected={selectedOrders.has(request._id)}
                    onToggleSelect={handleToggleSelect}
                    loading={actionLoading}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
          onSendToPrint={() => {
            toast.success('Sent to printer');
            setPreviewFile(null);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;