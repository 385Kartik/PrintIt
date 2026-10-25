import React, { useState, useEffect } from 'react';
import { X, Download, Printer, Loader2 } from 'lucide-react';
import { adminService } from '../services/api.service';
import toast from 'react-hot-toast';

interface FilePreviewModalProps {
  file: {
    s3Key: string;
    filename: string;
    mimeType?: string;
  };
  onClose: () => void;
  onSendToPrint?: () => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ file, onClose, onSendToPrint }) => {
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        const response = await adminService.getFilePreview(file.s3Key);
        setPreviewUrl(response.previewUrl);
      } catch (err: any) {
        console.error('Error fetching preview:', err);
        setError(err.message || 'Failed to load preview');
        toast.error('Failed to load file preview');
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [file.s3Key]);

  const handleDownload = async () => {
    try {
      await adminService.downloadFile(file.s3Key, file.filename);
      toast.success('Download started');
    } catch (err) {
      toast.error('Failed to download file');
    }
  };

  const handlePrint = () => {
    if (previewUrl) {
      const printWindow = window.open(previewUrl, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
    if (onSendToPrint) {
      onSendToPrint();
    }
  };

  const renderPreview = () => {
    if (loading) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-500">
          <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
          <span className="text-sm">Loading preview...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex h-full items-center justify-center">
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-center">
            <p className="font-medium text-red-700">Failed to load preview</p>
            <p className="mt-1 text-sm text-red-500">{error}</p>
          </div>
        </div>
      );
    }

    const isPDF = file.mimeType === 'application/pdf';
    const isImage = file.mimeType?.startsWith('image/') || false;

    if (isPDF) {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full border-0"
          title="PDF Preview"
        />
      );
    }

    if (isImage) {
      return (
        <div className="flex h-full items-center justify-center bg-neutral-100">
          <img
            src={previewUrl}
            alt={file.filename}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-neutral-500 mb-4 text-sm">Preview not available for this file type</p>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-neutral-900 text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Download File
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-100 px-5 py-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-neutral-900 truncate">{file.filename}</h2>
            <p className="text-xs text-neutral-500">{file.mimeType}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:justify-end">
            <button
              onClick={handleDownload}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
              title="Download"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={handlePrint}
              className="rounded-lg bg-neutral-900 p-2 text-white hover:bg-neutral-800 transition-colors"
              title="Print"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg border border-neutral-200 p-2 text-neutral-600 hover:bg-neutral-50 transition-colors"
              title="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden bg-neutral-50">
          {renderPreview()}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 bg-white px-5 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="text-neutral-400">
              Use Ctrl+P (or Cmd+P) in the preview window to print
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800 transition-colors"
              >
                Send to Printer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;
