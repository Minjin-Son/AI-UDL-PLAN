import React from 'react';
import { GeneratedLessonPlan, UDLPrincipleSection, UDLStrategy, DetailedObjectives } from '../types';

// 자동 높이 조절 텍스트 영역 컴포넌트
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

// 수정 가능한 필드 컴포넌트
interface EditableFieldProps {
    isEditing: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    className?: string;
    textClassName?: string;
}
const EditableField: React.FC<EditableFieldProps> = ({ isEditing, value, onChange, className = '', textClassName = '' }) => {
    if (isEditing) {
        return <AutoGrowTextarea value={value} onChange={onChange} className={`w-full p-2 rounded-md bg-slate-50 border border-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none ${className}`} />;
    }
    // 'whitespace-pre-wrap' 클래스로 줄바꿈과 공백을 그대로 표시
    return <p className={`whitespace-pre-wrap ${textClassName}`}>{value}</p>;
};

// UDL 지도안 표시 메인 컴포넌트
interface UDLDisplayProps {
    plan: GeneratedLessonPlan;
    isEditing: boolean;
    onPlanChange: (updatedPlan: GeneratedLessonPlan) => void;
}

const UDLDisplay: React.FC<UDLDisplayProps> = ({ plan, isEditing, onPlanChange }) => {
    
    if (!plan || !plan.udlPrinciples) {
        return <div className="text-center p-8 bg-white rounded-lg shadow-md">지도안 데이터를 불러오는 중입니다...</div>;
    }
    
    // 세분화된 목표 객체 변경 핸들러
    const handleObjectiveChange = (field: keyof DetailedObjectives, value: string) => {
        const updatedObjectives = { ...plan.detailedObjectives, [field]: value };
        onPlanChange({ ...plan, detailedObjectives: updatedObjectives });
    };

    // UDL 원칙 내 전략 변경 핸들러
    const handleStrategyChange = (principleIndex: number, strategyIndex: number, field: keyof UDLStrategy, value: string) => {
        const newPrinciples = JSON.parse(JSON.stringify(plan.udlPrinciples)); // Deep copy to avoid mutation issues
        if(newPrinciples[principleIndex] && newPrinciples[principleIndex].strategies[strategyIndex]) {
            newPrinciples[principleIndex].strategies[strategyIndex][field] = value;
            onPlanChange({ ...plan, udlPrinciples: newPrinciples });
        }
    };
    
    // 4단계를 위한 전략 분리
    const engagementPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("참여"));
    const representationPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("표현"));
    const actionPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("실행"));

    const engagementStrategies = engagementPrincipleIndex > -1 ? plan.udlPrinciples[engagementPrincipleIndex].strategies : [];
    const representationStrategies = representationPrincipleIndex > -1 ? plan.udlPrinciples[representationPrincipleIndex].strategies : [];
    const actionStrategies = actionPrincipleIndex > -1 ? plan.udlPrinciples[actionPrincipleIndex].strategies : [];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">보편적 학습 설계(UDL) 지도안</h2>
            <table className="udl-table w-full border-collapse">
                <colgroup>
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '23%' }} />
                    <col style={{ width: '21.6%' }} />
                    <col style={{ width: '21.6%' }} />
                    <col style={{ width: '21.6%' }} />
                </colgroup>
                <thead>
                    <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-300 font-semibold">단계</th>
                        <th className="p-2 border border-slate-300 font-semibold">교육과정 성취기준</th>
                        <th className="p-2 border border-slate-300 font-semibold">전체</th>
                        <th className="p-2 border border-slate-300 font-semibold">일부</th>
                        <th className="p-2 border border-slate-300 font-semibold">소수</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 1단계 */}
                    <tr>
                        <td className="font-semibold align-middle text-center p-2 border border-slate-300">1단계<br />목표 확인 및<br />설정하기</td>
                        <td className="align-top p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.achievementStandard || ''}
                                onChange={(e) => onPlanChange({ ...plan, achievementStandard: e.target.value })}
                                textClassName="text-sm"
                            />
                        </td>
                        <td className="align-top p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.detailedObjectives?.overall || ''}
                                onChange={(e) => handleObjectiveChange('overall', e.target.value)}
                                textClassName="text-sm"
                            />
                        </td>
                        <td className="align-top p-2 border border-slate-300">
                             <EditableField
                                isEditing={isEditing}
                                value={plan.detailedObjectives?.some || ''}
                                onChange={(e) => handleObjectiveChange('some', e.target.value)}
                                textClassName="text-sm"
                            />
                        </td>
                        <td className="align-top p-2 border border-slate-300">
                             <EditableField
                                isEditing={isEditing}
                                value={plan.detailedObjectives?.few || ''}
                                onChange={(e) => handleObjectiveChange('few', e.target.value)}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    {/* 2단계 */}
                    <tr>
                        <td rowSpan={2} className="font-semibold align-middle text-center p-2 border border-slate-300">2단계<br />상황 분석하기</td>
                        <td className="font-bold p-2 border border-slate-300">상황 분석하기</td>
                        <td colSpan={3} className="p-2 border border-slate-300">
                            <EditableField 
                                isEditing={isEditing} 
                                value={plan.contextAnalysis || ''} 
                                onChange={(e) => onPlanChange({ ...plan, contextAnalysis: e.target.value })} 
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-bold p-2 border border-slate-300">학습자 분석하기</td>
                        <td colSpan={3} className="p-2 border border-slate-300">
                            <EditableField 
                                isEditing={isEditing} 
                                value={plan.learnerAnalysis || ''} 
                                onChange={(e) => onPlanChange({ ...plan, learnerAnalysis: e.target.value })}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    {/* 3단계 */}
                    <tr>
                         <td className="font-semibold align-middle text-center p-2 border border-slate-300" rowSpan={plan.udlPrinciples.length + 1}>3단계<br/>보편적 학습설계<br/>원리 적용하기</td>
                         <td className="font-bold p-2 border border-slate-300" colSpan={4}>세가지 원리</td>
                    </tr>
                    {plan.udlPrinciples.map((principle, pIndex) => (
                        <tr key={pIndex}>
                            <td colSpan={4} className="p-2 border border-slate-300">
                               <p className="font-bold">{principle.principle}</p>
                               <ul className="list-disc list-inside pl-4">
                               {principle.strategies.map((strat, sIndex) => (
                                   <li key={sIndex} className="text-sm mt-1">
                                       <strong>{strat.strategy}: </strong>
                                       <EditableField
                                           isEditing={isEditing}
                                           value={strat.example}
                                           onChange={(e) => handleStrategyChange(pIndex, sIndex, 'example', e.target.value)}
                                           textClassName="inline"
                                       />
                                   </li>
                               ))}
                               </ul>
                            </td>
                        </tr>
                    ))}
                    {/* 4단계 */}
                     <tr>
                        <td className="font-semibold align-middle text-center p-2 border border-slate-300">4단계<br />보편적 학습설계<br />수업 구상하기</td>
                        <td colSpan={4} className="p-0 border border-slate-300">
                           <table className="w-full inner-table">
                               <thead>
                                   <tr>
                                       <th className="font-bold p-2 border-b border-r border-slate-300 w-1/3">학습 참여 수단</th>
                                       <th className="font-bold p-2 border-b border-r border-slate-300 w-1/3">표상 수단</th>
                                       <th className="font-bold p-2 border-b border-slate-300 w-1/3">행동과 표현 수단</th>
                                   </tr>
                               </thead>
                               <tbody>
                                   <tr>
                                       <td className="align-top p-2 border-r border-slate-300">
                                           {engagementStrategies.map((strat, index) => (
                                               <div key={index} className="mb-2 text-sm">
                                                   <EditableField 
                                                      isEditing={isEditing} 
                                                      value={strat.example} 
                                                      onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'example', e.target.value)} 
                                                   />
                                               </div>
                                           ))}
                                       </td>
                                       <td className="align-top p-2 border-r border-slate-300">
                                           {representationStrategies.map((strat, index) => (
                                               <div key={index} className="mb-2 text-sm">
                                                   <EditableField 
                                                      isEditing={isEditing} 
                                                      value={strat.example} 
                                                      onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'example', e.target.value)} 
                                                   />
                                               </div>
                                           ))}
                                       </td>
                                       <td className="align-top p-2">
                                           {actionStrategies.map((strat, index) => (
                                               <div key={index} className="mb-2 text-sm">
                                                   <EditableField 
                                                      isEditing={isEditing} 
                                                      value={strat.example} 
                                                      onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'example', e.target.value)} 
                                                   />
                                               </div>
                                           ))}
                                       </td>
                                   </tr>
                               </tbody>
                           </table>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default UDLDisplay;
