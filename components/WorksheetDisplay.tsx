import React, { useState, useCallback, useRef, useLayoutEffect } from 'react'; // ✅ useRef, useLayoutEffect 추가
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';
// ✅ import EditableField from './EditableField'; // EditableField import 제거됨
import { generateImageForActivity } from '../services/geminiService';

// ✅ --- AutoGrowTextarea와 EditableField 정의를 여기에 직접 추가 ---
interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoGrowTextarea: React.FC<AutoGrowTextareaProps> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
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
// ✅ --- EditableField 정의 끝 ---


interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean;
  onPlanChange: (updatedPlan: Worksheet) => void;
}

// ActivityItem 컴포넌트 (내부 로직은 이전과 동일)
const ActivityItem: React.FC<{
  activity: WorksheetActivity;
  levelIndex: number;
  activityIndex: number;
  isEditing: boolean;
  handleActivityChange: (levelIndex: number, activityIndex: number, field: keyof WorksheetActivity, value: string) => void;
}> = ({ activity, levelIndex, activityIndex, isEditing, handleActivityChange }) => {

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async () => {
    if (!activity.imagePrompt || isGeneratingImage) return;
    setIsGeneratingImage(true);
    setImageError(null);
    setImageUrl(null);
    try {
      const generatedImageUrl = await generateImageForActivity(
        activity.title,
        activity.content,
        activity.imagePrompt
      );
      setImageUrl(generatedImageUrl);
    } catch (err) {
      console.error("Image generation failed:", err);
      setImageError(err instanceof Error ? err.message : '이미지 생성 중 오류 발생');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [activity.title, activity.content, activity.imagePrompt, isGeneratingImage]);

  return (
    <div className="bg-white/50 p-4 rounded-md border border-slate-200/50 space-y-2">
      {/* EditableField 사용 유지 */}
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
      {/* 이미지 생성 및 표시 영역 유지 */}
      {!isEditing && activity.imagePrompt && (
        <div className="mt-3 space-y-2">
           {(imageUrl || isGeneratingImage || imageError) && (
            <div className="p-2 border rounded-md bg-slate-50 flex justify-center items-center min-h-[100px]">
              {isGeneratingImage && ( <div className="flex flex-col items-center text-slate-500"> {/* 로딩 */} </div> )}
              {imageError && !isGeneratingImage && ( <div className="text-center text-red-600 text-xs"> {/* 에러 */} </div> )}
              {imageUrl && !isGeneratingImage && !imageError && ( <img src={imageUrl} alt={activity.imagePrompt} className="max-w-full max-h-48 object-contain rounded" /> )}
            </div>
           )}
           {!imageUrl && !isGeneratingImage && ( <button onClick={handleGenerateImage} disabled={isGeneratingImage} className={`w-full ... ${isGeneratingImage ? 'opacity-75 cursor-wait' : ''}`}> {/* 생성 버튼 */} </button> )}
           <div className="p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 flex items-start gap-1.5"> {/* 아이디어 텍스트 */} </div>
        </div>
      )}
    </div>
  );
};


// WorksheetDisplay 컴포넌트 본체 (내부 로직은 이전과 동일)
const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing, onPlanChange }) => {

    const handleFieldChange = (field: keyof Worksheet, value: string) => { /* ... */ };
    const handleLevelChange = (levelIndex: number, field: keyof WorksheetLevel, value: string) => { /* ... */ };
    const handleActivityChange = (levelIndex: number, activityIndex: number, field: keyof WorksheetActivity, value: string) => { /* ... */ };
    const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = { /* ... */ };

    return (
        <div className="space-y-8">
            {/* 제목, 설명 EditableField 사용 유지 */}
             <div>
                <EditableField /* ... */ />
                <EditableField /* ... */ />
            </div>
            {/* 수준별 활동 표시 */}
            <div className="space-y-6">
                {plan.levels.map((level, levelIndex) => {
                    const colors = levelColors[level.levelName] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' };
                    return (
                        <div key={levelIndex} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                             {/* 레벨 이름, 제목 EditableField 사용 유지 */}
                             <div className="flex items-center gap-3 mb-4">
                               <span /* ... */> <EditableField /* ... */ /> </span>
                               <h4 /* ... */> <EditableField /* ... */ /> </h4>
                             </div>
                            {/* 활동 목록 */}
                            <div className="space-y-4">
                                {level.activities.map((activity, activityIndex) => (
                                    <ActivityItem
                                      key={activityIndex}
                                      activity={activity}
                                      isEditing={isEditing}
                                      handleActivityChange={handleActivityChange}
                                      levelIndex={levelIndex}
                                      activityIndex={activityIndex}
                                    />
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




