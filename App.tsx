import React, { useState, useCallback, useEffect, useRef } from 'react';
import { LessonPlanInputs, GeneratedLessonPlan } from './types';
import { GRADE_LEVELS, SUBJECTS, SEMESTERS } from './constants';
import { generateUDLLessonPlan, generateTableLessonPlan, generateLessonTopics, generateAchievementStandards, generateLearningObjective, generateWorksheet, generateUdlEvaluationPlan, generateProcessEvaluationWorksheet } from './services/geminiService';
import FormPanel from './components/FormPanel';
import DisplayPanel from './components/DisplayPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import SavedPlansPanel from './components/SavedPlansPanel';
import PrintPreview from './components/PrintPreview';

const App: React.FC = () => {
  const [lessonInputs, setLessonInputs] = useState<LessonPlanInputs>({
    gradeLevel: '초등학교 (3-4학년)',
    semester: '1학기',
    subject: '과학',
    topic: '물의 순환',
    unitName: '3. 액체와 기체',
    achievementStandards: '[4과04-02]물이 증발하고 끓을 때의 변화를 관찰하고, 물의 상태 변화가 우리 생활에 이용되는 예를 찾을 수 있다.',
    duration: '45분',
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
  
  const isGenerationCancelled = useRef(false);

  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [planToPrint, setPlanToPrint] = useState<GeneratedLessonPlan | null>(null);
  
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

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedPlan(null);
    setIsEditing(false);
    isGenerationCancelled.current = false;

    try {
      const plan = await generateUDLLessonPlan(lessonInputs);
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
      const tableResult = await generateTableLessonPlan(lessonInputs);
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
      const worksheetResult = await generateWorksheet(lessonInputs);
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
      const evaluationResult = await generateUdlEvaluationPlan(lessonInputs);
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
    if (!generatedPlan || isProcessEvaluationLoading || generatedPlan.processEvaluationWorksheet) {
      return;
    }

    const currentPlanInputs: LessonPlanInputs = {
        gradeLevel: generatedPlan.gradeLevel,
        semester: lessonInputs.semester,
        subject: generatedPlan.subject,
        topic: generatedPlan.tablePlan?.metadata.topic || generatedPlan.lessonTitle,
        duration: generatedPlan.tablePlan?.metadata.duration || '45분',
        objectives: generatedPlan.learningObjectives,
        unitName: lessonInputs.unitName,
        achievementStandards: lessonInputs.achievementStandards,
        specialNeeds: lessonInputs.specialNeeds,
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
      const objective = await generateLearningObjective(lessonInputs.gradeLevel, lessonInputs.semester, lessonInputs.subject, topic);
      setLessonInputs(prev => ({ ...prev, objectives: objective }));
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
              />
            </div>
          </div>
        </div>
      </main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
};

export default App;