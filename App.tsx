import { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import MetadataRow from './components/MetadataRow';
import CalendarLinks from './components/CalendarLinks';
import { extractMetadata, reanalyzeSingleField, fileToBase64 } from './services/geminiService';
import { PosterMetadata, MetadataKey } from './types';

const DISPLAY_KEYS: MetadataKey[] = [
  'competitionName',
  'category',
  'registrationDeadline',
  'eventDate',
  'cost',
  'teamType',
  'status',
  'location',
  'link',
  'broadcastMessage'
];

function App() {
  // Removed imageFile state as it was unused
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  const [metadata, setMetadata] = useState<PosterMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [refreshingField, setRefreshingField] = useState<MetadataKey | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError(null);
    setMetadata(null);
    setLoading(true);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    try {
      // Convert to base64
      const base64 = await fileToBase64(file);
      setImageBase64(base64);

      // Call AI Service
      const result = await extractMetadata(base64);
      setMetadata(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateField = (key: MetadataKey, value: string) => {
    if (!metadata) return;
    setMetadata({ ...metadata, [key]: value });
  };

  const handleRefreshField = async (key: MetadataKey) => {
    if (!imageBase64 || !metadata) return;
    
    setRefreshingField(key);
    try {
      const newValue = await reanalyzeSingleField(imageBase64, key, metadata);
      handleUpdateField(key, newValue);
    } catch (err) {
      console.error("Gagal refresh field", err);
      alert("Gagal memperbarui data. Silakan coba lagi.");
    } finally {
      setRefreshingField(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Header />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Intro Section */}
        {!imagePreview && (
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Ekstrak Info Poster dalam Detik
            </h2>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
              Upload poster lomba, biarkan AI menyalin detail pentingnya untuk Anda.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Image */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Poster</h3>
              <FileUpload onFileSelect={handleFileSelect} isLoading={loading} />
              
              {imagePreview && (
                <div className="mt-6 relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                  <img 
                    src={imagePreview} 
                    alt="Poster Preview" 
                    className="w-full h-auto object-contain max-h-[600px]" 
                  />
                  {loading && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
                      <p className="text-primary-700 font-medium animate-pulse">Sedang menganalisis...</p>
                    </div>
                  )}
                </div>
              )}

              {error && (
                 <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                   <p className="font-bold">Error</p>
                   <p>{error}</p>
                 </div>
              )}
            </div>
          </div>

          {/* Right Column: Metadata Results */}
          <div className="lg:col-span-7">
            {metadata ? (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-gray-900">Hasil Ekstraksi</h3>
                  <button 
                    onClick={() => setImagePreview(null)} // Simple reset logic
                    className="text-sm text-gray-500 hover:text-primary-600 underline"
                  >
                    Reset / Upload Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {DISPLAY_KEYS.map((key) => (
                    <MetadataRow
                      key={key}
                      fieldKey={key}
                      value={metadata[key]}
                      onUpdate={handleUpdateField}
                      onRefresh={handleRefreshField}
                      isRefreshing={refreshingField === key}
                    />
                  ))}
                </div>

                <CalendarLinks metadata={metadata} />
              </div>
            ) : (
              !loading && imagePreview && (
                <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl min-h-[400px]">
                  <p>Data akan muncul di sini setelah analisis selesai.</p>
                </div>
              )
            )}
             {/* Empty State placeholder if nothing happens */}
             {!imagePreview && (
                <div className="hidden lg:flex h-full items-center justify-center p-10 bg-white border border-gray-100 rounded-xl shadow-sm">
                   <div className="text-center text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">Menunggu file poster...</p>
                   </div>
                </div>
             )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} SOS Semesta. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;