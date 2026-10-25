import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, FileText, Image, File, CreditCard, Coins, Eye, Trash2, Minus, Plus, Truck, School } from 'lucide-react';
import { printService, type FileData, type PrintOptions } from '../services/print.service';
import { authService, type User } from '../services/auth.service';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PrintOptionsEditor from './PrintOptionsEditor';
import CostCalculatingLoader from './CostCalculatingLoader';
import { calculateDeliveryDate } from '../lib/deliveryDate';
import { calculatePrintCost, calculateSpecialPagesCost } from '../lib/printCost';
import { useOrdersStore } from '../store/useOrdersStore';
import Header from './Header';

interface FileUploadFormProps {
  user: User;
  onLogout: () => void;
  onProfileUpdate: (phone: string, college: string) => Promise<void>;
  onNavigateHome: () => void;
  onRefreshUser: () => Promise<void>;
  onOpenProfile?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface FileWithOptions {
  file: File;
  printOptions: PrintOptions;
  clientId: string;
}

type ClientFileData = FileData & { clientId: string };

let clientFileCounter = 0;
const generateClientId = () => {
  clientFileCounter += 1;
  return `file-${clientFileCounter}-${Date.now()}`;
};

const FileUploadForm: React.FC<FileUploadFormProps> = ({
  user,
  onRefreshUser,
  onOpenProfile,
}) => {
  // const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');
  const fetchOrdersStore = useOrdersStore((state) => state.fetchOrders);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filesWithOptions, setFilesWithOptions] = useState<FileWithOptions[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<ClientFileData[]>([]);
  // These track file state during cost calculation - kept for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore
  const [filesReadyForSubmission, setFilesReadyForSubmission] = useState<FileWithOptions[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // @ts-ignore
  const [uploadedS3Files, setUploadedS3Files] = useState<ClientFileData[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<any>(null); // { totalAmount, tokensUsed, amountToPay, requestId }
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [useTokens, setUseTokens] = useState(true);
  const [deliveryType, setDeliveryType] = useState<'college_pickup' | 'home_delivery'>('home_delivery');
  
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [specialPages, setSpecialPages] = useState({ certificatePage: 0, indexPage: 0, coverPage: 0 });
  const SPECIAL_PAGE_RATE = 1.5;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const deliveryInfo = calculateDeliveryDate();

  const cancelPendingRequest = useCallback(async (requestId?: string) => {
    if (!requestId) return;
    const token = authService.getToken();
    if (!token) return;
    try {
      await printService.cancelPendingRequest(requestId, token);
    } catch (error) {
      console.warn('Failed to cancel pending request', error);
    }
  }, []);

  useEffect(() => {
    const shouldOpenProfile = searchParams.get('profile');
    if (!shouldOpenProfile) return;

    onOpenProfile?.();

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('profile');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, onOpenProfile]);

  useEffect(() => {
    return () => {
      if (costBreakdown?.requestId) {
        void cancelPendingRequest(costBreakdown.requestId);
      }
    };
  }, [costBreakdown?.requestId, cancelPendingRequest]);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/jpg',
    'image/png'
  ];

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (mimeType === 'application/pdf') return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" is too large. Maximum size is 10MB.`;
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type "${file.type}" is not supported for "${file.name}".`;
    }
    return null;
  };

  const defaultPrintOptions: PrintOptions = {
    printSide: 'single',
    colorMode: 'bw',
    paperSize: 'A4',
    copies: 1,
  };

  const clearOrderPreview = useCallback(() => {
    setUploadedFiles([]);
    setCostBreakdown(null);
    setShowCostModal(false);
    setFilesReadyForSubmission([]);
    setUploadedS3Files(null);
  }, []);

  const buildLocalCost = useCallback((
    filesToCalculate: ClientFileData[],
    overrideUseTokens?: boolean,
    overrideSpecialPages?: { certificatePage: number; indexPage: number; coverPage: number }
  ) => {
    const useTokensValue = typeof overrideUseTokens === 'boolean' ? overrideUseTokens : useTokens;
    const nextSpecialPages = overrideSpecialPages || specialPages;

    const breakdownWithIds = filesToCalculate.map((file) => {
      const printOptions = file.printOptions || { ...defaultPrintOptions };
      const cost = calculatePrintCost(file.pages || 0, printOptions);
      return {
        clientId: file.clientId,
        filename: file.originalName || file.filename,
        pages: file.pages || 0,
        cost,
        printOptions,
      };
    });

    const filesSubtotal = breakdownWithIds.reduce((sum, item) => sum + item.cost, 0);
    const specialPagesCost = calculateSpecialPagesCost(nextSpecialPages, SPECIAL_PAGE_RATE);
    const totalAmount = filesSubtotal + specialPagesCost;

    const tokensAvailable = user.tokens || 0;
    const tokensUsed = useTokensValue ? Math.min(tokensAvailable, Math.floor(totalAmount)) : 0;
    const amountToPay = totalAmount - tokensUsed;

    const updatedFiles = filesToCalculate.map((file) => {
      const match = breakdownWithIds.find((item) => item.clientId === file.clientId);
      if (!match) return file;
      return {
        ...file,
        cost: match.cost,
        printOptions: match.printOptions,
      };
    });

    return {
      updatedFiles,
      costBreakdown: {
        totalAmount,
        tokensUsed,
        amountToPay,
        tokensAvailable,
        breakdown: breakdownWithIds.map(({ clientId, ...rest }) => rest),
        specialPages: nextSpecialPages,
        specialPagesCost,
      },
    };
  }, [SPECIAL_PAGE_RATE, defaultPrintOptions, specialPages, useTokens, user.tokens]);

  const applyLocalCost = useCallback((
    filesToCalculate: ClientFileData[],
    overrideUseTokens?: boolean,
    showModal: boolean = true,
    overrideSpecialPages?: { certificatePage: number; indexPage: number; coverPage: number }
  ) => {
    if (costBreakdown?.requestId) {
      void cancelPendingRequest(costBreakdown.requestId);
    }

    const { updatedFiles, costBreakdown: nextBreakdown } = buildLocalCost(
      filesToCalculate,
      overrideUseTokens,
      overrideSpecialPages
    );

    setUploadedFiles(updatedFiles);
    setCostBreakdown(nextBreakdown);
    if (showModal) {
      setShowCostModal(true);
    }
  }, [buildLocalCost, cancelPendingRequest, costBreakdown?.requestId]);

  const refreshOrders = useCallback(async () => {
    try {
      const token = authService.getToken();
      if (!token) {
        return;
      }
      await fetchOrdersStore(token, { force: true });
    } catch (error) {
      console.error('Failed to refresh orders', error);
    }
  }, [fetchOrdersStore]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFilesWithOptions: FileWithOptions[] = [];
    const errors: string[] = [];

    for (const file of Array.from(selectedFiles)) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        newFilesWithOptions.push({
          file,
          printOptions: { ...defaultPrintOptions },
          clientId: generateClientId(),
        });
      }
    }

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
    }

    if (newFilesWithOptions.length > 0) {
      clearOrderPreview();
      setFilesWithOptions(prev => [...prev, ...newFilesWithOptions]);
      toast.success(`Added ${newFilesWithOptions.length} file(s) successfully`);
    }
  }, [clearOrderPreview]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeFile = (index: number) => {
    setFilesWithOptions(prev => prev.filter((_, i) => i !== index));
    if (costBreakdown?.requestId) {
      void cancelPendingRequest(costBreakdown.requestId);
    }
    clearOrderPreview();
    toast.success('File removed');
  };

  const removeUploadedFile = (index: number) => {
    const targetFile = uploadedFiles[index];

    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    if (newFiles.length > 0) {
      applyLocalCost(newFiles, undefined, showCostModal);
    } else {
      setUploadedFiles([]);
      setShowCostModal(false);
      setCostBreakdown(null);
    }

    if (targetFile) {
      setFilesWithOptions(prev => prev.filter((file) => file.clientId !== targetFile.clientId));
      setFilesReadyForSubmission(prev => prev.filter((file) => file.clientId !== targetFile.clientId));
      setUploadedS3Files(prev => (prev ? prev.filter((file) => file.clientId !== targetFile.clientId) : null));
    }

    toast.success('File removed from order');
  };

  const updateFilePrintOptions = (index: number, newOptions: PrintOptions) => {
    setFilesWithOptions(prev => {
      const updated = [...prev];
      const target = updated[index];
      if (target) {
        updated[index] = { ...target, printOptions: newOptions };
      }
      return updated;
    });
    if (uploadedFiles.length > 0) {
      const targetFile = filesWithOptions[index];
      const updatedUploaded = uploadedFiles.map((file) =>
        file.clientId === targetFile?.clientId
          ? { ...file, printOptions: newOptions }
          : { ...file, printOptions: file.printOptions || { ...defaultPrintOptions } }
      );
      applyLocalCost(updatedUploaded, undefined, showCostModal);
      return;
    }

    clearOrderPreview();
  };

  const updateFileCopies = (index: number, delta: number) => {
    setFilesWithOptions((prev) => {
      const updated = [...prev];
      const target = updated[index];
      if (target) {
        const nextCopies = Math.max(1, (target.printOptions.copies || 1) + delta);
        updated[index] = {
          ...target,
          printOptions: { ...target.printOptions, copies: nextCopies },
        };
      }
      return updated;
    });
    if (uploadedFiles.length > 0) {
      const targetFile = filesWithOptions[index];
      const updatedUploaded = uploadedFiles.map((file) => {
        const safeOptions = file.printOptions || { ...defaultPrintOptions };
        if (file.clientId === targetFile?.clientId) {
          return {
            ...file,
            printOptions: {
              ...safeOptions,
              copies: Math.max(1, (safeOptions.copies || 1) + delta),
            },
          };
        }
        return { ...file, printOptions: safeOptions };
      });
      applyLocalCost(updatedUploaded, undefined, showCostModal);
      return;
    }

    clearOrderPreview();
  };

  const uploadFiles = async () => {
    if (filesWithOptions.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    if (costBreakdown?.requestId) {
      await cancelPendingRequest(costBreakdown.requestId);
    }

    setUploading(true);
    
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Authentication token not found');
        setUploading(false);
        return;
      }

      // Send files to backend for cost calculation (temporary, no S3 upload)
      const filesToUpload = filesWithOptions.map(f => f.file);
      const printOptions = filesWithOptions.map(f => f.printOptions);
      
      const response = await printService.calculateCostFromFiles(
        filesToUpload,
        printOptions,
        useTokens,
        token,
        specialPages,
        deliveryType
      );
      
      // Store file data from cost calculation (includes pages count)
      const uploadedFilesWithOptions: ClientFileData[] = response.files.map((file: FileData, index: number) => {
        const source = filesWithOptions[index];
        return {
          ...file,
          printOptions: source?.printOptions || { ...defaultPrintOptions },
          clientId: source?.clientId || generateClientId(),
        };
      });
      setUploadedFiles(uploadedFilesWithOptions);
      setFilesReadyForSubmission(
        filesWithOptions.map((entry) => ({
          file: entry.file,
          printOptions: { ...entry.printOptions },
          clientId: entry.clientId,
        }))
      );
      setUploadedS3Files(null);
      
      // Set cost breakdown and show modal
      setCostBreakdown({ ...response, deliveryType });
      setShowCostModal(true);
      
    } catch (error) {
      console.error('Cost calculation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to calculate cost');
    } finally {
      setUploading(false);
    }
  };

  const calculateCostFromBackend = async (
    filesToCalculate: FileData[],
    overrideUseTokens?: boolean,
    overrideSpecialPages?: { certificatePage: number; indexPage: number; coverPage: number }
  ) => {
    const token = authService.getToken();
    if (!token) return null;

    const useTokensValue = typeof overrideUseTokens === 'boolean' ? overrideUseTokens : useTokens;
    const response = await printService.calculateCost(
      filesToCalculate,
      useTokensValue,
      token,
      overrideSpecialPages || specialPages
    );
    return response;
  };

  const finalizeOrderWithoutGateway = async () => {
    setVerifyingPayment(true);
    try {
      // For free orders, the DB record is already created in createOrder
      if ((costBreakdown?.deliveryType === 'college_pickup' || deliveryType === 'college_pickup') && costBreakdown?.collectionPin) {
        toast.success(`In-College order placed! Your pickup number is #${costBreakdown.collectionPin}`, { duration: 6000 });
      } else {
        toast.success('Print request submitted successfully!');
      }
      await refreshOrders();
      await onRefreshUser();
      resetForm();
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit print request');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const createOrder = async () => {
    // Check if it's a special pages only purchase or regular file upload
    const isSpecialPagesOnly = costBreakdown?.isSpecialPagesOnly || (uploadedFiles.length === 0 && (specialPages.certificatePage > 0 || specialPages.indexPage > 0 || specialPages.coverPage > 0));
    
    if (uploadedFiles.length === 0 && !isSpecialPagesOnly) {
      toast.error('Please upload files first');
      return;
    }

    if (!user.phone || user.phone.trim().length < 10) {
      onOpenProfile?.();
      toast.error('Please add your phone number before proceeding.');
      return;
    }

    setShowCostModal(false);
    setCreatingOrder(true);

    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      let requestId = costBreakdown?.requestId;

      if (!requestId) {
        const backendResponse = await calculateCostFromBackend(
          isSpecialPagesOnly ? [] : uploadedFiles,
          useTokens,
          specialPages
        );
        if (!backendResponse?.requestId) {
          toast.error('Failed to calculate cost for order. Please try again.');
          return;
        }

        setCostBreakdown(backendResponse);
        requestId = backendResponse.requestId;
      }

      const orderData = await printService.createOrder(requestId, token, costBreakdown?.deliveryType || deliveryType);

      if (orderData.amountToPay <= 0 || orderData.orderId === 'no-payment') {
        // For free orders (or if payments disabled on backend), printRequestId is returned directly
        await finalizeOrderWithoutGateway();
        return;
      }

      const razorpayKey = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
         toast.error('Payment configuration error: Missing Razorpay Key ID');
         setCreatingOrder(false);
         return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amountToPay * 100,
        currency: 'INR',
        name: 'PrintIt',
        description: 'Print Service Payment',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          await verifyPayment(response, orderData.requestId);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: '#000000',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create order');
    } finally {
      setCreatingOrder(false);
    }
  };

  const verifyPayment = async (razorpayResponse: any, requestId: string) => {
    setVerifyingPayment(true);
    try {
      const token = authService.getToken();
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const paymentData = {
        razorpay_order_id: razorpayResponse.razorpay_order_id,
        razorpay_payment_id: razorpayResponse.razorpay_payment_id,
        razorpay_signature: razorpayResponse.razorpay_signature,
        requestId,
        deliveryType: costBreakdown?.deliveryType || deliveryType,
      };

      await printService.verifyPayment(paymentData, token);
      if ((paymentData as any).deliveryType === 'college_pickup') {
        toast.success('Payment verified! Check your orders for your same-day pickup number.', { duration: 6000 });
      } else {
        toast.success('Payment verified successfully! Print request submitted.');
      }
      await refreshOrders();
      await onRefreshUser();
      resetForm();
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment verification failed');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const resetForm = () => {
    setFilesWithOptions([]);
    if (costBreakdown?.requestId) {
      void cancelPendingRequest(costBreakdown.requestId);
    }
    clearOrderPreview();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTokenToggle = () => {
    const nextValue = !useTokens;
    setUseTokens(nextValue);
    if (uploadedFiles.length > 0) {
      // Recalculate cost but don't show modal - only update cost breakdown
      applyLocalCost(uploadedFiles, nextValue, false);
    }
  };

  const handleCancelModal = async () => {
    if (costBreakdown?.requestId) {
      await cancelPendingRequest(costBreakdown.requestId);
    }
    setShowCostModal(false);
    setCostBreakdown(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-[#80ED99] selection:text-black">
      {/* User Profile Modal */}
      {/* Profile modal is centralized in App; open via onOpenProfile */}

      {/* Replaced Custom Header with Header */}
      <Header
        onPrimaryAction={() => {}}
        onUserAction={() => onOpenProfile?.()}
        isShopOpen={true} // Dashboard user is already authenticated
      />

      <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          
          {/* Dashboard Title & Welcome with Tokens */}
          <div className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="text-center lg:text-left mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back, {user.name.split(' ')[0]}</h1>
              <p className="text-gray-500">Manage your prints and orders from here.</p>
            </div>
            
            {/* Tokens Card - Desktop: inline, Mobile: below */}
            <div className="lg:flex-shrink-0 lg:ml-8">
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between max-w-sm mx-auto lg:mx-0 gap-5">
                <div>
                   <p className="text-sm font-medium text-gray-500 mb-1">Available Tokens</p>
                   <p className="text-3xl font-bold text-gray-900">{user.tokens ? user.tokens : 0}</p>
                </div>
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
                   <Coins className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">Upload Files</h2>
            </div>

            {/* Delivery Type Selector */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">How would you like to receive your prints?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Home Delivery */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('home_delivery')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryType === 'home_delivery'
                      ? 'border-[#80ED99] bg-green-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${deliveryType === 'home_delivery' ? 'bg-[#80ED99]' : 'bg-gray-100'}`}>
                    <Truck className="w-5 h-5 text-gray-800" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Next-Day Delivery</p>
                    <p className="text-xs text-gray-500">{deliveryInfo.text}</p>
                  </div>
                  {deliveryType === 'home_delivery' && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-[#80ED99] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-gray-800" />
                    </div>
                  )}
                </button>

                {/* In-College Pickup */}
                <button
                  type="button"
                  onClick={() => setDeliveryType('college_pickup')}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    deliveryType === 'college_pickup'
                      ? 'border-orange-400 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${deliveryType === 'college_pickup' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <School className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Print from College</p>
                    <p className="text-xs text-gray-500 mt-0.5">Same-Day Campus Pickup</p>
                    <p className="text-xs font-medium text-orange-600">⚡ High Priority — Ready Today</p>
                  </div>
                  {deliveryType === 'college_pickup' && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-8 text-center hover:border-[#80ED99] transition-colors cursor-pointer bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 mb-2 font-medium">Drag & drop files here or click to browse</p>
              <p className="text-sm text-gray-500">
                Supported: PDF, PPT/PPTX, and Images (JPG, PNG) up to 10MB each
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.ppt,.pptx"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Selected Files */}
            {filesWithOptions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-black mb-4">Selected Files & Print Options</h3>
                <div className="space-y-6">
                  {filesWithOptions.map((fileWithOpts, index) => (
                    <div key={fileWithOpts.clientId} className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(fileWithOpts.file.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-black font-medium truncate">{fileWithOpts.file.name}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                              <span>{(fileWithOpts.file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:self-start">
                          <div className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded-lg px-2 py-1">
                            <button
                              type="button"
                              onClick={() => updateFileCopies(index, -1)}
                              className="p-1 text-gray-600 hover:text-black"
                              aria-label="Decrease copies"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-sm font-semibold text-black min-w-[2ch] text-center">
                              {fileWithOpts.printOptions.copies}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateFileCopies(index, 1)}
                              className="p-1 text-gray-600 hover:text-black"
                              aria-label="Increase copies"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          {(fileWithOpts.file.type.startsWith('image/') || fileWithOpts.file.type === 'application/pdf') && (
                            <button
                              onClick={() => setPreviewFile(fileWithOpts.file)}
                              className="p-2 text-[#80ED99] hover:text-[#6DD687] hover:bg-gray-100 rounded-lg transition-colors"
                              title="Preview file"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                          )}
                          <button
                            onClick={() => removeFile(index)}
                            className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Print Options for this file */}
                      <PrintOptionsEditor
                        options={fileWithOpts.printOptions}
                        onChange={(newOptions) => updateFilePrintOptions(index, newOptions)}
                      />
                    </div>
                  ))}
                </div>

                {/* Use Tokens Toggle */}
                <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-black">Use Tokens</h3>
                      <p className="text-sm text-gray-600">
                        You have {user.tokens} tokens available (1 token = ₹1)
                      </p>
                    </div>
                    <button
                      onClick={handleTokenToggle}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                        useTokens ? 'bg-[#80ED99]' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          useTokens ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={uploadFiles}
                    disabled={uploading}
                    className="flex-1 bg-[#80ED99] text-black py-3 px-6 rounded-lg hover:bg-[#6DD687] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold border border-[#6DD687]"
                  >
                    {uploading ? 'Calculating Cost...' : 'Review & Pay'}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors border border-gray-300"
                  >
                    Clear All
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Special Pages Purchase Section */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-8 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black">Buy Special Pages</h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-black mb-1">Printing your assignment?</h3>
                <p className="text-sm text-gray-700">Add extra pages at ₹1.5 each</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Certificate Page */}
                <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Certificate Page</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialPages(prev => ({
                          ...prev,
                          certificatePage: Math.max(0, prev.certificatePage - 1)
                        }));
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={specialPages.certificatePage}
                      onChange={(e) => setSpecialPages(prev => ({
                        ...prev,
                        certificatePage: Math.max(0, parseInt(e.target.value) || 0)
                      }))}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-center text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialPages(prev => ({
                          ...prev,
                          certificatePage: prev.certificatePage + 1
                        }));
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Index Page */}
                <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Index Page</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialPages(prev => ({
                          ...prev,
                          indexPage: Math.max(0, prev.indexPage - 1)
                        }));
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={specialPages.indexPage}
                      onChange={(e) => setSpecialPages(prev => ({
                        ...prev,
                        indexPage: Math.max(0, parseInt(e.target.value) || 0)
                      }))}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-center text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialPages(prev => ({
                          ...prev,
                          indexPage: prev.indexPage + 1
                        }));
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cover Page */}
                <div className="bg-white p-4 rounded-lg border border-blue-300 shadow-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Cover Page</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialPages(prev => ({
                          ...prev,
                          coverPage: Math.max(0, prev.coverPage - 1)
                        }));
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Decrease"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={specialPages.coverPage}
                      onChange={(e) => setSpecialPages(prev => ({
                        ...prev,
                        coverPage: Math.max(0, parseInt(e.target.value) || 0)
                      }))}
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-center text-black focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSpecialPages(prev => ({
                          ...prev,
                          coverPage: prev.coverPage + 1
                        }));
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                      title="Increase"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              {(specialPages.certificatePage > 0 || specialPages.indexPage > 0 || specialPages.coverPage > 0) && (
                <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                  <p className="text-sm text-gray-700 font-medium">
                    Special Pages Cost: ₹{((specialPages.certificatePage + specialPages.indexPage + specialPages.coverPage) * SPECIAL_PAGE_RATE).toFixed(2)}
                  </p>
                </div>
              )}
            </div>

            {(specialPages.certificatePage > 0 || specialPages.indexPage > 0 || specialPages.coverPage > 0) && (
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    setShowCostModal(true);
                    const cost = (specialPages.certificatePage + specialPages.indexPage + specialPages.coverPage) * SPECIAL_PAGE_RATE;
                    setCostBreakdown({
                      totalAmount: cost,
                      tokensUsed: useTokens ? Math.min(cost, user.tokens) : 0,
                      amountToPay: Math.max(0, cost - (useTokens ? Math.min(cost, user.tokens) : 0)),
                      requestId: null,
                      isSpecialPagesOnly: true,
                      specialPages,
                      breakdown: []
                    });
                  }}
                  disabled={uploading}
                  className="flex-1 bg-[#80ED99] text-black py-3 px-6 rounded-lg hover:bg-[#6DD687] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold border border-[#6DD687]"
                >
                  {uploading ? 'Processing...' : 'Purchase Now'}
                </button>
                <button
                  onClick={() => setSpecialPages({ certificatePage: 0, indexPage: 0, coverPage: 0 })}
                  className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors border border-gray-300"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Calculating Cost Loader Modal */}
          {uploading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 border-2 border-[#80ED99] shadow-2xl">
                <CostCalculatingLoader />
              </div>
            </div>
          )}

          {/* Cost Confirmation Modal */}
          {showCostModal && costBreakdown && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200 shadow-xl">
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-black mb-4">Confirm Your Order</h2>

                  {/* Delivery Type Badge */}
                  <div className={`mb-5 flex items-center gap-3 p-3 rounded-xl border-2 ${
                    (costBreakdown?.deliveryType || deliveryType) === 'college_pickup'
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-[#80ED99] bg-green-50'
                  }`}>
                    {(costBreakdown?.deliveryType || deliveryType) === 'college_pickup' ? (
                      <>
                        <School className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-orange-800 text-sm">Print from College — Same-Day Pickup</p>
                          <p className="text-xs text-orange-600">⚡ High priority. You'll receive a pickup number after payment.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5 text-green-700 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-green-800 text-sm">Next-Day Delivery</p>
                          <p className="text-xs text-green-700">{deliveryInfo.text}</p>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* File Breakdown */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-black mb-3">Files & Cost Breakdown</h3>
                    <div className="space-y-2">
                      {costBreakdown.breakdown.map((item: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex-1">
                            <p className="text-black font-medium">{item.filename}</p>
                            <p className="text-sm text-gray-600">{item.pages} page{item.pages !== 1 ? 's' : ''}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-black font-semibold">₹{item.cost}</p>
                            <button
                              onClick={() => removeUploadedFile(index)}
                              className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                    <div className="space-y-2">
                      <div className="flex justify-between text-gray-700">
                        <span>Files Subtotal:</span>
                        <span>₹{(costBreakdown.totalAmount - (costBreakdown.specialPagesCost || 0)).toFixed(2)}</span>
                      </div>
                      {(costBreakdown.specialPages?.certificatePage > 0 || costBreakdown.specialPages?.indexPage > 0 || costBreakdown.specialPages?.coverPage > 0) && (
                        <>
                          <div className="text-sm text-gray-600 bg-blue-50 rounded p-2">
                            <p className="font-medium mb-1">Special Pages:</p>
                            {costBreakdown.specialPages?.certificatePage > 0 && <p className="text-xs">• Certificate: {costBreakdown.specialPages.certificatePage} × ₹{SPECIAL_PAGE_RATE}</p>}
                            {costBreakdown.specialPages?.indexPage > 0 && <p className="text-xs">• Index: {costBreakdown.specialPages.indexPage} × ₹{SPECIAL_PAGE_RATE}</p>}
                            {costBreakdown.specialPages?.coverPage > 0 && <p className="text-xs">• Cover: {costBreakdown.specialPages.coverPage} × ₹{SPECIAL_PAGE_RATE}</p>}
                            <p className="text-xs font-semibold mt-1">Total: ₹{costBreakdown.specialPagesCost?.toFixed(2)}</p>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-gray-700 border-t border-gray-300 pt-2">
                        <span>Total Cost:</span>
                        <span>₹{costBreakdown.totalAmount.toFixed(2)}</span>
                      </div>
                      {useTokens && costBreakdown.tokensUsed > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Tokens Applied ({costBreakdown.tokensUsed}):</span>
                          <span>-₹{costBreakdown.tokensUsed}</span>
                        </div>
                      )}
                      <div className="border-t border-gray-300 pt-2 flex justify-between text-black font-bold text-lg">
                        <span>Total to Pay:</span>
                        <span>₹{costBreakdown.amountToPay.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tokens Info */}
                  {useTokens && costBreakdown.tokensUsed > 0 && (
                    <div className="bg-green-50 border border-[#80ED99] rounded-lg p-4 mb-6">
                      <div className="flex items-center gap-2 text-green-700 mb-1">
                        <Coins className="w-5 h-5" />
                        <span className="font-semibold">Tokens Applied Successfully!</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {costBreakdown.tokensUsed} tokens will be deducted from your balance
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      onClick={createOrder}
                      disabled={creatingOrder || verifyingPayment}
                      className="flex-1 bg-[#80ED99] text-black py-3 px-6 rounded-lg hover:bg-[#6DD687] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 border border-[#6DD687]"
                    >
                      <CreditCard className="w-5 h-5" />
                      {creatingOrder ? 'Processing...' : verifyingPayment ? 'Verifying Payment...' : costBreakdown.amountToPay > 0 ? 'Pay Now' : 'Submit Free Order'}
                    </button>
                    <button
                      onClick={handleCancelModal}
                      disabled={creatingOrder || verifyingPayment}
                      className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 border border-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Uploaded Files & Payment Section */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-sm">
              <h2 className="text-xl font-semibold text-black mb-6">Review & Pay</h2>

              {/* Uploaded Files List */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-black mb-4">Uploaded Files</h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div key={file.clientId} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file.mimeType)}
                        <div>
                          <p className="text-black font-medium">{file.originalName}</p>
                          <p className="text-sm text-gray-600">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                            {typeof file.cost === 'number' && (
                              <span className="ml-2 text-black font-semibold">₹{file.cost}</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-200 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <h3 className="text-lg font-semibold text-black truncate">{previewFile.name}</h3>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] bg-gray-50">
              {previewFile.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(previewFile)} 
                  alt={previewFile.name}
                  className="max-w-full h-auto mx-auto rounded-lg shadow-lg"
                  onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                />
              ) : previewFile.type === 'application/pdf' ? (
                <iframe
                  src={URL.createObjectURL(previewFile)}
                  className="w-full h-[calc(90vh-120px)] rounded-lg shadow-lg"
                  title={previewFile.name}
                />
              ) : (
                <div className="text-center py-12">
                  <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Preview not available for this file type</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadForm;