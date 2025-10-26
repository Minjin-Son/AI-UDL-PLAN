import React from 'react';
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';

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


interface WorksheetDisplayProps {
    plan: Worksheet;
    isEditing: boolean;
    onPlanChange: (updatedPlan: Worksheet) => void;
}

const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing, onPlanChange }) => {

    const handleFieldChange = (field: keyof Worksheet, value: string) => {
        onPlanChange({ ...plan, [field]: value });
    };

    const handleLevelChange = (levelIndex: number, field: keyof WorksheetLevel, value: string) => {
        const newLevels = [...plan.levels];
        (newLevels[levelIndex] as any)[field] = value;
        onPlanChange({ ...plan, levels: newLevels });
    };

    const handleActivityChange = (levelIndex: number, activityIndex: number, field: keyof WorksheetActivity, value: string) => {
        const newLevels = JSON.parse(JSON.stringify(plan.levels));
        newLevels[levelIndex].activities[activityIndex][field] = value;
        onPlanChange({ ...plan, levels: newLevels });
    };

    const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
        '기본': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
        '보충': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
        '심화': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
    };

    return (
        <div className="space-y-8">
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
                    textClassName="text-slate-600"
                />
            </div>

            <div className="space-y-6">
                {plan.levels.map((level, levelIndex) => {
                    const colors = levelColors[level.levelName] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' };
                    return (
                        <div key={levelIndex} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-3 py-1 text-sm font-bold rounded-full ${colors.bg} border-2 ${colors.border} ${colors.text}`}>
                                     <EditableField
                                        isEditing={isEditing}
                                        value={level.levelName}
                                        onChange={(e) => handleLevelChange(levelIndex, 'levelName', e.target.value)}
                                        textClassName="inline"
                                        multiline={false}
                                     />
                                </span>
                                <h4 className={`text-lg font-bold ${colors.text}`}>
                                    <EditableField
                                        isEditing={isEditing}
                                        value={level.title}
                                        onChange={(e) => handleLevelChange(levelIndex, 'title', e.target.value)}
                                        textClassName="inline"
                                        multiline={false}
                                    />
                                </h4>
                            </div>

                            <div className="space-y-4">
                                {level.activities.map((activity, activityIndex) => (
                                    <div key={activityIndex} className="bg-white/50 p-4 rounded-md border border-slate-200/50">
                                        <h5 className="font-semibold text-slate-700">
                                            <EditableField
                                                isEditing={isEditing}
                                                value={activity.title}
                                                onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'title', e.target.value)}
                                            />
                                        </h5>
                                        <p className="text-sm text-slate-500 mb-2 italic">
                                             <EditableField
                                                isEditing={isEditing}
                                                value={activity.description}
                                                onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'description', e.target.value)}
                                            />
                                        </p>
                                        <div className="text-slate-600 text-sm p-3 bg-slate-50 rounded-md border border-slate-200/80">
                                            <EditableField
                                                isEditing={isEditing}
                                                value={activity.content}
                                                onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'content', e.target.value)}
                                            />
                                        </div>
                                    {/* ====================================================== */}
                                        {/* ✅ 이미지 프롬프트 아이디어를 여기에 표시합니다.         */}
                                        {/* ====================================================== */}
                                        {activity.imagePrompt && !isEditing && ( // 이미지 프롬프트가 있고, 수정 모드가 아닐 때만 표시
                                            <div className="mt-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 flex items-start gap-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>
                                                    <strong>이미지 아이디어:</strong> {activity.imagePrompt}
                                                </span>
                                            </div>
                                        )}
                                        {/* (만약 수정 모드(isEditing)일 때도 프롬프트를 보고 싶다면, !isEditing 조건을 제거하세요) */}

                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WorksheetDisplay;
