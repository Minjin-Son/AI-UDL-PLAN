import React, { useState, useEffect, useRef } from 'react';
import { GeneratedLessonPlan } from '../types';
import TableDisplay from './TableDisplay';
import UDLDisplay from './UDLDisplay';
import WorksheetDisplay from './WorksheetDisplay';
import UdlEvaluationDisplay from './UdlEvaluationDisplay';
import ProcessEvaluationDisplay from './ProcessEvaluationDisplay';
import { exportPlanAsWord } from '../services/exportService';

interface DisplayPanelProps {
  isLoading: boolean;
  error: string | null;
  generatedPlan: GeneratedLessonPlan | null;
  onSavePlan: () => void;
  isSaved: boolean;
  onGenerateTableView: () => void;
  isTableLoading: boolean;
  onGenerateWorksheet: () => void;
  isWorksheetLoading: boolean;
  onGenerateUdlEvaluation: () => void;
  isUdlEvaluationLoading: boolean;
  onGenerateProcessEvaluation: () => void;
  isProcessEvaluationLoading: boolean;
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onUpdatePlan: (plan: GeneratedLessonPlan) => void;
  onPrint: (plan: GeneratedLessonPlan) => void;
}

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8">
    <svg className="animate-spin h-12 w-12 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <h3 className="text-xl font-semibold text-slate-700">UDL 지도안 생성 중</h3>
    <p className="text-slate-500 mt-2">AI가 맞춤형 지도안을 만들고 있습니다. 잠시만 기다려 주세요.</p>
  </div>
);

const InitialState: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-indigo-50 rounded-xl border-2 border-dashed border-indigo-200">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="text-2xl font-bold text-slate-800">지도안이 기다리고 있습니다</h3>
        <p className="text-slate-500 mt-2 max-w-md">수업 정보를 입력하면 AI가 생성한 UDL 기반 지도안이 여기에 표시되어 모두를 위한 학습에 영감을 줄 것입니다.</p>
  </div>
);

const ErrorState: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 rounded-xl border border-red-200">
         <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-xl font-semibold text-red-800">오류가 발생했습니다</h3>
        <p className="text-red-600 mt-2">{message}</p>
  </div>
);

