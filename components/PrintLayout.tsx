import React from 'react';
import { GeneratedLessonPlan } from '../types';
// [수정됨] 컴파일 오류 해결을 위해 .tsx 확장자 명시
import UDLDisplay from './UDLDisplay.tsx';
import TableDisplay from './TableDisplay.tsx';
import WorksheetDisplay from './WorksheetDisplay.tsx';
import UdlEvaluationDisplay from './UdlEvaluationDisplay.tsx';
import ProcessEvaluationDisplay from './ProcessEvaluationDisplay.tsx';

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
    const dummyOnPlanChange = () => { };

    // [수정됨] 모든 하위 컴포넌트에 적용될 인쇄 및 미리보기 스타일
    const printStyles = `
    @media print {
        /* A4 페이지 크기 및 여백 설정 */
        @page {
            size: A4;
            margin: 1.5cm;
        }

        /* 인쇄 시 강제로 배경색과 색상을 적용 (브라우저 설정 무시) */
        body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
        }
    }

    /* 공통 인쇄/미리보기 스타일 */
    @media print {
        .printable-content { padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
        .page-break-before { page-break-before: always; }
        .print-section-header { page-break-after: avoid !important; }
        .page-break-avoid { page-break-inside: avoid !important; }
        tr { page-break-inside: avoid !important; }
        table { page-break-inside: auto; }
        thead { display: table-header-group; }
        .inner-table { page-break-inside: avoid !important; }
        .worksheet-level-section { page-break-inside: avoid !important; }
        .bg-slate-50 { background-color: #f8fafc !important; }
        .bg-slate-100 { background-color: #f1f5f9 !important; }
        .text-slate-800, .text-slate-900, .font-bold, .font-semibold, .font-extrabold { color: #000 !important; }
        .text-slate-500 { color: #333 !important; }
    }

    /* 인쇄 미리보기 전용 (화면 표시용) 스타일 */
    .print-preview-mode {
        padding: 1.5cm !important; /* 인쇄 여백과 동일하게 설정 */
        box-sizing: border-box;
    }
    .print-preview-mode .printable-content { padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
    .print-preview-mode .page-break-before { 
        page-break-before: always; 
        border-top: 2px dashed #cbd5e1; /* 화면에서는 구분선으로 페이지 나눔 표시 */
        margin-top: 2rem; 
        padding-top: 2rem; 
    }
    .print-preview-mode .print-section-header { page-break-after: avoid !important; }
    .print-preview-mode .page-break-avoid { page-break-inside: avoid !important; }
    .print-preview-mode tr { page-break-inside: avoid !important; }
    .print-preview-mode table { page-break-inside: auto; }
    .print-preview-mode thead { display: table-header-group; }
    .print-preview-mode .inner-table { page-break-inside: avoid !important; }
    .print-preview-mode .worksheet-level-section { page-break-inside: avoid !important; }
    .print-preview-mode .bg-slate-50 { background-color: #f8fafc !important; }
    .print-preview-mode .bg-slate-100 { background-color: #f1f5f9 !important; }
    .print-preview-mode .text-slate-800, .print-preview-mode .text-slate-900, .print-preview-mode .font-bold, .print-preview-mode .font-semibold, .print-preview-mode .font-extrabold { color: #000 !important; }
    .print-preview-mode .text-slate-500 { color: #333 !important; }
  `;

    return (
        <div className="bg-white p-8 printable-content">
            {/* [수정됨] 스타일 태그 삽입 */}
            <style>{printStyles}</style>

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
                    <WorksheetDisplay plan={plan.worksheet} isEditing={false} onPlanChange={dummyOnPlanChange} />
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


