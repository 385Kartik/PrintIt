import React, { useMemo } from 'react';
import { Download, CheckCircle, Calendar, FileText, User, Phone, Mail, Eye, Clock, Printer, School, Truck } from 'lucide-react';
import type { PrintRequest } from '../services/api.service';
import { format } from 'date-fns';

interface PrintRequestCardProps {
  request: PrintRequest;
  onDownloadFile: (s3Key: string, filename: string) => void;
  onDownloadAll: (requestId: string) => void;
  onDownloadZip: (requestId: string) => void;
  onMarkDelivered: (requestId: string) => void;
  onUpdateStatus?: (requestId: string, status: 'pending' | 'printed') => void;
  onPreviewFile?: (file: { s3Key: string; filename: string; mimeType?: string }) => void;
  onPrint?: (requestId: string) => void;
  isSelected?: boolean;
  onToggleSelect?: (requestId: string) => void;
  loading: boolean;
}

const INTERNAL_COST_RATES = {
  bw: { single: 2, double: 3.5 },
  color: { single: 8, double: 16 },
  special: 1,
};

const computeInternalFileCost = (file: PrintRequest['files'][number]): number => {
  const pages = file.pages || file.pageCount || 0;
  const options = file.printOptions || {
    printSide: 'single',
    colorMode: 'bw',
    paperSize: 'A4',
    copies: 1,
  };

  const singleRate = options.colorMode === 'bw' ? INTERNAL_COST_RATES.bw.single : INTERNAL_COST_RATES.color.single;
  const doubleRate = options.colorMode === 'bw' ? INTERNAL_COST_RATES.bw.double : INTERNAL_COST_RATES.color.double;

  let baseCost = 0;
  if (options.printSide === 'double') {
    const fullSheets = Math.floor(pages / 2);
    const leftover = pages % 2;
    baseCost = (fullSheets * doubleRate + leftover * singleRate) * options.copies;
  } else {
    baseCost = pages * singleRate * options.copies;
  }

  const totalSpecialPages =
    ((file as any).specialPages ?? 0) +
    ((file as any).certificatePages ?? 0) +
    ((file as any).indexPages ?? 0) +
    ((file as any).coverPages ?? 0);

  const specialCost = totalSpecialPages * INTERNAL_COST_RATES.special;

  return baseCost + specialCost;
};

const getRequestSpecialPages = (request: PrintRequest) => {
  const specialPages = (request as any).special_pages || (request as any).specialPages || {};
  return {
    certificatePage: Number(specialPages.certificatePage || 0),
    indexPage: Number(specialPages.indexPage || 0),
    coverPage: Number(specialPages.coverPage || 0),
  };
};

const computeInternalTotalCost = (request: PrintRequest): number => {
  const filesCost = (request.files || []).reduce((sum, file) => sum + computeInternalFileCost(file), 0);
  const specialPages = getRequestSpecialPages(request);
  const specialPagesTotal =
    specialPages.certificatePage + specialPages.indexPage + specialPages.coverPage;
  const specialCost = specialPagesTotal * INTERNAL_COST_RATES.special;
  return filesCost + specialCost;
};

