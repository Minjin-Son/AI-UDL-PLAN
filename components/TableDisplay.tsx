import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TableLessonPlan, LessonPlanTableRow, EvaluationCriterion } from '../types';
import { generateImageForStep } from '../services/geminiService';

interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const AutoGrowTextarea: React.FC<AutoGrowTextareaProps> = (props) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useLayoutEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'inherit';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [props.value]);

    return <textarea ref={textareaRef} {...props} />;
};

interface EditableFieldProps {
    isEditing: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    multiline?: boolean;
    className?: string;
    textClassName?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ isEditing, value, onChange, multiline = true, className = '', textClassName = '' }) => {
    if (isEditing) {
        const commonProps = {
            value,
            onChange,
            className: `w-full p-1 rounded-md bg-indigo-50 border border-indigo-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none ${className}`,
        };
        return multiline ? <AutoGrowTextarea {...commonProps} /> : <textarea {...commonProps} rows={1} />;
    }
    return <div className={textClassName}>{value}</div>;
};

interface TableDisplayProps {
    plan: TableLessonPlan;
    isEditing: boolean;
    onPlanChange: (updatedPlan: TableLessonPlan) => void;
    fontSize?: number;
    fontFamily?: string;
}

const TableDisplay: React.FC<TableDisplayProps> = ({ plan, isEditing, onPlanChange, fontSize, fontFamily }) => {
    const tableRef = useRef<HTMLTableElement>(null);
    const [colWidths, setColWidths] = useState<number[]>([]);
    const resizingColIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);
    const [isGeneratingImages, setIsGeneratingImages] = useState(false);

    useEffect(() => {
        if (tableRef.current && colWidths.length === 0) {
            const ths = Array.from(tableRef.current.querySelectorAll('thead th'));
            const totalWidth = tableRef.current.offsetWidth;
            if (totalWidth > 0) {
                // FIX: Cast element to HTMLElement to access offsetWidth
                const widths = ths.map(th => ((th as HTMLElement).offsetWidth / totalWidth) * 100);
                setColWidths(widths);
            }
        }
    }, [plan, colWidths.length]);

    const handleMouseDown = useCallback((index: number, event: React.MouseEvent) => {
        if (!tableRef.current) return;
        resizingColIndex.current = index;
        startX.current = event.clientX;
        const ths = Array.from(tableRef.current.querySelectorAll('thead th'));
        // FIX: Cast element to HTMLElement to access offsetWidth
        startWidths.current = ths.map(th => (th as HTMLElement).offsetWidth);
        document.body.classList.add('resizing');
    }, []);

    const handleMouseMove = useCallback((event: MouseEvent) => {
        if (resizingColIndex.current === null || !tableRef.current) return;

        const dx = event.clientX - startX.current;
        const currentIndex = resizingColIndex.current;
        const nextIndex = currentIndex + 1;

        const currentThWidth = startWidths.current[currentIndex];
        const nextThWidth = startWidths.current[nextIndex];

        if (currentThWidth + dx < 50 || nextThWidth - dx < 50) {
            return; // Minimum width of 50px
        }

        const newColWidths = [...colWidths];
        const totalWidth = currentThWidth + nextThWidth;

        const newCurrentWidthPercent = ((currentThWidth + dx) / totalWidth) * (newColWidths[currentIndex] + newColWidths[nextIndex]);
        const newNextWidthPercent = ((nextThWidth - dx) / totalWidth) * (newColWidths[currentIndex] + newColWidths[nextIndex]);

        newColWidths[currentIndex] = newCurrentWidthPercent;
        newColWidths[nextIndex] = newNextWidthPercent;

        setColWidths(newColWidths);
    }, [colWidths]);

    const handleMouseUp = useCallback(() => {
        resizingColIndex.current = null;
        document.body.classList.remove('resizing');
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);


    const handleMetadataChange = (field: keyof TableLessonPlan['metadata'], value: string | string[]) => {
        onPlanChange({ ...plan, metadata: { ...plan.metadata, [field]: value } });
    };

    const handleStepChange = (stepIndex: number, field: keyof LessonPlanTableRow, value: string | string[]) => {
        const newSteps = JSON.parse(JSON.stringify(plan.steps));
        newSteps[stepIndex][field] = value;
        onPlanChange({ ...plan, steps: newSteps });
    };

    const handleListChange = (stepIndex: number, listName: 'teacherActivities' | 'studentActivities' | 'materialsAndNotes', itemIndex: number, value: string) => {
        const newSteps = JSON.parse(JSON.stringify(plan.steps));
        newSteps[stepIndex][listName][itemIndex] = value;
        onPlanChange({ ...plan, steps: newSteps });
    };

    const handleEvaluationCriterionChange = (critIndex: number, field: keyof EvaluationCriterion, value: string) => {
        const newCriteria = JSON.parse(JSON.stringify(plan.evaluationPlan.criteria));
        newCriteria[critIndex][field] = value;
        onPlanChange({ ...plan, evaluationPlan: { ...plan.evaluationPlan, criteria: newCriteria } });
    };

    const handleMoveStep = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index > 0) {
            const newSteps = [...plan.steps];
            [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
            onPlanChange({ ...plan, steps: newSteps });
        } else if (direction === 'down' && index < plan.steps.length - 1) {
            const newSteps = [...plan.steps];
            [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
            onPlanChange({ ...plan, steps: newSteps });
        }
    };

    const handleGenerateImages = async () => {
        if (!confirm('모든 단계의 관련 사진을 AI로 자동 생성하시겠습니까? 시간이 다소 소요될 수 있습니다.')) return;

        setIsGeneratingImages(true);
        const newSteps = [...plan.steps];

        try {
            for (let i = 0; i < newSteps.length; i++) {
                const step = newSteps[i];
                if (step.imageUrl) continue;

                const prompt = `
                    Create a simple, bright, and educational illustration for an elementary school lesson slide.
                    Subject: ${plan.metadata.subject}
                    Topic: ${plan.metadata.topic}
                    Phase: ${step.phase} - ${step.process}
                    Teacher Activity: ${step.teacherActivities.join(', ')}
                    Student Activity: ${step.studentActivities.join(', ')}
                    Style: Vector art or clean illustration, no text inside the image.
                `;

                const imageUrl = await generateImageForStep(prompt);
                if (imageUrl) {
                    newSteps[i] = { ...step, imageUrl };
                    onPlanChange({ ...plan, steps: [...newSteps] });
                }
                await new Promise(r => setTimeout(r, 1000));
            }
        } catch (error) {
            console.error(error);
            alert('이미지 생성 중 오류가 발생했습니다.');
        } finally {
            setIsGeneratingImages(false);
        }
    };

    const tableTextSize = fontSize ? '' : 'text-sm';

    return (
        <div className="space-y-8" style={{ fontSize: fontSize ? `${fontSize}px` : undefined, fontFamily: fontFamily !== 'inherit' ? fontFamily : undefined }}>
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">수업 정보</h3>
                <button
                    onClick={handleGenerateImages}
                    disabled={isGeneratingImages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${isGeneratingImages ? 'bg-slate-300' : 'bg-purple-600 hover:bg-purple-700'} text-white transition-colors shadow-sm`}
                >
                    {isGeneratingImages ? (
                        <>
                            <span className="animate-spin text-xl">✨</span>
                            <span>사진 생성 중...</span>
                        </>
                    ) : (
                        <>
                            <span className="text-xl">🎨</span>
                            <span>AI 사진 자동 채우기</span>
                        </>
                    )}
                </button>
            </div>

            <div className="prose max-w-none">
                <EditableField
                    isEditing={isEditing}
                    value={plan.metadata.lessonTitle}
                    onChange={(e) => handleMetadataChange('lessonTitle', e.target.value)}
                    textClassName="text-2xl font-bold text-slate-800"
                />
            </div>

            <table className={`w-full border-collapse border border-slate-300 ${tableTextSize} text-slate-700`}>
                <tbody>
                    <tr className="bg-slate-50">
                        <th className="border p-2 w-1/6 text-left font-semibold">과목</th>
                        <td className="border p-2 w-2/6">{plan.metadata.subject}</td>
                        <th className="border p-2 w-1/6 text-left font-semibold">학년</th>
                        <td className="border p-2 w-2/6">{plan.metadata.gradeLevel}</td>
                    </tr>
                    <tr>
                        <th className="border p-2 text-left font-semibold bg-slate-50">수업 주제</th>
                        <td colSpan={3} className="border p-2">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.metadata.topic}
                                onChange={(e) => handleMetadataChange('topic', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th className="border p-2 text-left font-semibold bg-slate-50">학습 목표</th>
                        <td colSpan={3} className="border p-2">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.metadata.objectives}
                                onChange={(e) => handleMetadataChange('objectives', e.target.value)}
                            />
                        </td>
                    </tr>
                    <tr>
                        <th className="border p-2 text-left font-semibold bg-slate-50">수업 시간</th>
                        <td className="border p-2">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.metadata.duration}
                                onChange={(e) => handleMetadataChange('duration', e.target.value)}
                                multiline={false}
                            />
                        </td>
                        <th className="border p-2 text-left font-semibold bg-slate-50">준비물</th>
                        <td className="border p-2">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.metadata.materials.join(', ')}
                                onChange={(e) => handleMetadataChange('materials', e.target.value.split(',').map(s => s.trim()))}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>

            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">교수·학습 과정</h3>
            <table ref={tableRef} className={`w-full border-collapse border border-slate-300 ${tableTextSize} resize-table table-fixed text-slate-700`}>
                <colgroup>
                    {colWidths.length > 0 ? (
                        colWidths.map((width, i) => <col key={i} style={{ width: `${width}%` }} />)
                    ) : (
                        <>
                            <col style={{ width: '10%' }} />
                            <col style={{ width: '15%' }} />
                            <col style={{ width: '35%' }} />
                            <col style={{ width: '25%' }} />
                            <col style={{ width: '15%' }} />
                        </>
                    )}
                </colgroup>
                <thead className="bg-slate-100">
                    <tr>
                        <th className="border p-2">
                            단계 (시간)
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(0, e)}></div>
                        </th>
                        <th className="border p-2">
                            학습 과정
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(1, e)}></div>
                        </th>
                        <th className="border p-2">
                            교수·학습 활동
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(2, e)}></div>
                        </th>
                        <th className="border p-2">
                            자료 및 유의점
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(3, e)}></div>
                        </th>
                        <th className="border p-2">PPT 사진</th>
                    </tr>
                </thead>
                <tbody>
                    {plan.steps.map((step, stepIndex) => (
                        <tr key={stepIndex}>
                            <td className="border p-2 align-top relative group">
                                {isEditing && (
                                    <div className="absolute right-1 top-1 flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleMoveStep(stepIndex, 'up')}
                                            disabled={stepIndex === 0}
                                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                            title="위로 이동"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => handleMoveStep(stepIndex, 'down')}
                                            disabled={stepIndex === plan.steps.length - 1}
                                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                                            title="아래로 이동"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                )}
                                <EditableField
                                    isEditing={isEditing}
                                    value={step.phase}
                                    onChange={(e) => handleStepChange(stepIndex, 'phase', e.target.value)}
                                    textClassName="font-bold"
                                />
                                <EditableField
                                    isEditing={isEditing}
                                    value={step.duration}
                                    onChange={(e) => handleStepChange(stepIndex, 'duration', e.target.value)}
                                />
                            </td>
                            <td className="border p-2 align-top">
                                <EditableField
                                    isEditing={isEditing}
                                    value={step.process}
                                    onChange={(e) => handleStepChange(stepIndex, 'process', e.target.value)}
                                />
                            </td>
                            <td className="border p-2 align-top">
                                <p className="font-semibold text-sky-700">T:</p>
                                <ul className="list-disc list-inside pl-2 mb-2">
                                    {step.teacherActivities.map((activity, i) => (
                                        <li key={i}>
                                            <EditableField
                                                isEditing={isEditing}
                                                value={activity}
                                                onChange={(e) => handleListChange(stepIndex, 'teacherActivities', i, e.target.value)}
                                                textClassName="inline"
                                            />
                                        </li>
                                    ))}
                                </ul>
                                <p className="font-semibold text-teal-700">S:</p>
                                <ul className="list-disc list-inside pl-2">
                                    {step.studentActivities.map((activity, i) => (
                                        <li key={i}>
                                            <EditableField
                                                isEditing={isEditing}
                                                value={activity}
                                                onChange={(e) => handleListChange(stepIndex, 'studentActivities', i, e.target.value)}
                                                textClassName="inline"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className="border p-2 align-top">
                                <ul className="list-none p-0">
                                    {step.materialsAndNotes.map((note, i) => (
                                        <li key={i}>
                                            <EditableField
                                                isEditing={isEditing}
                                                value={note}
                                                onChange={(e) => handleListChange(stepIndex, 'materialsAndNotes', i, e.target.value)}
                                                textClassName="inline"
                                            />
                                        </li>
                                    ))}
                                </ul>
                            </td>
                            <td className="border p-2 align-top text-center w-32">
                                {step.imageUrl ? (
                                    <div className="relative group">
                                        <img src={step.imageUrl} alt="PPT Slide" className="w-full h-auto rounded-md border border-slate-200 shadow-sm" />
                                        {isEditing && (
                                            <button
                                                onClick={() => {
                                                    const newSteps = [...plan.steps];
                                                    delete newSteps[stepIndex].imageUrl;
                                                    onPlanChange({ ...plan, steps: newSteps });
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                                                title="이미지 삭제"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-slate-300 text-xs italic p-4 text-center border border-dashed border-slate-200 rounded-md">
                                        (생성 전)
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h3 className="text-xl font-bold text-slate-800 mt-8 mb-4">평가 계획</h3>
            {plan.evaluationPlan.criteria.map((criterion, critIndex) => (
                <div key={critIndex} className="mb-4">
                    <table className={`w-full border-collapse border border-slate-300 ${tableTextSize} text-slate-700`}>
                        <tbody>
                            <tr className="bg-slate-50">
                                <th className="border p-2 w-1/4 text-left font-semibold">평가 내용</th>
                                <td className="border p-2">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={criterion.content}
                                        onChange={(e) => handleEvaluationCriterionChange(critIndex, 'content', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th className="border p-2 text-left font-semibold bg-slate-50">평가 방법</th>
                                <td className="border p-2">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={criterion.method}
                                        onChange={(e) => handleEvaluationCriterionChange(critIndex, 'method', e.target.value)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table className={`w-full border-collapse border border-slate-300 ${tableTextSize} mt-[-1px] text-slate-700`}>
                        <thead className="bg-slate-100">
                            <tr>
                                <th className="border p-2 w-1/4">평가 수준</th>
                                <th className="border p-2">평가 기준</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border p-2 font-semibold">잘함</td>
                                <td className="border p-2">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={criterion.excellent}
                                        onChange={(e) => handleEvaluationCriterionChange(critIndex, 'excellent', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border p-2 font-semibold">보통</td>
                                <td className="border p-2">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={criterion.good}
                                        onChange={(e) => handleEvaluationCriterionChange(critIndex, 'good', e.target.value)}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <td className="border p-2 font-semibold">노력요함</td>
                                <td className="border p-2">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={criterion.needsImprovement}
                                        onChange={(e) => handleEvaluationCriterionChange(critIndex, 'needsImprovement', e.target.value)}
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            ))}
        </div>
    );
};

export default TableDisplay;