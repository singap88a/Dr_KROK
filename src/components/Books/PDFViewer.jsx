import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiChevronLeft, FiChevronRight, FiPlus, FiMinus, FiRotateCw, FiX } from 'react-icons/fi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ url, onClose, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(window.innerWidth < 768 ? 1.0 : 0.5);
  const [rotation, setRotation] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Subtract padding (p-4 = 32px total)
        setContainerWidth(entries[0].contentRect.width - 32);
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  };

  const zoomIn = () => setScale(prevScale => Math.min(prevScale + 0.1, 3.0));
  const zoomOut = () => setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  const rotate = () => setRotation(prevRotation => (prevRotation + 90) % 360);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 text-white bg-gray-900 shadow-xl gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={onClose}
            className="p-2 transition-colors rounded-full hover:bg-white/10 shrink-0"
          >
            <FiX size={24} />
          </button>
          <div className="overflow-hidden">
            <h3 className="font-semibold truncate max-w-[150px] sm:max-w-[250px] md:max-w-md">{fileName}</h3>
            <p className="text-xs text-gray-400">
              Page {pageNumber} of {numPages || '...'}
            </p>
          </div>
        </div>

        {/* Controls Container */}
        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 w-full md:w-auto">
          {/* Zoom Controls */}
          <div className="flex items-center bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <button
              onClick={zoomOut}
              className="p-2 hover:bg-white/10 text-gray-300"
              title="Zoom Out"
            >
              <FiMinus size={18} />
            </button>
            <span className="px-2 text-[12px] md:text-sm font-medium border-x border-gray-700 min-w-[50px] md:min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-2 hover:bg-white/10 text-gray-300"
              title="Zoom In"
            >
              <FiPlus size={18} />
            </button>
          </div>

          <button
            onClick={rotate}
            className="p-2 hover:bg-white/10 text-gray-300 rounded-lg hidden sm:flex"
            title="Rotate"
          >
            <FiRotateCw size={18} />
          </button>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => changePage(-1)}
              disabled={pageNumber <= 1}
              className="p-2 bg-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center"
            >
              <FiChevronLeft size={20} />
            </button>
            <button
              onClick={() => changePage(1)}
              disabled={pageNumber >= numPages}
              className="p-2 bg-primary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center"
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto p-4 flex justify-center items-start bg-gray-800/50 scrollbar-hide"
      >
        <div className="h-fit rounded-lg shadow-2xl bg-white relative">
          <Document
            file={url}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="p-10 text-white flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p>Loading PDF...</p>
              </div>
            }
            error={
              <div className="p-10 text-white flex flex-col items-center gap-4">
                <p className="text-red-400">Failed to load PDF</p>
                <button onClick={onClose} className="px-4 py-2 bg-primary rounded-lg">Close</button>
              </div>
            }
          >
            <Page 
              pageNumber={pageNumber} 
              scale={scale} 
              rotate={rotation}
              width={containerWidth > 0 ? containerWidth : undefined}
              className="max-w-full"
              renderAnnotationLayer={true}
              renderTextLayer={true}
            />
          </Document>
        </div>
      </div>

      {/* Footer / Info */}
      <div className="p-2 text-center text-[10px] text-gray-500 bg-gray-900 border-t border-gray-800 uppercase tracking-widest shrink-0">
        Secure View Mode • No Download
      </div>
    </div>
  );
};

export default PDFViewer;
