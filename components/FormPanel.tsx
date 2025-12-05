import React from 'react';
import { LessonPlanInputs } from '../types';
import { SPECIAL_NEEDS_SUGGESTIONS } from '../constants';

interface FormPanelProps {
  lessonInputs: LessonPlanInputs;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  gradeLevels: string[];
  semesters: string[];
  subjects: string[];
  onCancel: () => void;
  onGenerateTopics: () => void;
  isTopicLoading: boolean;
  topicSuggestions: string[];
  onTopicSelect: (topic: string) => void;
  topicError: string | null;
  onGenerateStandards: () => void;
  isStandardLoading: boolean;
  standardSuggestions: string[];
  onStandardToggle: (standard: string) => void;
  standardError: string | null;
  isObjectiveLoading: boolean;
  objectiveError: string | null;
  onRecommendObjectives: () => void; // ✅ [추가 1] 이 prop을 App.tsx로부터 받습니다.
}

const FormField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    {children}
  </div>
);

const FormPanel: React.FC<FormPanelProps> = ({
  lessonInputs,
  handleInputChange,
  handleSubmit,
  isLoading,
  gradeLevels,
  semesters,
  subjects,
  onCancel,
  onGenerateTopics,
  isTopicLoading,
  topicSuggestions,
  onTopicSelect,
  topicError,
  onGenerateStandards,
  isStandardLoading,
  standardSuggestions,
  onStandardToggle,
  standardError,
  isObjectiveLoading,
  objectiveError,
  onRecommendObjectives, // ✅ [추가 2] prop을 구조 분해합니다.
}) => {

  const handleSuggestionClick = (suggestion: string) => {
    const currentNeeds = lessonInputs.specialNeeds || '';

    let newValue;
    const needsArray = currentNeeds.split(', ').filter(s => s.trim() !== '');

    if (!needsArray.includes(suggestion)) {
      needsArray.push(suggestion);
    }
    newValue = needsArray.join(', ');

    const event = {
      target: {
        name: 'specialNeeds',
        value: newValue,
      },
    } as React.ChangeEvent<HTMLTextAreaElement>;

    handleInputChange(event);
  };

  const canGenerate = !!(lessonInputs.gradeLevel && lessonInputs.subject && lessonInputs.unitName);
  const selectedStandards = lessonInputs.achievementStandards.split('\n').filter(s => s.trim() !== '');

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-4">수업 정보</h2>
      <p className="text-slate-500 mb-6 text-sm">UDL 기반 지도안을 생성하려면 아래 정보를 입력해 주세요.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="학년">
          <select
            name="gradeLevel"
            value={lessonInputs.gradeLevel}
            onChange={handleInputChange}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            {gradeLevels.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </FormField>

        <FormField label="학기">
          <select
            name="semester"
            value={lessonInputs.semester}
            onChange={handleInputChange}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            {semesters.map(term => <option key={term} value={term}>{term}</option>)}
          </select>
        </FormField>

        <FormField label="과목">
          <select
            name="subject"
            value={lessonInputs.subject}
            onChange={handleInputChange}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
          >
            {subjects.map(sub => <option key={sub} value={sub}>{sub}</option>)}
          </select>
        </FormField>

        <FormField label="단원명">
          <input
            type="text"
            name="unitName"
            value={lessonInputs.unitName}
            onChange={handleInputChange}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="예: 3. 자료와 정보"
          />
        </FormField>

        <FormField label="수업 주제">
          <div className="relative">
            <input
              type="text"
              name="topic"
              value={lessonInputs.topic}
              onChange={handleInputChange}
              className="w-full p-2 pr-20 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="추천받거나 직접 입력"
            />
            <button
              type="button"
              onClick={onGenerateTopics}
              disabled={!canGenerate || isTopicLoading || isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-indigo-200 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1"
              title="단원명에 맞는 주제 추천받기"
            >
              {isTopicLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8_0_018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '✨ 추천'
              )}
            </button>
          </div>

          {topicError && <p className="text-red-600 text-xs mt-2">{topicError}</p>}

          {topicSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <p className="text-xs text-slate-500 w-full">추천 주제:</p>
              {topicSuggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => onTopicSelect(suggestion)}
                  className="bg-indigo-50 text-indigo-800 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </FormField>

        <FormField label="성취기준">
          <div className="relative">
            <textarea
              name="achievementStandards"
              value={lessonInputs.achievementStandards}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 pr-20 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              placeholder="예: [6실02-04]여러 가지 감각을 활용하여 대상을 관찰하고 특징을 바탕으로 사실적으로 표현한다."
            />
            <button
              type="button"
              onClick={onGenerateStandards}
              disabled={!canGenerate || isStandardLoading || isLoading}
              className="absolute right-1 top-1.5 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-indigo-200 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1"
              title="단원명에 맞는 성취기준 추천받기"
            >
              {isStandardLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '✨ 추천'
              )}
            </button>
          </div>
          {standardError && <p className="text-red-600 text-xs mt-2">{standardError}</p>}

          {standardSuggestions.length > 0 && (
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-xs text-slate-500 w-full">추천 성취기준: (클릭하여 여러 개 선택)</p>
              {standardSuggestions.map(suggestion => {
                const isSelected = selectedStandards.includes(suggestion);
                return (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => onStandardToggle(suggestion)}
                    className={`text-left text-xs font-medium p-2 rounded-md transition-colors ${isSelected ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'}`}
                  >
                    {suggestion}
                  </button>
                );
              })}
            </div>
          )}
        </FormField>

        <FormField label="수업 시간">
          <input
            type="text"
            name="duration"
            value={lessonInputs.duration}
            onChange={handleInputChange}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="예: 40분"
          />
        </FormField>

        <FormField label="학습 목표">
          <div className="relative">
            <textarea
              name="objectives"
              value={lessonInputs.objectives}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 pr-20 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:text-slate-500"
              placeholder="추천 주제를 선택하거나 직접 입력"
              disabled={isObjectiveLoading}
            />
            {/* '추천' 버튼 코드 */}
            <button
              type="button"
              onClick={onRecommendObjectives} // App.tsx에서 받은 핸들러 연결
              disabled={!lessonInputs.topic || isObjectiveLoading || isLoading} // 주제가 있어야 활성화
              className="absolute right-1 top-1.5 bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1.5 rounded-md hover:bg-indigo-200 transition-colors disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center gap-1"
              title="수업 주제에 맞는 학습 목표 추천받기"
            >
              {isObjectiveLoading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                '✨ 추천'
              )}
            </button>
          </div>
          {objectiveError && <p className="text-red-600 text-xs mt-2">{objectiveError}</p>}
        </FormField>

        <FormField label="특수교육대상자 하위 유형 (선택)">
          <textarea
            name="specialNeeds"
            value={lessonInputs.specialNeeds}
            onChange={handleInputChange}
            rows={2}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="예: 경계선 지능 학생, 읽기 부진 학생"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {SPECIAL_NEEDS_SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-1 rounded-full hover:bg-indigo-200 transition-colors"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="우리 반 학생들의 전체적인 특성 및 특수교육대상자의 특성(선택)">
          <textarea
            name="studentCharacteristics"
            value={lessonInputs.studentCharacteristics}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            placeholder="예: (전체) 학습 동기가 높으나 수학에 대한 자신감이 부족함. (특수) A학생은 시각 자료에 강점이 있으나 긴 문장 읽기에 어려움이 있음."
          />
          <p className="text-xs text-slate-500 mt-1">학급의 전반적인 분위기나 학생들의 특성(강점, 약점, 흥미)을 구체적으로 작성하면 더 맞춤화된 지도안이 생성됩니다.</p>
        </FormField>

        {isLoading ? (
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300 flex items-center justify-center"
          >
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="http://www.w3.org/2000/svg">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            생성 중지하기
          </button>
        ) : (
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300 flex items-center justify-center"
          >
            ✨ 지도안 생성하기
          </button>
        )}
      </form>
    </div>
  );
};

export default FormPanel;
