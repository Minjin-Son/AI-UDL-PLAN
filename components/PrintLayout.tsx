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
  const dummyOnPlanChange = () => {};

  // [수정됨] 모든 하위 컴포넌트에 적용될 인쇄 스타일
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

        /* 인쇄 시 불필요한 여백, 그림자 제거 */
        .printable-content {
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
        }

        /* --- 페이지 나눔 제어 --- */

        /* 각 PrintSection이 새 페이지에서 시작하도록 강제 */
        .page-break-before {
            page-break-before: always;
        }
        
        /* 섹션 제목이 내용과 분리되지 않도록 함 */
        .print-section-header {
            page-break-after: avoid !important;
        }

        /* 제목 블록이 잘리지 않도록 함 */
        .page-break-avoid {
            page-break-inside: avoid !important;
        }

        /* 핵심: 모든 표의 행(tr)이 페이지 중간에 잘리지 않도록 함 */
        /* UDLDisplay, TableDisplay, UdlEvaluationDisplay, ProcessEvaluationDisplay의 표에 모두 적용됨 */
        tr {
            page-break-inside: avoid !important;
        }

        /* 표 자체는 길면 다음 페이지로 넘어갈 수 있도록 허용 */
        table {
            page-break-inside: auto;
        }
        
        /* 표가 페이지를 넘어가면 헤더를 반복 표시 */
        thead {
            display: table-header-group;
        }

        /* UDLDisplay의 중첩 테이블(.inner-table)도 잘림 방지 */
        .inner-table {
            page-break-inside: avoid !important;
        }

        /* WorksheetDisplay의 각 수준별 섹션이 잘리지 않도록 함 (클래스명 추정) */
        .worksheet-level-section {
            page-break-inside: avoid !important;
        }
        
        /* --- 스타일 강제 적용 --- */

        /* 연한 배경색 강제 인쇄 (가독성) */
        .bg-slate-50 { background-color: #f8fafc !important; }
        .bg-slate-100 { background-color: #f1f5f9 !important; }

        /* 텍스트 색상 강제 (검정) */
        .text-slate-800, .text-slate-900, .font-bold, .font-semibold, .font-extrabold {
            color: #000 !important;
        }
        .text-slate-500 {
            color: #333 !important;
        }
    }
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


