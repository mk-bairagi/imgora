'use client';

import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';

interface ConvertedFile {
  name: string;
  url: string;
  originalSize: number;
  convertedSize: number;
  status: 'converting' | 'done' | 'error';
  error?: string;
}

export default function Home() {
  const [files, setFiles] = useState<ConvertedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [quality, setQuality] = useState(80);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addMoreRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((rawFiles: File[]) => {
    const heicFiles = rawFiles.filter(f =>
      f.name.toLowerCase().endsWith('.heic') ||
      f.name.toLowerCase().endsWith('.heif') ||
      f.type === 'image/heic' ||
      f.type === 'image/heif'
    );

    if (heicFiles.length === 0) {
      alert('Please upload HEIC or HEIF files only.');
      return;
    }

    heicFiles.forEach((file) => {
      const newEntry: ConvertedFile = {
        name: file.name.replace(/\.(heic|heif)$/i, '.jpg'),
        url: '',
        originalSize: file.size,
        convertedSize: 0,
        status: 'converting',
      };

      setFiles(prev => [...prev, newEntry]);

      const worker = new Worker('/heic-worker.js');
      worker.postMessage({ file, index: 0, quality });

      worker.onmessage = (e) => {
        const { buffer, error } = e.data;
        if (error) {
          setFiles(prev => prev.map(f =>
            f === newEntry ? { ...f, status: 'error', error } : f
          ));
        } else {
          const blob = new Blob([buffer], { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setFiles(prev => prev.map(f =>
            f === newEntry
              ? { ...f, status: 'done', url, convertedSize: blob.size }
              : f
          ));
        }
        worker.terminate();
      };

      worker.onerror = (err) => {
        setFiles(prev => prev.map(f =>
          f === newEntry ? { ...f, status: 'error', error: err.message } : f
        ));
        worker.terminate();
      };
    });
  }, [quality]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const downloadAll = async () => {
    setIsDownloadingZip(true);
    const zip = new JSZip();
    const doneFiles = files.filter(f => f.status === 'done');
    for (const f of doneFiles) {
      const res = await fetch(f.url);
      const blob = await res.blob();
      zip.file(f.name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted-images.zip';
    a.click();
    URL.revokeObjectURL(url);
    setIsDownloadingZip(false);
  };

  const clearAll = () => {
    files.forEach(f => { if (f.url) URL.revokeObjectURL(f.url); });
    setFiles([]);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '—';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const doneCount = files.filter(f => f.status === 'done').length;
  const convertingCount = files.filter(f => f.status === 'converting').length;

  return (
    <main className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #e8f0fe 50%, #f0f7ff 100%)' }}>
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            HEIC to JPG Converter
          </h1>
          <p className="text-gray-500">
            Convert iPhone photos instantly — free, private, no upload required
          </p>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {['🔒 100% Private', '⚡ Instant', '📱 Works on iPhone', '🆓 Always Free'].map(badge => (
            <span key={badge} className="text-xs bg-white text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full shadow-sm">
              {badge}
            </span>
          ))}
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-4">

          {/* Quality slider */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Output quality</span>
              <span className="text-sm font-semibold text-blue-600">{quality}%</span>
            </div>
            <input
              type="range"
              min={40}
              max={100}
              step={1}
              value={quality}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>40% — Smallest size</span>
              {quality === 100
                ? <span className="text-blue-600 font-semibold animate-pulse">✨ Enhanced quality</span>
                : <span>100% — Enhanced ✨</span>
              }
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mx-6 my-5 border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
              ${isDragging
                ? 'border-blue-500 bg-blue-50 scale-[1.01]'
                : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
              }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".heic,.heif"
              multiple
              className="hidden"
              onChange={e => { if (e.target.files) processFiles(Array.from(e.target.files)); }}
            />
            <div className="text-5xl mb-3">📷</div>
            <p className="text-gray-800 font-semibold mb-1">
              {isDragging ? 'Drop your HEIC files here' : 'Drop HEIC files here'}
            </p>
            <p className="text-gray-400 text-sm mb-3">or click to browse your files</p>
            <span className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              Up to 20 files at once
            </span>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="border-t border-gray-100">
              <div className="flex items-center justify-between px-6 py-3 bg-gray-50">
                <span className="text-sm font-medium text-gray-700">
                  {convertingCount > 0
                    ? `Converting ${convertingCount} file${convertingCount > 1 ? 's' : ''}...`
                    : `${doneCount} of ${files.length} converted`
                  }
                </span>
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Clear all
                </button>
              </div>

              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-t border-gray-50">
                  <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                    <p className="text-xs mt-0.5">
                      <span className="text-gray-400">{formatSize(f.originalSize)}</span>
                      {f.status === 'done' && f.convertedSize < f.originalSize && (
                        <span className="text-green-600 ml-1">
                          → {formatSize(f.convertedSize)} · {Math.round((1 - f.convertedSize / f.originalSize) * 100)}% smaller
                        </span>
                      )}
                      {f.status === 'done' && f.convertedSize >= f.originalSize && (
                        <span className="text-amber-500 ml-1">
                          → {formatSize(f.convertedSize)} · lower quality to reduce size
                        </span>
                      )}
                      {f.status === 'error' && (
                        <span className="text-red-400 ml-1">{f.error}</span>
                      )}
                    </p>
                  </div>

                  {f.status === 'converting' && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs text-blue-500">Converting</span>
                    </div>
                  )}
                  {f.status === 'done' && (
                    <a
                      href={f.url}
                      download={f.name}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                    >
                      Download
                    </a>
                  )}
                  {f.status === 'error' && (
                    <span className="text-xs text-red-400 whitespace-nowrap">Failed</span>
                  )}
                </div>
              ))}

              {/* Add more */}
              <div className="px-6 py-3 border-t border-gray-100">
                <input
                  ref={addMoreRef}
                  type="file"
                  accept=".heic,.heif"
                  multiple
                  className="hidden"
                  onChange={e => { if (e.target.files) processFiles(Array.from(e.target.files)); }}
                />
                <button
                  onClick={() => addMoreRef.current?.click()}
                  className="w-full text-sm text-gray-500 hover:text-blue-600 py-1.5 transition-colors"
                >
                  + Add more files
                </button>
              </div>
            </div>
          )}

        </div>{/* End main card */}

        {/* Download ZIP */}
        {doneCount > 1 && (
          <button
            onClick={downloadAll}
            disabled={isDownloadingZip}
            className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm mb-4"
          >
            {isDownloadingZip ? '⏳ Preparing ZIP...' : `⬇️ Download all ${doneCount} files as ZIP`}
          </button>
        )}

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">How it works</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: '📂', title: 'Upload', desc: 'Drop your HEIC files from iPhone or Mac' },
              { icon: '⚡', title: 'Convert', desc: 'Instantly converted inside your browser' },
              { icon: '💾', title: 'Download', desc: 'Save as JPG, works everywhere' },
            ].map(step => (
              <div key={step.title} className="text-center">
                <div className="text-2xl mb-2">{step.icon}</div>
                <p className="text-xs font-semibold text-gray-700 mb-1">{step.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy note */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-xs text-green-700">
            🔒 <strong>Your privacy is guaranteed.</strong> All conversion happens inside your browser.
            Your photos are never uploaded to any server. We cannot see your files.
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Free forever · No signup · No watermark · Works offline
        </p>

      </div>
    </main>
  );
}