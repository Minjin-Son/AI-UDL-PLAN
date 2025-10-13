import React from 'react';
import { GeneratedLessonPlan } from '../types';
import UDLDisplay from './UDLDisplay';
import TableDisplay from './TableDisplay';
import WorksheetDisplay from './WorksheetDisplay';
import UdlEvaluationDisplay from './UdlEvaluationDisplay';
import ProcessEvaluationDisplay from './ProcessEvaluationDisplay';

const PrintSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="page-break-before pt-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300 print-section-header">
            {title}
        </h2>
        {children}
    </div>
);

const PrintLayout: React.FC<{ plan: GeneratedLessonPlan }> = ({ plan }) => {
  // This dummy function is needed because the display components expect it, even in read-only mode.
  const dummyOnPlanChange = () => {};

  return (
    <div className="bg-white p-8 printable-content">
        <div className="text-center mb-8 page-break-avoid">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{plan.lessonTitle}</h1>
            <div className="flex justify-center space-x-4 text-sm text-slate-500 mt-2">
                <span><strong>학년:</strong> {plan.gradeLevel}</span>
                <span><strong>과목:</strong> {plan.subject}</span>
            </div>
        </div>
      
        <div className="pt-4">
             <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-300 print-section-header">
                UDL 지도안
             </h2>
             <UDLDisplay plan={plan} isEditing={false} onPlanChange={dummyOnPlanChange as any} />
        </div>

        {plan.tablePlan && (
            <PrintSection title="표 형식 지도안">
                <TableDisplay plan={plan.tablePlan} isEditing={false} onPlanChange={dummyOnPlanChange as any} />
            </PrintSection>
        )}

        {plan.worksheet && (
            <PrintSection title="수준별 활동지">
                <WorksheetDisplay plan={plan.worksheet} isEditing={false} onPlanChange={dummyOnPlanChange as any} />
            </PrintSection>
        )}

        {plan.udlEvaluation && (
            <PrintSection title="UDL 평가 계획">
                <UdlEvaluationDisplay plan={plan.udlEvaluation} isEditing={false} onPlanChange={dummyOnPlanChange as any} />
            </PrintSection>
        )}

        {plan.processEvaluationWorksheet && (
            <PrintSection title="과정중심평가지">
                <ProcessEvaluationDisplay plan={plan.processEvaluationWorksheet} isEditing={false} onPlanChange={dummyOnPlanChange as any} />
            </PrintSection>
        )}
    </div>
  );
};

export default PrintLayout;