const PlanDisplay: React.FC<{ 
  plan: GeneratedLessonPlan, 
  onSavePlan: () => void, 
  isSaved: boolean, 
  onGenerateTableView: () => void, 
  isTableLoading: boolean,
  onGenerateWorksheet: () => void,
  isWorksheetLoading: boolean,
  onGenerateUdlEvaluation: () => void;
  isUdlEvaluationLoading: boolean;
  onGenerateProcessEvaluation: () => void;
  isProcessEvaluationLoading: boolean;
  isEditing: boolean,
  setIsEditing: (isEditing: boolean) => void;
  onUpdatePlan: (plan: GeneratedLessonPlan) => void;
  onPrint: (plan: GeneratedLessonPlan) => void;
}> = ({ plan, onSavePlan, isSaved, onGenerateTableView, isTableLoading, onGenerateWorksheet, isWorksheetLoading, onGenerateUdlEvaluation, isUdlEvaluationLoading, onGenerateProcessEvaluation, isProcessEvaluationLoading, isEditing, setIsEditing, onUpdatePlan, onPrint }) => {
  const [view, setView] = useState<'udl' | 'table' | 'worksheet' | 'udlEvaluation' | 'processEvaluation'>('udl');
  const [editablePlan, setEditablePlan] = useState<GeneratedLessonPlan>(plan);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditablePlan(plan);
  }, [plan]);
  
  useEffect(() => {
    setView('udl');
  }, [plan.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [exportMenuRef]);

  const handleTableViewClick = () => {
    if (!isEditing) {
      if (!plan.tablePlan) {
        onGenerateTableView();
      }
      setView('table');
    }
  };

  const handleWorksheetViewClick = () => {
    if (!isEditing) {
        setView('worksheet');
    }
  }

  const handleUdlEvaluationViewClick = () => {
    if (!isEditing) {
        setView('udlEvaluation');
    }
  }

  const handleProcessEvaluationViewClick = () => {
    if (!isEditing) {
        setView('processEvaluation');
    }
  }

  const handlePlanChange = (updatedPlan: GeneratedLessonPlan) => {
    setEditablePlan(updatedPlan);
  };
  
  const handleSaveEdits = () => {
    onUpdatePlan(editablePlan);
    setIsEditing(false);
  }

  const handleCancelEdit = () => {
    setEditablePlan(plan);
    setIsEditing(false);
  }

  const handlePrint = () => {
    onPrint(plan);
    setIsExportMenuOpen(false);
  }

  const handleWordExport = () => {
      exportPlanAsWord(plan, view);
      setIsExportMenuOpen(false);
  }

  const headerTitle = isEditing ? (
    <input 
      type="text" 
      value={editablePlan.lessonTitle}
      onChange={(e) => setEditablePlan(p => ({ ...p, lessonTitle: e.target.value }))}
      className="text-3xl font-extrabold text-slate-900 tracking-tight bg-slate-100 rounded-md p-1 -m-1 w-full"
    />
  ) : (
    <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{plan.lessonTitle}</h2>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="pb-4 border-b border-slate-200">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            {headerTitle}
            <div className="flex space-x-4 text-sm text-slate-500 mt-2">
                <span><strong>학년:</strong> {plan.gradeLevel}</span>
                <span><strong>과목:</strong> {plan.subject}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0 no-print">
             {!isEditing ? (
                <>
                    <div ref={exportMenuRef} className="relative inline-block text-left">
                        <button
                            onClick={() => setIsExportMenuOpen(prev => !prev)}
                            className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 border border-slate-300 hover:bg-slate-100 flex items-center gap-2"
                        >
                            <span>내보내기</span>
                             <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                        {isExportMenuOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                                <div className="py-1">
                                    <button onClick={handlePrint} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm2-9V5a2 2 0 012-2h2a2 2 0 012 2v3" /></svg>
                                        PDF로 저장 (인쇄)
                                    </button>
                                    <button onClick={handleWordExport} className="text-slate-700 block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                        Word로 다운로드
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 border border-slate-300 hover:bg-slate-100"
                    >
                        수정하기
                    </button>
                    <button
                        onClick={onSavePlan}
                        disabled={isSaved}
                        className="bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 enabled:hover:bg-indigo-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
                    >
                        {isSaved ? '✓ 저장됨' : '지도안 저장'}
                    </button>
                </>
             ) : (
                <>
                    <button
                        onClick={handleCancelEdit}
                        className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 border border-slate-300 hover:bg-slate-100"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSaveEdits}
                        className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors duration-200 hover:bg-indigo-700"
                    >
                        변경사항 저장
                    </button>
                </>
             )}
          </div>
        </div>
      </div>
      
      <div className="border-b border-slate-200 mt-4 no-print">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
              onClick={() => !isEditing && setView('udl')}
              disabled={isEditing}
              className={`${view === 'udl' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-transparent`}
          >
              UDL 지도안
          </button>
          <button
              onClick={handleTableViewClick}
              disabled={isEditing}
              className={`${view === 'table' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-transparent`}
          >
              표 형식 지도안
          </button>
          <button
              onClick={handleWorksheetViewClick}
              disabled={isEditing}
              className={`${view === 'worksheet' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-transparent`}
          >
              수준별 활동지
          </button>
          <button
              onClick={handleUdlEvaluationViewClick}
              disabled={isEditing}
              className={`${view === 'udlEvaluation' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-transparent`}
          >
              UDL 평가 계획
          </button>
          <button
              onClick={handleProcessEvaluationViewClick}
              disabled={isEditing}
              className={`${view === 'processEvaluation' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors disabled:text-slate-400 disabled:cursor-not-allowed disabled:hover:border-transparent`}
          >
              과정중심평가지
          </button>
        </nav>
      </div>

      <div className="flex-grow pt-6 overflow-y-auto printable-area">
        {view === 'udl' && (
          <UDLDisplay 
            plan={editablePlan} 
            isEditing={isEditing}
            onPlanChange={handlePlanChange}
          />
        )}
        {view === 'table' && (
            <div>
                {isTableLoading ? (
                    <div className="flex flex-col items-center justify-center text-center p-8">
                        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-700">표 형식 지도안 생성 중...</h3>
                    </div>
                ) : editablePlan.tablePlan ? (
                    <TableDisplay 
                    plan={editablePlan.tablePlan}
                    isEditing={isEditing}
                    onPlanChange={(updatedTablePlan) => 
                        handlePlanChange({ ...editablePlan, tablePlan: updatedTablePlan })
                    }
                    />
                ) : (
                    <div className="text-center p-8 text-slate-500">표 형식 지도안을 불러오는 중입니다. 잠시 후에도 표시되지 않으면 다시 시도해 주세요.</div>
                )}
            </div>
        )}
        {view === 'worksheet' && (
            <div>
                { isWorksheetLoading ? (
                     <div className="flex flex-col items-center justify-center text-center p-8">
                        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-700">수준별 활동지 생성 중...</h3>
                    </div>
                ) : editablePlan.worksheet ? (
                    <WorksheetDisplay
                      plan={editablePlan.worksheet}
                      isEditing={isEditing}
                      onPlanChange={(updatedWorksheet) =>
                        handlePlanChange({ ...editablePlan, worksheet: updatedWorksheet })
                      }
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <h3 className="text-xl font-bold text-slate-700">수준별 활동지를 생성할 수 있습니다</h3>
                        <p className="text-slate-500 mt-2 mb-4 max-w-md">버튼을 클릭하여 AI가 현재 수업에 맞는 '기본-보충-심화' 활동지를 만들도록 하세요.</p>
                        <button
                            onClick={onGenerateWorksheet}
                            className="bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                        >
                            ✨ 활동지 생성하기
                        </button>
                    </div>
                )}
            </div>
        )}
        {view === 'udlEvaluation' && (
            <div>
                { isUdlEvaluationLoading ? (
                     <div className="flex flex-col items-center justify-center text-center p-8">
                        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-700">UDL 평가 계획 생성 중...</h3>
                    </div>
                ) : editablePlan.udlEvaluation ? (
                    <UdlEvaluationDisplay
                      plan={editablePlan.udlEvaluation}
                      isEditing={isEditing}
                      onPlanChange={(updatedUdlEvaluation) =>
                        handlePlanChange({ ...editablePlan, udlEvaluation: updatedUdlEvaluation })
                      }
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-slate-700">UDL 기반 평가 계획을 생성할 수 있습니다</h3>
                        <p className="text-slate-500 mt-2 mb-4 max-w-md">버튼을 클릭하여 AI가 현재 수업에 맞는 '상-중-하' 수준별 평가 계획을 만들도록 하세요.</p>
                        <button
                            onClick={onGenerateUdlEvaluation}
                            className="bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
                        >
                            ✨ 평가 계획 생성하기
                        </button>
                    </div>
                )}
            </div>
        )}
        {view === 'processEvaluation' && (
            <div>
                { isProcessEvaluationLoading ? (
                     <div className="flex flex-col items-center justify-center text-center p-8">
                        <svg className="animate-spin h-10 w-10 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-slate-700">과정중심평가지 생성 중...</h3>
                    </div>
                ) : editablePlan.processEvaluationWorksheet ? (
                    <ProcessEvaluationDisplay
                      plan={editablePlan.processEvaluationWorksheet}
                      isEditing={isEditing}
                      onPlanChange={(updatedProcessEvaluation) =>
                        handlePlanChange({ ...editablePlan, processEvaluationWorksheet: updatedProcessEvaluation })
                      }
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="text-xl font-bold text-slate-700">과정중심평가지를 생성할 수 있습니다</h3>
                        <p className="text-slate-500 mt-2 mb-4 max-w-md">UDL 평가 계획에 기반하여 학생의 학습 과정을 평가할 수 있는 맞춤형 평가지를 생성합니다.</p>
                        <button
                            onClick={onGenerateProcessEvaluation}
                            className="bg-indigo-600 text-white font-bold py-2.5 px-5 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 disabled:bg-slate-400 disabled:cursor-not-allowed"
                            disabled={!editablePlan.udlEvaluation}
                            title={!editablePlan.udlEvaluation ? 'UDL 평가 계획을 먼저 생성해야 합니다.' : '평가지 생성하기'}
                        >
                            ✨ 평가지 생성하기
                        </button>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}

const DisplayPanel: React.FC<DisplayPanelProps> = (props) => {
  let content;

  if (props.isLoading) {
    content = <LoadingState />;
  } else if (props.error) {
    content = <ErrorState message={props.error} />;
  } else if (props.generatedPlan) {
    content = <PlanDisplay 
      plan={props.generatedPlan} 
      onSavePlan={props.onSavePlan} 
      isSaved={props.isSaved}
      onGenerateTableView={props.onGenerateTableView}
      isTableLoading={props.isTableLoading}
      onGenerateWorksheet={props.onGenerateWorksheet}
      isWorksheetLoading={props.isWorksheetLoading}
      onGenerateUdlEvaluation={props.onGenerateUdlEvaluation}
      isUdlEvaluationLoading={props.isUdlEvaluationLoading}
      onGenerateProcessEvaluation={props.onGenerateProcessEvaluation}
      isProcessEvaluationLoading={props.isProcessEvaluationLoading}
      isEditing={props.isEditing}
      setIsEditing={props.setIsEditing}
      onUpdatePlan={props.onUpdatePlan}
      onPrint={props.onPrint}
    />;
  } else {
    content = <InitialState />;
  }

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-slate-200 min-h-[500px] h-full printable-content">
      {content}
    </div>
  );
};

export default DisplayPanel;