import React from 'react';
import { GeneratedLessonPlan, UDLPrincipleSection, UDLStrategy, DetailedObjectives } from '../types';

// 자동 높이 조절 텍스트 영역 컴포넌트
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
        if (newPrinciples[principleIndex] && newPrinciples[principleIndex].strategies[strategyIndex]) {
            newPrinciples[principleIndex].strategies[strategyIndex][field] = value;
            onPlanChange({ ...plan, udlPrinciples: newPrinciples });
        }
    };

    // UDL 원칙의 *인덱스* 찾기
    const engagementPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("참여"));
    const representationPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("표상"));
    const actionPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("실행"));

    // 인덱스를 사용하여 전략 배열 가져오기
    const engagementStrategies = engagementPrincipleIndex > -1 ? plan.udlPrinciples[engagementPrincipleIndex].strategies : [];
    const representationStrategies = representationPrincipleIndex > -1 ? plan.udlPrinciples[representationPrincipleIndex].strategies : [];
    const actionStrategies = actionPrincipleIndex > -1 ? plan.udlPrinciples[actionPrincipleIndex].strategies : [];

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">보편적 학습 설계(UDL) 지도안</h2>
            <table className="udl-table w-full border-collapse">
                {/* [수정됨] colgroup을 5열에서 3열로 변경 */}
                <colgroup>
                    <col style={{ width: '10%' }} /> {/* 단계 */}
                    <col style={{ width: '22%' }} /> {/* 구분 */}
                    <col style={{ width: '68%' }} /> {/* 내용 */}
                </colgroup>
                <thead>
                    {/* [수정됨] header를 5열에서 3열로 변경 */}
                    <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-300 font-semibold">단계</th>
                        <th className="p-2 border border-slate-300 font-semibold">구분</th>
                        <th className="p-2 border border-slate-300 font-semibold">내용</th>
                    </tr>
                </thead>
                <tbody>
                    {/* [수정됨] 1단계 구조 변경: 1행 5열 -> 4행 3열 (rowSpan 사용) */}
                    <tr>
                        <td rowSpan={4} className="font-semibold align-middle text-center p-2 border border-slate-300">1단계<br />목표 확인 및<br />설정하기</td>
                        <td className="font-bold p-2 border border-slate-300 bg-slate-50">교육과정 성취기준</td>
                        <td className="align-top p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.achievementStandard || ''}
                                onChange={(e) => onPlanChange({ ...plan, achievementStandard: e.target.value })}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-bold p-2 border border-slate-300 bg-slate-50">전체</td>
                        <td className="align-top p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.detailedObjectives?.overall || ''}
                                onChange={(e) => handleObjectiveChange('overall', e.target.value)}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-bold p-2 border border-slate-300 bg-slate-50">일부</td>
                        <td className="align-top p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.detailedObjectives?.some || ''}
                                onChange={(e) => handleObjectiveChange('some', e.target.value)}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    <tr>
                        <td className="font-bold p-2 border border-slate-300 bg-slate-50">소수</td>
                        <td className="align-top p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.detailedObjectives?.few || ''}
                                onChange={(e) => handleObjectiveChange('few', e.target.value)}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    {/* [수정됨] 2단계: colSpan={3} 제거 */}
                    <tr>
                        <td rowSpan={2} className="font-semibold align-middle text-center p-2 border border-slate-300">2단계<br />상황 분석하기</td>
                        <td className="font-bold p-2 border border-slate-300">상황 분석하기</td>
                        <td className="p-2 border border-slate-300">
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
                        <td className="p-2 border border-slate-300">
                            <EditableField
                                isEditing={isEditing}
                                value={plan.learnerAnalysis || ''}
                                onChange={(e) => onPlanChange({ ...plan, learnerAnalysis: e.target.value })}
                                textClassName="text-sm"
                            />
                        </td>
                    </tr>
                    {/* [수정됨] 3단계: colSpan={4} -> colSpan={2} */}
                    <tr className="align-top">
                        <td className="font-semibold align-middle text-center p-2 border-r border-slate-300 w-1/4">
                            3단계<br />보편적 학습설계<br />원리 적용하기
                        </td>
                        <td colSpan={2} className="p-0 border border-t border-slate-300">
                            <table className="w-full inner-table">
                                <thead>
                                    <tr className="bg-slate-50">
                                        <th className="font-bold p-2 border-b border-r border-slate-300 w-1/3 text-left">{plan.udlPrinciples[engagementPrincipleIndex]?.principle || '참여의 원리'}</th>
                                        <th className="font-bold p-2 border-b border-r border-slate-300 w-1/3 text-left">{plan.udlPrinciples[representationPrincipleIndex]?.principle || '표상의 원리'}</th>
                                        <th className="font-bold p-2 border-b border-slate-300 w-1/3 text-left">{plan.udlPrinciples[actionPrincipleIndex]?.principle || '행동 및 표현의 원리'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="align-top p-2 border-r border-slate-300">
                                            {engagementStrategies.map((strat, index) => (
                                                <div key={index} className="mb-4 text-sm border-b border-slate-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">지침:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.guideline}
                                                            onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'guideline', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">전략:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.strategy}
                                                            onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'strategy', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">예시:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.example}
                                                            onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'example', e.target.value)}
                                                            className="text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="align-top p-2 border-r border-slate-300">
                                            {representationStrategies.map((strat, index) => (
                                                <div key={index} className="mb-4 text-sm border-b border-slate-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">지침:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.guideline}
                                                            onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'guideline', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">전략:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.strategy}
                                                            onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'strategy', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">예시:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.example}
                                                            onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'example', e.target.value)}
                                                            className="text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="align-top p-2">
                                            {actionStrategies.map((strat, index) => (
                                                <div key={index} className="mb-4 text-sm border-b border-slate-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">지침:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.guideline}
                                                            onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'guideline', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">전략:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.strategy}
                                                            onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'strategy', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">예시:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.example}
                                                            onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'example', e.target.value)}
                                                            className="text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                    {/* [수정됨] 4단계: colSpan={4} -> colSpan={2} */}
                    <tr>
                        <td className="font-semibold align-middle text-center p-2 border border-slate-300">4단계<br />보편적 학습설계<br />수업 구상하기</td>
                        <td colSpan={2} className="p-0 border border-slate-300">
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
                                                <div key={index} className="mb-4 text-sm border-b border-slate-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">지침:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.guideline}
                                                            onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'guideline', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">전략:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.strategy}
                                                            onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'strategy', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">예시:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.example}
                                                            onChange={(e) => handleStrategyChange(engagementPrincipleIndex, index, 'example', e.target.value)}
                                                            className="text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="align-top p-2 border-r border-slate-300">
                                            {representationStrategies.map((strat, index) => (
                                                <div key={index} className="mb-4 text-sm border-b border-slate-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">지침:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.guideline}
                                                            onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'guideline', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">전략:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.strategy}
                                                            onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'strategy', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">예시:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.example}
                                                            onChange={(e) => handleStrategyChange(representationPrincipleIndex, index, 'example', e.target.value)}
                                                            className="text-slate-900"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </td>
                                        <td className="align-top p-2">
                                            {actionStrategies.map((strat, index) => (
                                                <div key={index} className="mb-4 text-sm border-b border-slate-100 pb-2 last:border-0 last:mb-0 last:pb-0">
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">지침:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.guideline}
                                                            onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'guideline', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div className="mb-1">
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">전략:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.strategy}
                                                            onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'strategy', e.target.value)}
                                                            className="text-slate-700 bg-slate-50"
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="text-xs font-semibold text-indigo-600 block mb-0.5">예시:</span>
                                                        <EditableField
                                                            isEditing={isEditing}
                                                            value={strat.example}
                                                            onChange={(e) => handleStrategyChange(actionPrincipleIndex, index, 'example', e.target.value)}
                                                            className="text-slate-900"
                                                        />
                                                    </div>
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

