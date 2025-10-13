import React, { useState, useEffect, useRef } from 'react';
import { GeneratedLessonPlan } from '../types';
import UDLDisplay from './UDLDisplay';
import TableDisplay from './TableDisplay';
import UdlEvaluationDisplay from './UdlEvaluationDisplay';
import ProcessEvaluationDisplay from './ProcessEvaluationDisplay';
import { exportPlan } from '../services/exportService';

interface DisplayPanelProps {
    isLoading: boolean;
    error: string | null;
    generatedPlan: GeneratedLessonPlan | null;
    onSavePlan: () => void;
    isSaved: boolean;
    onGenerateTableView: () => void;
    isTableLoading: boolean;
    onGenerateUdlEvaluation: () => void;
    isUdlEvaluationLoading: boolean;
    onGenerateProcessEvaluation: () => void;
    isProcessEvaluationLoading: boolean;
    isEditing: boolean;
    setIsEditing: (isEditing: boolean) => void;
    onUpdatePlan: (updatedPlan: GeneratedLessonPlan) => void;
    onPrint: (plan: GeneratedLessonPlan) => void;
}

const DisplayPanel: React.FC<DisplayPanelProps> = ({
    isLoading,
    error,
    generatedPlan,
    onSavePlan,
    isSaved,
    onGenerateTableView,
    isTableLoading,
    onGenerateUdlEvaluation,
    isUdlEvaluationLoading,
    onGenerateProcessEvaluation,
    isProcessEvaluationLoading,
    isEditing,
    setIsEditing,
    onUpdatePlan,
    onPrint
}) => {
    const [view, setView] = useState<'udl' | 'table' | 'udlEvaluation' | 'processEvaluation'>('udl');
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);

    const handleHtmlExport = () => {
        if (generatedPlan) {
            exportPlan(generatedPlan, view);
        }
        setIsExportMenuOpen(false);
    };

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
    
    useEffect(() => {
        if(generatedPlan) {
            setView('udl');
        }
    }, [generatedPlan]);

    const renderContent = () => {
        if (isLoading) return <div className="text-center p-8 text-slate-500">UDL AI가 지도안을 생성 중입니다...</div>;
        if (error) return <div className="text-center p-8 text-red-600">오류가 발생했습니다: {error}</div>;
        if (!generatedPlan) return <div className="text-center p-8 text-slate-500">왼쪽 양식을 채우고 'UDL 지도안 생성' 버튼을 클릭하여 지도안을 만들어 보세요.</div>;

        switch (view) {
            case 'udl':
                return <UDLDisplay plan={generatedPlan} isEditing={isEditing} onPlanChange={onUpdatePlan} />;
            case 'table':
                return generatedPlan.tablePlan ? <TableDisplay plan={generatedPlan.tablePlan} /> : <div className="text-center p-4">표 형식 지도안을 생성해 주세요.</div>;
            case 'udlEvaluation':
                return generatedPlan.udlEvaluation ? <UdlEvaluationDisplay plan={generatedPlan.udlEvaluation} /> : <div className="text-center p-4">UDL 평가 계획을 생성해 주세요.</div>;
            case 'processEvaluation':
                return generatedPlan.processEvaluationWorksheet ? <ProcessEvaluationDisplay plan={generatedPlan.processEvaluationWorksheet} /> : <div className="text-center p-4">과정중심평가지를 생성해 주세요.</div>;
            default:
                return null;
        }
    };

    return (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md min-h-[600px] flex flex-col">
            <div className="flex-grow">
                <div className="flex items-start justify-between no-print">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                            <button onClick={() => setView('udl')} className={`${view === 'udl' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}>UDL 지도안</button>
                            <button onClick={onGenerateTableView} disabled={isTableLoading || !!generatedPlan?.tablePlan} className={`${view === 'table' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm disabled:opacity-50`}>{isTableLoading ? '생성 중...' : '표 형식 지도안'}</button>
                            <button onClick={onGenerateUdlEvaluation} disabled={isUdlEvaluationLoading || !!generatedPlan?.udlEvaluation} className={`${view === 'udlEvaluation' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm disabled:opacity-50`}>{isUdlEvaluationLoading ? '생성 중...' : 'UDL 평가 계획'}</button>
                            <button onClick={onGenerateProcessEvaluation} disabled={isProcessEvaluationLoading || !!generatedPlan?.processEvaluationWorksheet} className={`${view === 'processEvaluation' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm disabled:opacity-50`}>{isProcessEvaluationLoading ? '생성 중...' : '과정중심평가지'}</button>
                        </nav>
                    </div>
                </div>

                <div className="mt-4 printable-content">
                    {renderContent()}
                </div>
            </div>
            
            {generatedPlan && (
                <div className="flex flex-wrap items-center justify-between gap-2 mt-4 no-print border-t pt-4">
                    <div>
                        <button onClick={() => onPrint(generatedPlan)} className="btn-secondary">인쇄</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                            <button onClick={() => onUpdatePlan(generatedPlan)} className="btn-primary">저장</button>
                        ) : (
                            <>
                                <button onClick={onSavePlan} disabled={isSaved} className={`btn-primary ${isSaved ? 'opacity-50 cursor-not-allowed' : ''}`}>{isSaved ? '저장됨' : '저장'}</button>
                                <button onClick={() => setIsEditing(true)} className="btn-secondary">수정하기</button>
                            </>
                        )}
                        <div className="relative" ref={exportMenuRef}>
                            <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className="btn-secondary">
                                내보내기
                            </button>
                            {isExportMenuOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-lg z-10">
                                    <button onClick={handleHtmlExport} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                        HTML 파일로 내보내기
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisplayPanel;