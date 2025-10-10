import React from 'react';
import { GeneratedLessonPlan } from '../types';

interface SavedPlansPanelProps {
  plans: GeneratedLessonPlan[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SavedPlansPanel: React.FC<SavedPlansPanelProps> = ({ plans, onSelect, onDelete }) => {
  
  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onSelect from firing when deleting
    onDelete(id);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
      <h2 className="text-xl font-bold text-slate-800 mb-4">저장된 지도안</h2>
      {plans.length > 0 ? (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {plans.map((plan) => (
            plan.id && (
              <div
                key={plan.id}
                onClick={() => onSelect(plan.id!)}
                className="group flex justify-between items-center p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-indigo-100 transition-colors duration-200"
              >
                <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-800 truncate">{plan.lessonTitle}</p>
                <button
                  onClick={(e) => handleDeleteClick(e, plan.id!)}
                  className="ml-2 text-slate-400 hover:text-red-500 focus:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={`'${plan.lessonTitle}' 지도안 삭제`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )
          ))}
        </div>
      ) : (
        <p className="text-slate-500 text-sm">저장된 지도안이 없습니다. 지도안을 생성하고 저장해 보세요!</p>
      )}
    </div>
  );
};

export default SavedPlansPanel;