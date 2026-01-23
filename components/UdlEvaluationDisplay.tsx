import React from 'react';
import { UdlEvaluationPlan, EvaluationTask, EvaluationTaskLevel } from '../types';

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


interface UdlEvaluationDisplayProps {
    plan: UdlEvaluationPlan;
    isEditing: boolean;
    onPlanChange: (updatedPlan: UdlEvaluationPlan) => void;
    fontSize?: number;
    fontFamily?: string;
}

const UdlEvaluationDisplay: React.FC<UdlEvaluationDisplayProps> = ({ plan, isEditing, onPlanChange, fontSize, fontFamily }) => {

    const handleFieldChange = (field: keyof UdlEvaluationPlan, value: string) => {
        onPlanChange({ ...plan, [field]: value });
    };

    const handleTaskChange = (taskIndex: number, field: keyof EvaluationTask, value: any) => {
        const newTasks = JSON.parse(JSON.stringify(plan.tasks));
        newTasks[taskIndex][field] = value;
        onPlanChange({ ...plan, tasks: newTasks });
    };

    const handleTaskLevelChange = (taskIndex: number, level: 'advanced' | 'proficient' | 'basic', field: keyof EvaluationTaskLevel, value: string) => {
        const newTasks = JSON.parse(JSON.stringify(plan.tasks));
        newTasks[taskIndex].levels[level][field] = value;
        onPlanChange({ ...plan, tasks: newTasks });
    };

    const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
        'advanced': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
        'proficient': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
        'basic': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    };

    const levelNames = {
        'advanced': '상',
        'proficient': '중',
        'basic': '하',
    };

    const contentTextSize = fontSize ? '' : 'text-sm';
    const descTextSize = fontSize ? '' : 'text-sm';
    const badgeTextSize = fontSize ? '' : 'text-xs';

    return (
        <div className="space-y-8" style={{ fontSize: fontSize ? `${fontSize}px` : undefined, fontFamily: fontFamily !== 'inherit' ? fontFamily : undefined }}>
            <div>
                <EditableField
                    isEditing={isEditing}
                    value={plan.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    textClassName="text-2xl font-bold text-slate-800 mb-2"
                />
                <EditableField
                    isEditing={isEditing}
                    value={plan.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    textClassName="text-slate-600 mb-6"
                />

                {/* ✅ 평가 개요 테이블 */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
                    <table className="w-full text-sm text-left">
                        <tbody>
                            <tr className="border-b border-slate-100">
                                <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 w-1/4">단원(차시)</th>
                                <td className="px-4 py-3">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={plan.unitLesson || ''}
                                        onChange={(e) => handleFieldChange('unitLesson', e.target.value)}
                                        textClassName="text-slate-800"
                                        multiline={false}
                                    />
                                </td>
                                <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 w-1/4">평가 시기</th>
                                <td className="px-4 py-3">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={plan.evaluationTiming || ''}
                                        onChange={(e) => handleFieldChange('evaluationTiming', e.target.value)}
                                        textClassName="text-slate-800"
                                        multiline={false}
                                    />
                                </td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-700">평가 유형</th>
                                <td colSpan={3} className="px-4 py-3">
                                    <div className="flex gap-2 flex-wrap">
                                        {Array.isArray(plan.evaluationTypes) ? plan.evaluationTypes.map((type, i) => (
                                            <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                                                {type}
                                            </span>
                                        )) : <span className="text-slate-400 text-xs">평가 유형 정보 없음</span>}
                                    </div>
                                </td>
                            </tr>
                            <tr className="border-b border-slate-100">
                                <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 align-top">평가 의도 및 유의점</th>
                                <td colSpan={3} className="px-4 py-3">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={plan.evaluationIntentAndNotices || ''}
                                        onChange={(e) => handleFieldChange('evaluationIntentAndNotices', e.target.value)}
                                        textClassName="text-slate-700 whitespace-pre-wrap"
                                    />
                                </td>
                            </tr>
                            {plan.achievementStandardLevels && (
                                <tr className="border-b border-slate-100">
                                    <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 align-top">성취 수준</th>
                                    <td colSpan={3} className="px-4 py-3">
                                        <div className="space-y-2">
                                            <div className="flex gap-2">
                                                <span className="font-bold text-slate-700 min-w-[20px]">A:</span>
                                                <EditableField
                                                    isEditing={isEditing}
                                                    value={plan.achievementStandardLevels.A || ''}
                                                    onChange={(e) => {
                                                        const newLevels = { ...plan.achievementStandardLevels, A: e.target.value };
                                                        // @ts-ignore
                                                        onPlanChange({ ...plan, achievementStandardLevels: newLevels });
                                                    }}
                                                    textClassName="text-slate-700"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-bold text-slate-700 min-w-[20px]">B:</span>
                                                <EditableField
                                                    isEditing={isEditing}
                                                    value={plan.achievementStandardLevels.B || ''}
                                                    onChange={(e) => {
                                                        const newLevels = { ...plan.achievementStandardLevels, B: e.target.value };
                                                        // @ts-ignore
                                                        onPlanChange({ ...plan, achievementStandardLevels: newLevels });
                                                    }}
                                                    textClassName="text-slate-700"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <span className="font-bold text-slate-700 min-w-[20px]">C:</span>
                                                <EditableField
                                                    isEditing={isEditing}
                                                    value={plan.achievementStandardLevels.C || ''}
                                                    onChange={(e) => {
                                                        const newLevels = { ...plan.achievementStandardLevels, C: e.target.value };
                                                        // @ts-ignore
                                                        onPlanChange({ ...plan, achievementStandardLevels: newLevels });
                                                    }}
                                                    textClassName="text-slate-700"
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                            <tr>
                                <th className="bg-slate-50 px-4 py-3 font-semibold text-slate-700 align-top">예시 답안</th>
                                <td colSpan={3} className="px-4 py-3">
                                    <EditableField
                                        isEditing={isEditing}
                                        value={plan.exampleAnswers || ''}
                                        onChange={(e) => handleFieldChange('exampleAnswers', e.target.value)}
                                        textClassName="text-slate-700 whitespace-pre-wrap bg-yellow-50/50 p-3 rounded"
                                    />
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="space-y-6">
                {plan.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                        <EditableField
                            isEditing={isEditing}
                            value={task.taskTitle}
                            onChange={(e) => handleTaskChange(taskIndex, 'taskTitle', e.target.value)}
                            textClassName="text-lg font-bold text-slate-800"
                        />
                        <EditableField
                            isEditing={isEditing}
                            value={task.taskDescription}
                            onChange={(e) => handleTaskChange(taskIndex, 'taskDescription', e.target.value)}
                            textClassName={`${descTextSize} text-slate-600 mt-1 mb-3`}
                        />
                        <div className="flex flex-wrap gap-2 mb-4">
                            {task.udlConnections.map((conn, connIndex) => (
                                <span key={connIndex} className={`bg-indigo-100 text-indigo-800 ${badgeTextSize} font-medium px-2.5 py-1 rounded-full`}>
                                    {conn}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(Object.keys(levelNames) as Array<keyof typeof levelNames>).map(levelKey => {
                                const levelData = task.levels[levelKey];
                                const colors = levelColors[levelKey];
                                return (
                                    <div key={levelKey} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                                        <h5 className={`font-bold text-md mb-2 ${colors.text}`}>수준: {levelNames[levelKey]}</h5>
                                        <div className={`space-y-3 ${contentTextSize}`}>
                                            <div>
                                                <p className="font-semibold text-slate-700 mb-1">과제 설명</p>
                                                <EditableField
                                                    isEditing={isEditing}
                                                    value={levelData.description}
                                                    onChange={(e) => handleTaskLevelChange(taskIndex, levelKey, 'description', e.target.value)}
                                                    textClassName="text-slate-600"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-700 mb-1">평가 기준</p>
                                                <EditableField
                                                    isEditing={isEditing}
                                                    value={levelData.criteria}
                                                    onChange={(e) => handleTaskLevelChange(taskIndex, levelKey, 'criteria', e.target.value)}
                                                    textClassName="text-slate-600"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UdlEvaluationDisplay;