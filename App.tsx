import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LessonPlanInputs, GeneratedLessonPlan } from './types';
import { GRADE_LEVELS, SUBJECTS, SEMESTERS } from './constants';
// ✅ 기존 import 목록에 reviseUDLLessonPlan만 추가하고, generateFullCoursePlan은 제거합니다.
import {
  generateUDLLessonPlan,
  generateTableLessonPlan,
  generateLessonTopics,
  generateAchievementStandards,
  generateLearningObjectiveOptions,
  generateWorksheet,
  generateUdlEvaluationPlan,
  generateProcessEvaluationWorksheet,
  reviseUDLLessonPlan // ✅ 이 줄을 추가했습니다.
} from './services/geminiService';
import FormPanel from './components/FormPanel';
import DisplayPanel from './components/DisplayPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import SavedPlansPanel from './components/SavedPlansPanel';
import PrintPreview from './components/PrintPreview';

interface ObjectiveModalProps {
  options: string[];
  onSelect: (option: string) => void;
  onClose: () => void;
}
const ObjectiveModal: React.FC<ObjectiveModalProps> = ({ options, onSelect, onClose }) => (
  <div className="no-print" style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'white',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      border: '1px solid #ccc',
      padding: '24px',
      borderRadius: '12px',
      minWidth: '400px',
      maxWidth: '600px',
      maxHeight: '80vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <h3 style={{ marginTop: 0, borderBottom: '1px solid #eee', paddingBottom: '10px' }}>학습 목표 선택</h3>
      <p style={{ color: '#555', fontSize: '14px', marginTop: 0 }}>AI가 추천하는 {options.length}개의 목표입니다. 하나를 선택하세요.</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, overflowY: 'auto', flexGrow: 1 }}>
        {options.map((option, index) => (
          <li
            key={index}
            onClick={() => onSelect(option)}
            style={{ padding: '12px', border: '1px solid #eee', margin: '8px 0', cursor: 'pointer', borderRadius: '8px', transition: 'background-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f9f9f9')}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            {option}
          </li>
        ))}
      </ul>
      <button onClick={onClose} style={{ marginTop: '20px', width: '100%', padding: '10px', cursor: 'pointer' }}>닫기</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [lessonInputs, setLessonInputs] = useState<LessonPlanInputs>({
    gradeLevel: '초등학교 (4학년)',
    semester: '1학기',
    subject: '과학',
    topic: '물의 순환',
    unitName: '3. 액체와 기체',
    achievementStandards: '[4과04-02]물이 증발하고 끓을 때의 변화를 관찰하고, 물의 상태 변화가 우리 생활에 이용되는 예를 찾을 수 있다.',
    duration: '40분',
    objectives: '학생들은 물의 순환의 세 가지 주요 단계인 증발, 응결, 강수를 설명할 수 있다.',
    specialNeeds: '',
    studentCharacteristics: ''
  });
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedLessonPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<GeneratedLessonPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [isWorksheetLoading, setIsWorksheetLoading] = useState<boolean>(false);
  const [isUdlEvaluationLoading, setIsUdlEvaluationLoading] = useState<boolean>(false);
  const [isProcessEvaluationLoading, setIsProcessEvaluationLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([]);
  const [isTopicLoading, setIsTopicLoading] = useState<boolean>(false);
  const [topicError, setTopicError] = useState<string | null>(null);

  const [standardSuggestions, setStandardSuggestions] = useState<string[]>([]);
  const [isStandardLoading, setIsStandardLoading] = useState<boolean>(false);
  const [standardError, setStandardError] = useState<string | null>(null);

  const [isObjectiveLoading, setIsObjectiveLoading] = useState<boolean>(false);
  const [objectiveError, setObjectiveError] = useState<string | null>(null);
  const [isObjectiveModalOpen, setIsObjectiveModalOpen] = useState(false);
  const [objectiveSuggestions, setObjectiveSuggestions] = useState<string[]>([]);
  const isGenerationCancelled = useRef(false);

  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [planToPrint, setPlanToPrint] = useState<GeneratedLessonPlan | null>(null);
  const [isRevising, setIsRevising] = useState<boolean>(false); // 수정 로딩 상태는 유지

  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem('udl-saved-plans');
      if (storedPlans) {
        setSavedPlans(JSON.parse(storedPlans));
      }
    } catch (e) {
      console.error("Failed to load saved plans from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('udl-saved-plans', JSON.stringify(savedPlans));
    } catch (e) {
      console.error("Failed to save plans to localStorage", e);
    }
  }, [savedPlans]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLessonInputs(prev => ({ ...prev, [name]: value }));
    if (['gradeLevel', 'semester', 'subject', 'unitName'].includes(name)) {
      setTopicSuggestions([]);
      setTopicError(null);
      setStandardSuggestions([]);
      setStandardError(null);
      setObjectiveError(null);
    } else if (name === 'topic') {
      setObjectiveError(null);
    }
  }, []);

  // ✅ handleSubmit은 원래대로 generateUDLLessonPlan을 사용하도록 유지합니다.
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    setIsEditing(false);
    isGenerationCancelled.current = false;

    try {
      const plan = await generateUDLLessonPlan(lessonInputs); // ✅ 이 부분을 확인하세요.
      if (isGenerationCancelled.current) return;
      setGeneratedPlan(plan);
    } catch (err) {
      if (isGenerationCancelled.current) return;
      console.error(err);
      setError(err instanceof Error ? err.message : '예상치 못한 오류가 발생했습니다. 콘솔을 확인하고 다시 시도해 주세요.');
    } finally {
      if (isGenerationCancelled.current) return;
      setIsLoading(false);
    }
  }, [lessonInputs]);

  const handleCancelGeneration = useCallback(() => {
    isGenerationCancelled.current = true;
    setIsLoading(false);
    setIsRevising(false); // 수정 중 취소도 처리
  }, []);

  const handleSavePlan = useCallback(() => {
    if (!generatedPlan || generatedPlan.id) return;
    const newPlanToSave = {
      ...generatedPlan,
      id: `${generatedPlan.lessonTitle}-${Date.now()}`
    };
    setSavedPlans(prev => [newPlanToSave, ...prev]);
    setGeneratedPlan(newPlanToSave);
  }, [generatedPlan]);

  const handleDeletePlan = useCallback((idToDelete: string) => {
    setSavedPlans(prev => prev.filter(p => p.id !== idToDelete));
    if (generatedPlan?.id === idToDelete) {
      setGeneratedPlan(null);
      setIsEditing(false);
    }
  }, [generatedPlan]);

  const handleSelectPlan = useCallback((idToSelect: string) => {
    const plan = savedPlans.find(p => p.id === idToSelect);
    if (plan) {
      setError(null);
      setIsLoading(false);
      setIsRevising(false); // 다른 계획 선택 시 수정 로딩 해제
      setGeneratedPlan(plan);
      setIsEditing(false);
    }
  }, [savedPlans]);

  const handleGenerateTableView = useCallback(async () => {
    if (!generatedPlan || isTableLoading || generatedPlan.tablePlan) {
      return;
    }

    setIsTableLoading(true);
    setError(null);

    try {
      // ✅ 테이블 생성 시에는 lessonInputs 대신 generatedPlan의 정보를 사용하도록 수정
      const currentPlanInputs: LessonPlanInputs = {
        gradeLevel: generatedPlan.gradeLevel,
        semester: lessonInputs.semester, // 학기는 lessonInputs 사용
        subject: generatedPlan.subject,
        topic: generatedPlan.lessonTitle, // UDL 지도안 제목을 주제로 사용
        duration: lessonInputs.duration, // 수업 시간은 lessonInputs 사용
        objectives: generatedPlan.detailedObjectives.overall || lessonInputs.objectives,// [수정] objectives 가져오는 방식 변경
        unitName: lessonInputs.unitName,
        achievementStandards: generatedPlan.achievementStandard || lessonInputs.achievementStandards,
        specialNeeds: lessonInputs.specialNeeds,
        studentCharacteristics: lessonInputs.studentCharacteristics
      };
      const tableResult = await generateTableLessonPlan(currentPlanInputs); // ✅ 수정된 입력값 사용
      const updatedPlan = { ...generatedPlan, tablePlan: tableResult };

      setGeneratedPlan(updatedPlan);

      if (updatedPlan.id) {
        setSavedPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '표 형식 지도안을 생성하는 중 오류가 발생했습니다.');
    } finally {
      setIsTableLoading(false);
    }
  }, [generatedPlan, isTableLoading, lessonInputs]);

  const handleGenerateWorksheet = useCallback(async () => {
    if (!generatedPlan || isWorksheetLoading || generatedPlan.worksheet) {
      return;
    }

    setIsWorksheetLoading(true);
    setError(null);

    try {
      // ✅ 활동지 생성 시에도 generatedPlan의 정보를 우선 사용
      const currentPlanInputs: LessonPlanInputs = {
        gradeLevel: generatedPlan.gradeLevel,
        semester: lessonInputs.semester,
        subject: generatedPlan.subject,
        topic: generatedPlan.lessonTitle,
        duration: lessonInputs.duration,
        objectives: generatedPlan.detailedObjectives.overall || lessonInputs.objectives,// [수정] objectives 가져오는 방식 변경
        unitName: lessonInputs.unitName,
        achievementStandards: generatedPlan.achievementStandard || lessonInputs.achievementStandards,
        specialNeeds: lessonInputs.specialNeeds,
        studentCharacteristics: lessonInputs.studentCharacteristics
      };
      const worksheetResult = await generateWorksheet(currentPlanInputs); // ✅ 수정된 입력값 사용
      const updatedPlan = { ...generatedPlan, worksheet: worksheetResult };

      setGeneratedPlan(updatedPlan);

      if (updatedPlan.id) {
        setSavedPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '활동지를 생성하는 중 오류가 발생했습니다.');
    } finally {
      setIsWorksheetLoading(false);
    }
  }, [generatedPlan, isWorksheetLoading, lessonInputs]);

  const handleGenerateUdlEvaluation = useCallback(async () => {
    if (!generatedPlan || isUdlEvaluationLoading || generatedPlan.udlEvaluation) {
      return;
    }

    setIsUdlEvaluationLoading(true);
    setError(null);

    try {
      // ✅ UDL 평가 계획 생성 시에도 generatedPlan 정보 우선 사용
      const currentPlanInputs: LessonPlanInputs = {
        gradeLevel: generatedPlan.gradeLevel,
        semester: lessonInputs.semester,
        subject: generatedPlan.subject,
        topic: generatedPlan.lessonTitle,
        duration: lessonInputs.duration,
        objectives: generatedPlan.detailedObjectives.overall || lessonInputs.objectives,// [수정] objectives 가져오는 방식 변경
        unitName: lessonInputs.unitName,
        achievementStandards: generatedPlan.achievementStandard || lessonInputs.achievementStandards,
        specialNeeds: lessonInputs.specialNeeds,
        studentCharacteristics: lessonInputs.studentCharacteristics
      };
      const evaluationResult = await generateUdlEvaluationPlan(currentPlanInputs); // ✅ 수정된 입력값 사용
      const updatedPlan = { ...generatedPlan, udlEvaluation: evaluationResult };

      setGeneratedPlan(updatedPlan);

      if (updatedPlan.id) {
        setSavedPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'UDL 평가 계획을 생성하는 중 오류가 발생했습니다.');
    } finally {
      setIsUdlEvaluationLoading(false);
    }
  }, [generatedPlan, isUdlEvaluationLoading, lessonInputs]);

  const handleGenerateProcessEvaluation = useCallback(async () => {
    if (!generatedPlan || isProcessEvaluationLoading || generatedPlan.processEvaluationWorksheet || !generatedPlan.udlEvaluation) { // ✅ UDL 평가 계획이 있어야 생성 가능
      if (!generatedPlan?.udlEvaluation) {
        setError('과정중심평가지를 생성하려면 먼저 UDL 평가 계획을 생성해야 합니다.');
      }
      return;
    }

    const currentPlanInputs: LessonPlanInputs = {
      gradeLevel: generatedPlan.gradeLevel,
      semester: lessonInputs.semester,
      subject: generatedPlan.subject,
      // ✅ topic을 좀 더 명확하게 가져옵니다.
      topic: generatedPlan.lessonTitle,
      duration: lessonInputs.duration,
      objectives: generatedPlan.detailedObjectives.overall || lessonInputs.objectives, // [수정] objectives 가져오는 방식 변경
      unitName: lessonInputs.unitName,
      achievementStandards: generatedPlan.achievementStandard || lessonInputs.achievementStandards,
      specialNeeds: lessonInputs.specialNeeds,
      studentCharacteristics: lessonInputs.studentCharacteristics
    };

    setIsProcessEvaluationLoading(true);
    setError(null);

    try {
      const worksheetResult = await generateProcessEvaluationWorksheet(currentPlanInputs, generatedPlan.udlEvaluation);
      const updatedPlan = { ...generatedPlan, processEvaluationWorksheet: worksheetResult };

      setGeneratedPlan(updatedPlan);

      if (updatedPlan.id) {
        setSavedPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : '과정중심평가지를 생성하는 중 오류가 발생했습니다.');
    } finally {
      setIsProcessEvaluationLoading(false);
    }
  }, [generatedPlan, isProcessEvaluationLoading, lessonInputs]);

  const handleUpdatePlan = useCallback((updatedPlan: GeneratedLessonPlan) => {
    setGeneratedPlan(updatedPlan);
    if (updatedPlan.id) {
      setSavedPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    }
    setIsEditing(false);
  }, []);

  // ✅ '수정 요청' 처리 함수는 유지합니다.
  const handleRevisionRequest = useCallback(async (currentPlan: GeneratedLessonPlan, feedback: string) => {
    setIsRevising(true);
    setError(null);
    isGenerationCancelled.current = false;

    try {
      const revisedPlanResult = await reviseUDLLessonPlan(currentPlan, feedback);
      if (isGenerationCancelled.current) return;
      setGeneratedPlan(prevPlan => ({
        ...revisedPlanResult,
        id: prevPlan?.id
      }));
    } catch (err) {
      if (isGenerationCancelled.current) return;
      console.error("Error during revision:", err);
      setError(err instanceof Error ? err.message : '지도안 수정 중 오류가 발생했습니다.');
    } finally {
      if (isGenerationCancelled.current) return;
      setIsRevising(false);
    }
  }, []);

  const handleGenerateTopics = useCallback(async () => {
    if (!lessonInputs.gradeLevel || !lessonInputs.semester || !lessonInputs.subject || !lessonInputs.unitName) {
      return;
    }
    setIsTopicLoading(true);
    setTopicError(null);
    setTopicSuggestions([]);
    try {
      const topics = await generateLessonTopics(lessonInputs.gradeLevel, lessonInputs.semester, lessonInputs.subject, lessonInputs.unitName);
      setTopicSuggestions(topics);
    } catch (err) {
      setTopicError(err instanceof Error ? err.message : '주제 추천을 생성하는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsTopicLoading(false);
    }
  }, [lessonInputs.gradeLevel, lessonInputs.semester, lessonInputs.subject, lessonInputs.unitName]);

  const handleTopicSelect = useCallback(async (topic: string) => {
    setLessonInputs(prev => ({ ...prev, topic: topic, objectives: 'AI가 학습 목표를 생성 중입니다...' }));
    setTopicSuggestions([]);
    setTopicError(null);
    setObjectiveError(null);
    setIsObjectiveLoading(true);

    try {
      // 2. AI로부터 여러 개의 옵션을 받습니다.
      const options = await generateLearningObjectiveOptions(
        lessonInputs.gradeLevel,
        lessonInputs.semester,
        lessonInputs.subject,
        topic,
        lessonInputs.achievementStandards
      );

      if (isGenerationCancelled.current) return;

      // 3. 전체 옵션 목록을 state에 저장하여 UI에 목록으로 표시합니다.
      setObjectiveSuggestions(options);


    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '학습 목표를 생성하는 중 오류가 발생했습니다.';
      setObjectiveError(errorMessage);
      setLessonInputs(prev => ({ ...prev, objectives: '' }));
      console.error(err);
    } finally {
      setIsObjectiveLoading(false);
    }
  }, [lessonInputs.gradeLevel, lessonInputs.semester, lessonInputs.subject]);

  const handleGenerateStandards = useCallback(async () => {
    if (!lessonInputs.gradeLevel || !lessonInputs.semester || !lessonInputs.subject || !lessonInputs.unitName) {
      return;
    }
    setIsStandardLoading(true);
    setStandardError(null);
    setStandardSuggestions([]);
    try {
      const standards = await generateAchievementStandards(lessonInputs.gradeLevel, lessonInputs.semester, lessonInputs.subject, lessonInputs.unitName);
      setStandardSuggestions(standards);
    } catch (err) {
      setStandardError(err instanceof Error ? err.message : '성취기준 추천을 생성하는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsStandardLoading(false);
    }
  }, [lessonInputs.gradeLevel, lessonInputs.semester, lessonInputs.subject, lessonInputs.unitName]);

  const handleStandardToggle = useCallback((standard: string) => {
    setLessonInputs(prev => {
      const currentStandards = prev.achievementStandards.split('\n').filter(s => s.trim() !== '');
      const isSelected = currentStandards.includes(standard);

      const newStandards = isSelected
        ? currentStandards.filter(s => s !== standard)
        : [...currentStandards, standard];

      return { ...prev, achievementStandards: newStandards.join('\n') };
    });
  }, []);

  const handlePrint = useCallback((plan: GeneratedLessonPlan) => {
    setPlanToPrint(plan);
    setIsPrinting(true);
  }, []);

  // [추가 3] '학습 목표 추천' 버튼을 위한 새 핸들러
  const handleRecommendObjectives = useCallback(async () => {
    if (!lessonInputs.topic) {
      alert('먼저 수업 주제를 입력하거나 선택해주세요.');
      return;
    }

    setObjectiveError(null);
    setIsObjectiveLoading(true);

    try {
      const options = await generateLearningObjectiveOptions(
        lessonInputs.gradeLevel,
        lessonInputs.semester,
        lessonInputs.subject,
        lessonInputs.topic,
        lessonInputs.achievementStandards
      );

      if (options && options.length > 0) {
        setObjectiveSuggestions(options); // 모달에 표시할 옵션 설정
        setIsObjectiveModalOpen(true); // 모달 열기
      } else {
        throw new Error("AI가 추천 학습 목표를 반환하지 못했습니다.");
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '학습 목표를 생성하는 중 오류가 발생했습니다.';
      setObjectiveError(errorMessage);
      console.error(err);
    } finally {
      setIsObjectiveLoading(false);
    }
  }, [
    lessonInputs.gradeLevel,
    lessonInputs.semester,
    lessonInputs.subject,
    lessonInputs.topic,
    lessonInputs.achievementStandards
  ]);

  // [추가 4] 모달에서 항목 선택 시 호출될 핸들러
  const handleSelectObjectiveFromModal = (selectedObjective: string) => {
    setLessonInputs(prev => ({
      ...prev,
      objectives: selectedObjective // 선택한 목표로 폼 데이터 업데이트
    }));
    setIsObjectiveModalOpen(false); // 모달 닫기
    setObjectiveSuggestions([]); // 옵션 초기화
  };

  if (isPrinting && planToPrint) {
    return <PrintPreview
      plan={planToPrint}
      onClose={() => {
        setIsPrinting(false);
        setPlanToPrint(null);
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <div className="no-print">
        <Header />
      </div>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="no-print lg:col-span-2">
            <FormPanel
              lessonInputs={lessonInputs}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              gradeLevels={GRADE_LEVELS}
              semesters={SEMESTERS}
              subjects={SUBJECTS}
              onCancel={handleCancelGeneration}
              onGenerateTopics={handleGenerateTopics}
              isTopicLoading={isTopicLoading}
              topicSuggestions={topicSuggestions}
              onTopicSelect={handleTopicSelect}
              topicError={topicError}
              onGenerateStandards={handleGenerateStandards}
              isStandardLoading={isStandardLoading}
              standardSuggestions={standardSuggestions}
              onStandardToggle={handleStandardToggle}
              standardError={standardError}
              isObjectiveLoading={isObjectiveLoading}
              objectiveError={objectiveError}
              // [추가 5] '추천' 버튼 핸들러를 FormPanel로 전달
              onRecommendObjectives={handleRecommendObjectives}
            />
          </div>
          <div className="flex flex-col gap-8 lg:col-span-3">
            <div className="no-print">
              <SavedPlansPanel
                plans={savedPlans}
                onSelect={handleSelectPlan}
                onDelete={handleDeletePlan}
              />
            </div>
            <div className="printable-content-wrapper flex-grow">
              <DisplayPanel
                isLoading={isLoading}
                error={error}
                generatedPlan={generatedPlan}
                onSavePlan={handleSavePlan}
                isSaved={!!generatedPlan?.id}
                onGenerateTableView={handleGenerateTableView}
                isTableLoading={isTableLoading}
                onGenerateWorksheet={handleGenerateWorksheet}
                isWorksheetLoading={isWorksheetLoading}
                onGenerateUdlEvaluation={handleGenerateUdlEvaluation}
                isUdlEvaluationLoading={isUdlEvaluationLoading}
                onGenerateProcessEvaluation={handleGenerateProcessEvaluation}
                isProcessEvaluationLoading={isProcessEvaluationLoading}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                onUpdatePlan={handleUpdatePlan}
                onPrint={handlePrint}
                // ✅ 수정 요청 함수와 상태 전달 추가
                onRevisionRequest={handleRevisionRequest}
                isRevising={isRevising}
              />
            </div>
          </div>
        </div>
      </main>
      <div className="no-print">
        <Footer />
      </div>
      {/* [추가 6] 모달 렌더링 로직 */}
      {isObjectiveModalOpen && (
        <ObjectiveModal
          options={objectiveSuggestions}
          onSelect={handleSelectObjectiveFromModal}
          onClose={() => setIsObjectiveModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;