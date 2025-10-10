import React from 'react';
import { GeneratedLessonPlan } from '../types';
import PrintLayout from './PrintLayout';

interface PrintPreviewProps {
  plan: GeneratedLessonPlan;
  onClose: () => void;
}

const PrintPreview: React.FC<PrintPreviewProps> = ({ plan, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-200 min-h-screen">
      <header className="bg-white p-3 shadow-md sticky top-0 z-10 no-print">
        <div className="container mx-auto flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">인쇄 미리보기</h2>
            <div className="flex items-center gap-3">
                <button
                onClick={handlePrint}
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 hover:bg-indigo-700 flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2v-6a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    인쇄하기
                </button>
                <button
                onClick={onClose}
                className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 border border-slate-300 hover:bg-slate-100"
                >
                닫기
                </button>
            </div>
        </div>
      </header>

      <main className="py-8">
        <div 
          className="printable-area mx-auto bg-white shadow-xl" 
          style={{ width: '210mm', minHeight: '297mm' }}
        >
           <PrintLayout plan={plan} />
        </div>
      </main>
    </div>
  );
};

export default PrintPreview;
