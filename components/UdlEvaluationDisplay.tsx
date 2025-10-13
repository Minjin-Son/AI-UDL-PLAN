import React from 'react';
import { UdlEvaluationPlan, EvaluationTask, EvaluationTaskLevel } from '../types';

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
  
  // ✅ CSS의 'whitespace-pre-wrap' 클래스를 사용하여, 텍스트에 포함된 줄바꿈 문자(\n)를
  // 화면에 그대로 표시하도록 개선합니다.
  return <p className={`whitespace-pre-wrap ${textClassName}`}>{value}</p>;
};


interface UdlEvaluationDisplayProps {
    plan: UdlEvaluationPlan;
    isEditing: boolean;
    onPlanChange: (updatedPlan: UdlEvaluationPlan) => void;
}

const UdlEvaluationDisplay: React.FC<UdlEvaluationDisplayProps> = ({ plan, isEditing, onPlanChange }) => {

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
                            textClassName="text-sm text-slate-600 mt-1 mb-3"
                        />
                        <div className="flex flex-wrap gap-2 mb-4">
                            {task.udlConnections.map((conn, connIndex) => (
                                <span key={connIndex} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full">
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
                                    <div className="space-y-3 text-sm">
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