import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProcessEvaluationWorksheet, EvaluationItem } from '../types';

interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

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

interface ProcessEvaluationDisplayProps {
    plan: ProcessEvaluationWorksheet;
    isEditing: boolean;
    onPlanChange: (updatedPlan: ProcessEvaluationWorksheet) => void;
}

const ProcessEvaluationDisplay: React.FC<ProcessEvaluationDisplayProps> = ({ plan, isEditing, onPlanChange }) => {
    const tableRef = useRef<HTMLTableElement>(null);
    const [colWidths, setColWidths] = useState<number[]>([]);
    const resizingColIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

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
    
    const handleFieldChange = (field: keyof ProcessEvaluationWorksheet, value: string) => {
        onPlanChange({ ...plan, [field]: value });
    };
    
    const handleStudentInfoChange = (field: keyof ProcessEvaluationWorksheet['studentInfo'], value: string) => {
        onPlanChange({ ...plan, studentInfo: { ...plan.studentInfo, [field]: value }});
    };

    const handleItemChange = (itemIndex: number, field: keyof EvaluationItem, value: any) => {
        const newItems = JSON.parse(JSON.stringify(plan.evaluationItems));
        newItems[itemIndex][field] = value;
        onPlanChange({ ...plan, evaluationItems: newItems });
    };

    const handleItemLevelChange = (itemIndex: number, level: keyof EvaluationItem['levels'], value: string) => {
        const newItems = JSON.parse(JSON.stringify(plan.evaluationItems));
        newItems[itemIndex].levels[level] = value;
        onPlanChange({ ...plan, evaluationItems: newItems });
    };

    const handleFeedbackChange = (field: keyof ProcessEvaluationWorksheet['overallFeedback'], value: string) => {
        onPlanChange({ ...plan, overallFeedback: { ...plan.overallFeedback, [field]: value }});
    };

    return (
        <div className="space-y-8">
            <div>
                 <EditableField
                    isEditing={isEditing}
                    value={plan.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    textClassName="text-2xl font-bold text-slate-800 mb-4 text-center"
                />
            </div>
            
            <div className="border border-slate-300 rounded-lg p-3 text-sm text-slate-700">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                    <div className="flex items-baseline justify-center">
                        <EditableField isEditing={isEditing} value={plan.studentInfo.grade} onChange={(e) => handleStudentInfoChange('grade', e.target.value)} multiline={false} textClassName="font-semibold mr-1" />
                        <span className="inline-block w-16 border-b-2 border-slate-300">&nbsp;</span>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <EditableField isEditing={isEditing} value={plan.studentInfo.class} onChange={(e) => handleStudentInfoChange('class', e.target.value)} multiline={false} textClassName="font-semibold mr-1" />
                        <span className="inline-block w-12 border-b-2 border-slate-300">&nbsp;</span>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <EditableField isEditing={isEditing} value={plan.studentInfo.number} onChange={(e) => handleStudentInfoChange('number', e.target.value)} multiline={false} textClassName="font-semibold mr-1" />
                        <span className="inline-block w-12 border-b-2 border-slate-300">&nbsp;</span>
                    </div>
                    <div className="flex items-baseline justify-center">
                        <EditableField isEditing={isEditing} value={plan.studentInfo.name} onChange={(e) => handleStudentInfoChange('name', e.target.value)} multiline={false} textClassName="font-semibold mr-1" />
                        <span className="inline-block w-24 border-b-2 border-slate-300">&nbsp;</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 p-4 border-l-4 border-indigo-400 text-slate-700">
                <EditableField
                    isEditing={isEditing}
                    value={plan.overallDescription}
                    onChange={(e) => handleFieldChange('overallDescription', e.target.value)}
                />
            </div>

            <table ref={tableRef} className="w-full border-collapse border border-slate-300 text-sm resize-table table-fixed text-slate-700">
                <colgroup>
                    {colWidths.length > 0 ? (
                        colWidths.map((width, i) => <col key={i} style={{ width: `${width}%` }} />)
                    ) : (
                        <>
                            <col style={{ width: '40%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '20%' }} />
                            <col style={{ width: '20%' }} />
                        </>
                    )}
                </colgroup>
                <thead className="bg-slate-100">
                    <tr>
                        <th className="border p-2 text-left">
                            평가 기준
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(0, e)}></div>
                        </th>
                        <th className="border p-2">
                            상
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(1, e)}></div>
                        </th>
                        <th className="border p-2">
                            중
                            <div className="resizer" onMouseDown={(e) => handleMouseDown(2, e)}></div>
                        </th>
                        <th className="border p-2">하</th>
                    </tr>
                </thead>
                <tbody>
                    {plan.evaluationItems.map((item, itemIndex) => (
                        <tr key={itemIndex}>
                            <td className="border p-2 align-top font-semibold">
                                 <EditableField
                                    isEditing={isEditing}
                                    value={item.criterion}
                                    onChange={(e) => handleItemChange(itemIndex, 'criterion', e.target.value)}
                                />
                            </td>
                            <td className="border p-2 align-top">
                                <EditableField
                                    isEditing={isEditing}
                                    value={item.levels.excellent}
                                    onChange={(e) => handleItemLevelChange(itemIndex, 'excellent', e.target.value)}
                                />
                            </td>
                             <td className="border p-2 align-top">
                                <EditableField
                                    isEditing={isEditing}
                                    value={item.levels.good}
                                    onChange={(e) => handleItemLevelChange(itemIndex, 'good', e.target.value)}
                                />
                            </td>
                             <td className="border p-2 align-top">
                                <EditableField
                                    isEditing={isEditing}
                                    value={item.levels.needsImprovement}
                                    onChange={(e) => handleItemLevelChange(itemIndex, 'needsImprovement', e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="space-y-6">
                <div>
                    <h4 className="font-bold text-slate-800 mb-2">교사 종합 의견</h4>
                     <div className="border border-slate-300 p-2 rounded-md min-h-[100px] text-slate-700">
                        <EditableField
                            isEditing={isEditing}
                            value={plan.overallFeedback.teacherComment}
                            onChange={(e) => handleFeedbackChange('teacherComment', e.target.value)}
                        />
                    </div>
                </div>
                 <div>
                    <h4 className="font-bold text-slate-800 mb-2">자기 성찰</h4>
                    <div className="border border-slate-300 p-2 rounded-md min-h-[100px] text-slate-700">
                         <EditableField
                            isEditing={isEditing}
                            value={plan.overallFeedback.studentReflection}
                            onChange={(e) => handleFeedbackChange('studentReflection', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessEvaluationDisplay;