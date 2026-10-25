import React from 'react';
import { type PrintOptions } from '../services/print.service';

interface PrintOptionsEditorProps {
  options: PrintOptions;
  onChange: (options: PrintOptions) => void;
}

const PrintOptionsEditor: React.FC<PrintOptionsEditorProps> = ({ options, onChange }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
      <h3 className="text-black font-medium mb-3">Print Options</h3>

      {/* Print Side */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Print Side
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...options, printSide: 'single' })}
            className={`flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              options.printSide === 'single'
                ? 'bg-[#80ED99] text-black border-[#6DD687]'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}
          >
            Single Side
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...options, printSide: 'double' })}
            disabled={options.colorMode === 'color'}
            className={`flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              options.printSide === 'double'
                ? 'bg-[#80ED99] text-black border-[#6DD687]'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}
            title={options.colorMode === 'color' ? 'Double-side not available for color printing' : 'Double Side'}
          >
            Double Side
          </button>
        </div>
      </div>

      {/* Color Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Color Mode
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange({ ...options, colorMode: 'bw' })}
            className={`flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              options.colorMode === 'bw'
                ? 'bg-[#80ED99] text-black border-[#6DD687]'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}
          >
            Black & White
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...options, colorMode: 'color', printSide: 'single' })}
            className={`flex-1 min-w-[120px] px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
              options.colorMode === 'color'
                ? 'bg-[#80ED99] text-black border-[#6DD687]'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
            }`}
          >
            Color
          </button>
        </div>
      </div>

      {/* Paper Size */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Paper Size
        </label>
        <select
          value={options.paperSize}
          onChange={(e) => onChange({ ...options, paperSize: e.target.value as PrintOptions['paperSize'] })}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-[#80ED99] focus:ring-2 focus:ring-[#80ED99]/20"
        >
          <option value="A4">A4</option>
          <option value="A3">A3</option>
          <option value="Letter">Letter</option>
        </select>
      </div>

      {/* Copies */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Copies
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={options.copies}
          onChange={(e) => onChange({ ...options, copies: parseInt(e.target.value) || 1 })}
          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:border-[#80ED99] focus:ring-2 focus:ring-[#80ED99]/20"
        />
      </div>
    </div>
  );
};

export default PrintOptionsEditor;
