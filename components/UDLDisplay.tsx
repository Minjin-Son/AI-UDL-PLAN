import React from 'react';
import { GeneratedLessonPlan, UDLPrincipleSection, UDLStrategy } from '../types';

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
  return <p className={textClassName}>{value}</p>;
};

interface PrincipleCardProps {
    principle: UDLPrincipleSection;
    isEditing: boolean;
    onPrincipleChange: (updatedPrinciple: UDLPrincipleSection) => void;
}

const PrincipleCard: React.FC<PrincipleCardProps> = ({ principle, isEditing, onPrincipleChange }) => {
    const colorClasses: { [key: string]: string } = {
        "참여": "bg-teal-50 border-teal-200",
        "표현": "bg-sky-50 border-sky-200",
        "실행": "bg-purple-50 border-purple-200",
    }
    const titleColorClasses: { [key: string]: string } = {
        "참여": "text-teal-700",
        "표현": "text-sky-700",
        "실행": "text-purple-700",
    }

    let key = "";
    if (principle.principle.includes("참여")) key = "참여";
    else if (principle.principle.includes("표현 수단")) key = "표현";
    else if (principle.principle.includes("실행")) key = "실행";
    
    const bgColor = colorClasses[key] || "bg-slate-50 border-slate-200";
    const titleColor = titleColorClasses[key] || "text-slate-700";

    const handleStrategyChange = (strategyIndex: number, field: keyof UDLStrategy, value: string) => {
        const newStrategies = [...principle.strategies];
        newStrategies[strategyIndex] = { ...newStrategies[strategyIndex], [field]: value };
        onPrincipleChange({ ...principle, strategies: newStrategies });
    }

    return (
        <div className={`p-4 rounded-lg border ${bgColor}`}>
            <h3 className={`text-lg font-bold ${titleColor}`}>{principle.principle}</h3>
            <p className="text-sm italic text-slate-600 mb-4">{principle.description}</p>
            <div className="space-y-3">
                {principle.strategies.map((strat, index) => (
                    <div key={index}>
                         <EditableField
                            isEditing={isEditing}
                            value={strat.strategy}
                            onChange={(e) => handleStrategyChange(index, 'strategy', e.target.value)}
                            textClassName="font-semibold text-slate-700"
                        />
                        <p className="text-xs text-slate-500 mb-1">가이드라인: {strat.guideline}</p>
                         <EditableField
                            isEditing={isEditing}
                            value={strat.example}
                            onChange={(e) => handleStrategyChange(index, 'example', e.target.value)}
                            textClassName="text-sm text-slate-600 pl-2 border-l-2 border-slate-300"
                            className="text-sm"
                        />
                    </div>
                ))}
            </div>
        </div>
    )
};

interface UDLDisplayProps {
    plan: GeneratedLessonPlan;
    isEditing: boolean;
    onPlanChange: (updatedPlan: GeneratedLessonPlan) => void;
}

const UDLDisplay: React.FC<UDLDisplayProps> = ({ plan, isEditing, onPlanChange }) => {

    const handlePrincipleChange = (principleIndex: number, updatedPrinciple: UDLPrincipleSection) => {
        const newPrinciples = [...plan.udlPrinciples];
        newPrinciples[principleIndex] = updatedPrinciple;
        onPlanChange({ ...plan, udlPrinciples: newPrinciples });
    }
    
    const handleAssessmentMethodsChange = (methodIndex: number, value: string) => {
        const newMethods = [...plan.assessment.methods];
        newMethods[methodIndex] = value;
        onPlanChange({ ...plan, assessment: { ...plan.assessment, methods: newMethods } });
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">학습 목표</h3>
          <EditableField 
            isEditing={isEditing}
            value={plan.learningObjectives}
            onChange={(e) => onPlanChange({ ...plan, learningObjectives: e.target.value })}
            textClassName="text-slate-600"
          />
        </div>
        <div className="space-y-4">
          {plan.udlPrinciples.map((principle, index) => 
            <PrincipleCard 
                key={principle.principle} 
                principle={principle} 
                isEditing={isEditing}
                onPrincipleChange={(updatedPrinciple) => handlePrincipleChange(index, updatedPrinciple)}
            />
          )}
        </div>
        <div>
           <EditableField 
            isEditing={isEditing}
            value={plan.assessment.title}
            onChange={(e) => onPlanChange({ ...plan, assessment: { ...plan.assessment, title: e.target.value }})}
            textClassName="text-xl font-bold text-slate-800 mb-2"
          />
          <ul className="list-disc list-inside space-y-1 text-slate-600">
              {plan.assessment.methods.map((method, index) => (
                <li key={index}>
                    <EditableField
                        isEditing={isEditing}
                        value={method}
                        onChange={(e) => handleAssessmentMethodsChange(index, e.target.value)}
                        textClassName="inline"
                    />
                </li>
              ))}
          </ul>
        </div>
      </div>
    );
};

export default UDLDisplay;