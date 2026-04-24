import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const InlinePDFViewer = ({ url, fileName }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Subtract some padding for better fit
        setContainerWidth(entries[0].contentRect.width - 2);
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

  return (
    <div 
      className="w-full border rounded-lg bg-surface dark:bg-surface-dark border-border dark:border-border-dark"
    >
      {/* PDF Document */}
      <div 
        ref={containerRef}
        className="overflow-y-auto overflow-x-hidden scrollbar-hide" 
        style={{ height: '450px' }}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center h-full gap-4 p-10 text-text dark:text-text-dark">
              <div className="w-12 h-12 border-b-2 rounded-full animate-spin border-primary"></div>
              <p>Loading PDF...</p>
            </div>
          }
          error={
            <div className="flex flex-col items-center justify-center h-full gap-4 p-10 text-text dark:text-text-dark">
              <p className="text-red-400">Failed to load PDF</p>
            </div>
          }
          className="flex justify-center"
        >
          <Page 
            pageNumber={pageNumber}
            width={containerWidth > 20 ? containerWidth - 20 : undefined}
            renderAnnotationLayer={true}
            renderTextLayer={true}
            className="max-w-full"
          />
        </Document>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-4 border-t bg-background dark:bg-background-dark border-border dark:border-border-dark">
        <button
          onClick={() => changePage(-1)}
          disabled={pageNumber <= 1}
          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all rounded-lg bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90"
        >
          <FiChevronLeft size={20} />
          <span className="hidden sm:inline">Previous</span>
        </button>
        
        <div className="text-sm font-medium text-text dark:text-text-dark">
          Page {pageNumber} of {numPages || '...'}
        </div>
        
        <button
          onClick={() => changePage(1)}
          disabled={pageNumber >= numPages}
          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-all rounded-lg bg-primary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight size={20} />
        </button>
      </div>
      
      {/* File Info */}
      {fileName && (
        <div className="px-4 py-2 text-xs text-center border-t text-text-muted dark:text-text-muted-dark border-border dark:border-border-dark">
          {fileName}
        </div>
      )}
    </div>
  );
};

export default InlinePDFViewer;
