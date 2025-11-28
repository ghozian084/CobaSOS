import React, { useState } from 'react';
import { MetadataKey, LABELS } from '../types';

interface MetadataRowProps {
  fieldKey: MetadataKey;
  value: string;
  onUpdate: (key: MetadataKey, value: string) => void;
  onRefresh: (key: MetadataKey) => void;
  isRefreshing: boolean;
}

const MetadataRow: React.FC<MetadataRowProps> = ({ fieldKey, value, onUpdate, onRefresh, isRefreshing }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMultiline = fieldKey === 'broadcastMessage';

  return (
    <div className={`group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${isMultiline ? 'row-span-2' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <label className="block text-sm font-medium text-gray-500 uppercase tracking-wider">
          {LABELS[fieldKey]}
        </label>
        <div className="flex space-x-2">
          {/* Refresh Button */}
          <button
            onClick={() => onRefresh(fieldKey)}
            disabled={isRefreshing}
            className={`p-1.5 text-gray-400 hover:text-primary-600 rounded-md hover:bg-primary-50 transition-colors ${isRefreshing ? 'animate-spin text-primary-600' : ''}`}
            title="Analisis ulang bagian ini"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="p-1.5 text-gray-400 hover:text-green-600 rounded-md hover:bg-green-50 transition-colors flex items-center"
            title="Salin teks"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMultiline ? (
        <textarea
          value={value}
          onChange={(e) => onUpdate(fieldKey, e.target.value)}
          rows={6}
          className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md p-3 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors resize-y leading-relaxed min-h-[160px] font-sans whitespace-pre-wrap"
          placeholder="Pesan broadcast akan muncul di sini... (Klik tombol refresh jika kosong)"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onUpdate(fieldKey, e.target.value)}
          className="w-full text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-md p-2 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-colors"
        />
      )}
    </div>
  );
};

export default MetadataRow;