const PrintRequestCard: React.FC<PrintRequestCardProps> = ({
  request,
  onDownloadFile,
  onDownloadAll,
  onDownloadZip,
  onMarkDelivered,
  onPreviewFile,
  onUpdateStatus,
  onPrint,
  isSelected = false,
  onToggleSelect,
  loading,
}) => {
  const internalCost = useMemo(() => computeInternalTotalCost(request), [request]);
  const specialPages = useMemo(() => getRequestSpecialPages(request), [request]);
  const totalSpecialPages =
    specialPages.certificatePage + specialPages.indexPage + specialPages.coverPage;

  const isDeadlineSoon = () => {
    const deadline = new Date(request.deadline);
    const now = new Date();
    const hoursDiff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24 && hoursDiff > 0;
  };

  const collectionPin = request.collection_pin || (request as any).collectionPin;
  const currentStatus = request.status === 'delivered' ? 'delivered' : request.status || 'pending';
  const isCollegePickup = request.delivery_type === 'college_pickup';

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = event.target.value as 'pending' | 'printed' | 'delivered' | 'collected';
    if (nextStatus === 'delivered' || nextStatus === 'collected') {
      onMarkDelivered(request._id);
      return;
    }
    if (onUpdateStatus) {
      onUpdateStatus(request._id, nextStatus as 'pending' | 'printed');
    }
  };

  const getStatusIcon = () => {
    switch (currentStatus) {
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'printed':   return <Printer className="h-4 w-4" />;
      default:          return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusStyles = () => {
    switch (currentStatus) {
      case 'delivered':
      case 'collected':
        return isCollegePickup
          ? 'border-orange-300 bg-orange-50 text-orange-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700';
      case 'printed':
        return 'border-blue-200 bg-blue-50 text-blue-700';
      default:
        return 'border-amber-200 bg-amber-50 text-amber-700';
    }
  };

  return (
    <div className={`relative rounded-xl border bg-white p-5 transition-all hover:shadow-md ${
      isSelected ? 'border-blue-400 ring-2 ring-blue-100 shadow-sm' : 'border-neutral-200'
    }`}>

      {/* ── Checkbox (top-left corner) ── */}
      {onToggleSelect && (
        <button
          onClick={() => onToggleSelect(request._id)}
          className="absolute left-4 top-4 z-10"
          title={isSelected ? 'Deselect' : 'Select for printing'}
        >
          <div className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-neutral-300 hover:border-blue-400'
          }`}>
            {isSelected && (
              <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>
      )}

      {/* Header — push content right when checkbox is shown */}
      <div className={`mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${onToggleSelect ? 'pl-8' : ''}`}>
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <div className="rounded-full bg-neutral-100 p-1.5">
              <User className="h-4 w-4 text-neutral-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">{request.user.name}</h3>
          </div>
          <div className="flex flex-col gap-1 pl-8 text-sm text-neutral-500">
            <div className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-neutral-400" />
              <span>{request.user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 text-neutral-400" />
              <span>{request.user.phone}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyles()}`}>
            {getStatusIcon()}
            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </div>
          <select
            value={currentStatus}
            onChange={handleStatusChange}
            disabled={loading}
            className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-700 focus:border-neutral-400 focus:outline-none disabled:opacity-50"
          >
            <option value="pending">Pending</option>
            <option value="printed">{isCollegePickup ? 'Printed (Ready)' : 'Printed'}</option>
            {isCollegePickup ? (
              <option value="collected">Collected ✓</option>
            ) : (
              <option value="delivered">Delivered</option>
            )}
          </select>
        </div>
      </div>

      {/* Delivery Type Badge */}
      <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
        isCollegePickup
          ? 'border-orange-200 bg-orange-50 text-orange-700'
          : 'border-neutral-100 bg-neutral-50 text-neutral-600'
      }`}>
        {isCollegePickup
          ? <><School className="h-3.5 w-3.5" /> Same Day Delivery — Campus Pickup</>
          : <><Truck className="h-3.5 w-3.5" /> Standard Delivery</>
        }
      </div>

      {/* PIN */}
      {collectionPin && (
        isCollegePickup ? (
          <div className="mb-4 flex items-center justify-between rounded-xl border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-500">Student Pickup Number</p>
            <span className="text-4xl font-black font-mono text-orange-600">#{collectionPin}</span>
          </div>
        ) : (
          <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
            Collection PIN: <span className="tracking-widest">{collectionPin}</span>
          </div>
        )
      )}

      {/* Deadline */}
      <div className={`mb-4 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium ${
        isDeadlineSoon() ? 'border-red-200 bg-red-50 text-red-600' : 'border-neutral-100 bg-neutral-50 text-neutral-600'
      }`}>
        <Calendar className={`h-3.5 w-3.5 ${isDeadlineSoon() ? 'text-red-500' : 'text-neutral-400'}`} />
        <span>Deadline: {request.deadline ? format(new Date(request.deadline), 'PPP p') : 'N/A'}</span>
      </div>

      {/* Print Details Summary */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
        <div>
          <p className="text-xs text-neutral-500">Total</p>
          <p className="text-sm font-semibold text-neutral-900">₹{request.total_amount || request.amount || 0}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Paid</p>
          <p className="text-sm font-semibold text-neutral-900">₹{request.amount_paid || 0}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Tokens</p>
          <p className="text-sm font-semibold text-neutral-900">{request.tokens_used || 0}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-500">Our Cost</p>
          <p className="text-sm font-semibold text-neutral-900">₹{internalCost.toFixed(2)}</p>
        </div>
      </div>

      {/* Special Pages */}
      {totalSpecialPages > 0 && (
        <div className="mb-4 rounded-lg border border-neutral-100 bg-white px-3 py-2 text-xs">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Special Pages</p>
          <div className="flex flex-wrap gap-2 text-neutral-700">
            {specialPages.certificatePage > 0 && (
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1">
                Certificate: {specialPages.certificatePage}
              </span>
            )}
            {specialPages.indexPage > 0 && (
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1">
                Index: {specialPages.indexPage}
              </span>
            )}
            {specialPages.coverPage > 0 && (
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1">
                Cover: {specialPages.coverPage}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Files */}
      <div className="mb-4">
        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-neutral-500">
          <FileText className="h-3.5 w-3.5" />
          Files ({request.files.length})
        </h4>
        <div className="space-y-2">
          {request.files.map((file, index) => (
            <div key={file._id || index} className="rounded-lg border border-neutral-100 bg-white p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-900">{file.originalName || file.filename}</p>
                  <p className="text-xs text-neutral-400">{file.pages || file.pageCount || 0} pages</p>
                </div>
                <div className="flex items-center gap-1">
                  {onPreviewFile && (
                    <button
                      onClick={() => onPreviewFile({ s3Key: file.s3Key, filename: file.filename, mimeType: file.mimeType })}
                      className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Preview"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDownloadFile(file.s3Key, file.filename)}
                    className="rounded-md p-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {file.printOptions && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-neutral-100 pt-2 text-xs">
                  <div>
                    <p className="text-neutral-400">Side</p>
                    <p className="font-medium text-neutral-700 capitalize">{file.printOptions.printSide}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Color</p>
                    <p className="font-medium text-neutral-700">{file.printOptions.colorMode === 'bw' ? 'B&W' : 'Color'}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Size</p>
                    <p className="font-medium text-neutral-700">{file.printOptions.paperSize}</p>
                  </div>
                  <div>
                    <p className="text-neutral-400">Copies</p>
                    <p className="font-medium text-neutral-700">{file.printOptions.copies}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onDownloadAll(request._id)}
          disabled={loading}
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          Download All
        </button>
        <button
          onClick={() => onDownloadZip(request._id)}
          disabled={loading}
          className="flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
        >
          <Download className="h-3.5 w-3.5" />
          ZIP
        </button>

        {/* ── Print this order button ── */}
        {onPrint && request.status !== 'delivered' && request.status !== 'collected' && (
          <button
            onClick={() => onPrint(request._id)}
            disabled={loading}
            className="flex-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" />
            Print
          </button>
        )}

        {request.status !== 'delivered' && request.status !== 'collected' && (
          <button
            onClick={() => onMarkDelivered(request._id)}
            disabled={loading}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 ${
              isCollegePickup ? 'bg-orange-500 hover:bg-orange-600' : 'bg-neutral-900 hover:bg-neutral-800'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {isCollegePickup ? 'Mark Collected' : 'Deliver'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PrintRequestCard;