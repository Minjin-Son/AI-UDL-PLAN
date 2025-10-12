import React from 'react';
import { GeneratedLessonPlan, UDLPrincipleSection, UDLStrategy } from '../types';

// 텍스트 길이에 따라 자동으로 높이가 조절되는 Textarea
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

// 수정 모드와 보기 모드를 전환하는 컴포넌트
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
  // 줄바꿈 문자를 <br> 태그로 변환하여 P 태그 안에서 렌더링
  return (
    <p 
      className={textClassName}
      dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, '<br />') }}
    />
  );
};


// 메인 UDL 지도안 표시 컴포넌트 (표 형식으로 변경됨)
interface UDLDisplayProps {
  plan: GeneratedLessonPlan;
  isEditing: boolean;
  onPlanChange: (updatedPlan: GeneratedLessonPlan) => void;
}

const UDLDisplay: React.FC<UDLDisplayProps> = ({ plan, isEditing, onPlanChange }) => {

    // FIX 1: Add a guard clause to handle cases where 'plan' data is not yet available.
    // 지도안(plan) 데이터가 로드되기 전에 컴포넌트가 렌더링되는 것을 방지합니다.
    if (!plan) {
        return (
            <div className="p-6 text-center text-slate-500">
                지도안 데이터를 불러오는 중입니다...
            </div>
        );
    }

    // 데이터 변경을 위한 헬퍼 함수
    const handleFieldChange = (field: keyof GeneratedLessonPlan, value: any) => {
        onPlanChange({ ...plan, [field]: value });
    };

    const handlePrincipleStrategyChange = (principleIndex: number, strategyIndex: number, value: string) => {
        const newPrinciples = JSON.parse(JSON.stringify(plan.udlPrinciples));
        newPrinciples[principleIndex].strategies[strategyIndex].example = value;
        handleFieldChange('udlPrinciples', newPrinciples);
    };

    // 각 원리에 맞는 전략들을 찾아서 분리 (없을 경우 빈 배열)
    const engagementStrategies = plan.udlPrinciples.find(p => p.principle.includes("참여"))?.strategies || [];
    const representationStrategies = plan.udlPrinciples.find(p => p.principle.includes("표현"))?.strategies || [];
    const actionStrategies = plan.udlPrinciples.find(p => p.principle.includes("실행"))?.strategies || [];

    const engagementPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("참여"));
    const representationPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("표현"));
    const actionPrincipleIndex = plan.udlPrinciples.findIndex(p => p.principle.includes("실행"));

  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">보편적 학습 설계(UDL) 지도안</h2>
      <div className="overflow-x-auto">
        <table className="udl-table w-full min-w-[800px]">
          {/* 테이블 헤더 */}
          <thead>
            <tr className="bg-slate-50">
              <th colSpan={2}>교육과정 성취기준</th>
              <th>전체</th>
              <th>일부</th>
              <th>소수</th>
            </tr>
          </thead>
          <tbody>
            {/* 1단계 */}
            <tr>
              <td rowSpan={2} className="text-center font-semibold">1단계<br />목표 확인 및<br />설정하기</td>
              <td><EditableField isEditing={isEditing} value={plan.achievementStandard || ''} onChange={(e) => handleFieldChange('achievementStandard', e.target.value)} /></td>
              <td><EditableField isEditing={isEditing} value={plan.goalForAll || ''} onChange={(e) => handleFieldChange('goalForAll', e.target.value)} /></td>
              <td><EditableField isEditing={isEditing} value={plan.goalForSome || ''} onChange={(e) => handleFieldChange('goalForSome', e.target.value)} /></td>
              <td><EditableField isEditing={isEditing} value={plan.goalForFew || ''} onChange={(e) => handleFieldChange('goalForFew', e.target.value)} /></td>
            </tr>
            <tr>
              <td colSpan={4}>
                <p className="font-bold text-center mb-2">목표</p>
                {/* FIX 2: Add a fallback to prevent passing undefined to the 'value' prop. */}
                <EditableField isEditing={isEditing} value={plan.learningObjectives || ''} onChange={(e) => handleFieldChange('learningObjectives', e.target.value)} />
              </td>
            </tr>
            {/* 2단계 */}
            <tr>
              <td rowSpan={2} className="text-center font-semibold">2단계<br />상황 분석하기</td>
              <td className="font-bold">상황 분석하기</td>
              <td colSpan={3}><EditableField isEditing={isEditing} value={plan.contextAnalysis || ''} onChange={(e) => handleFieldChange('contextAnalysis', e.target.value)} /></td>
            </tr>
            <tr>
              <td className="font-bold">학습자 분석하기</td>
              <td colSpan={3}><EditableField isEditing={isEditing} value={plan.learnerAnalysis || ''} onChange={(e) => handleFieldChange('learnerAnalysis', e.target.value)} /></td>
            </tr>
            {/* 3단계 */}
            <tr>
              <td className="text-center font-semibold" rowSpan={plan.udlPrinciples.length + 1}>3단계<br/>보편적 학습설계<br/>원리 적용하기</td>
              <td className="font-bold" colSpan={4}>세가지 원리</td>
            </tr>
            {plan.udlPrinciples.map((principle, index) => (
              <tr key={index}>
                <td colSpan={4}>
                   <p className="font-bold">{principle.principle}</p>
                   {/* FIX 3: Add a fallback to prevent passing undefined to the 'value' prop. */}
                   <EditableField isEditing={isEditing} value={principle.description || ''} onChange={(e) => {
                       const newPrinciples = [...plan.udlPrinciples];
                       newPrinciples[index] = { ...newPrinciples[index], description: e.target.value };
                       handleFieldChange('udlPrinciples', newPrinciples);
                   }} />
                </td>
              </tr>
            ))}
            {/* 4단계 */}
            <tr>
              <td className="text-center font-semibold">4단계<br />보편적 학습설계<br />수업 구상하기</td>
              <td colSpan={4}>
                <table className="w-full inner-table">
                  <thead>
                    <tr>
                      <th className="font-bold">학습 참여 수단</th>
                      <th className="font-bold">표상 수단</th>
                      <th className="font-bold">행동과 표현 수단</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="align-top">
                        {engagementStrategies.map((strat, index) => (
                           <div key={index} className="mb-2"><EditableField isEditing={isEditing} value={strat.example} onChange={(e) => handlePrincipleStrategyChange(engagementPrincipleIndex, index, e.target.value)} /></div>
                        ))}
                      </td>
                      <td className="align-top">
                         {representationStrategies.map((strat, index) => (
                           <div key={index} className="mb-2"><EditableField isEditing={isEditing} value={strat.example} onChange={(e) => handlePrincipleStrategyChange(representationPrincipleIndex, index, e.target.value)} /></div>
                        ))}
                      </td>
                      <td className="align-top">
                        {actionStrategies.map((strat, index) => (
                           <div key={index} className="mb-2"><EditableField isEditing={isEditing} value={strat.example} onChange={(e) => handlePrincipleStrategyChange(actionPrincipleIndex, index, e.target.value)} /></div>
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
    </div>
  );
};

export default UDLDisplay;

