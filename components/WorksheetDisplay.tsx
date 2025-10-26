import React, { useState, useCallback } from 'react';
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';
import { generateImageForActivity } from '../services/geminiService';

// ✅ EditableField 및 AutoGrowTextarea 정의 제거
/*
interface AutoGrowTextareaProps ...
const AutoGrowTextarea ...
interface EditableFieldProps ...
const EditableField ...
*/

interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean; // isEditing prop은 유지 (이미지 생성 버튼 표시 여부 등에 사용)
  // onPlanChange prop 제거 (편집 기능 없으므로)
  // onPlanChange: (updatedPlan: Worksheet) => void;
}

// ActivityItem 컴포넌트 수정: EditableField 대신 기본 태그 사용, handleActivityChange prop 제거
const ActivityItem: React.FC<{
  activity: WorksheetActivity;
  levelIndex: number; // key prop 등에 사용될 수 있으므로 유지
  activityIndex: number;
  isEditing: boolean;
  // handleActivityChange prop 제거
  // handleActivityChange: (levelIndex: number, activityIndex: number, field: keyof WorksheetActivity, value: string) => void;
}> = ({ activity, levelIndex, activityIndex, isEditing /* handleActivityChange 제거됨 */ }) => {

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleGenerateImage = useCallback(async () => {
    // 이미지 생성 로직은 그대로 유지
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
      {/* ✅ 활동 제목, 설명, 내용 표시를 기본 태그로 변경 */}
      <h5 className="font-semibold text-slate-700">{activity.title}</h5>
      <p className="text-sm text-slate-500 mb-2 italic">{activity.description}</p>
      <div className="text-slate-600 text-sm p-3 bg-slate-50 rounded-md border border-slate-200/80">
         {/* 내용 줄바꿈 처리를 위해 div 사용 */}
         <div style={{ whiteSpace: 'pre-wrap' }}>{activity.content}</div>
      </div>


      {/* --- 이미지 생성 및 표시 영역 (이 로직은 유지) --- */}
      {!isEditing && activity.imagePrompt && (
        <div className="mt-3 space-y-2">
           {/* 이미지 표시 영역 */}
           {(imageUrl || isGeneratingImage || imageError) && (
            <div className="p-2 border rounded-md bg-slate-50 flex justify-center items-center min-h-[100px]">
              {isGeneratingImage && (
                <div className="flex flex-col items-center text-slate-500">
                  <svg className="animate-spin h-6 w-6 text-indigo-500 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>이미지 생성 중...</span>
                </div>
              )}
              {imageError && !isGeneratingImage && (
                <div className="text-center text-red-600 text-xs">
                  <p>⚠️ 이미지 생성 실패:</p>
                  <p>{imageError}</p>
                </div>
              )}
              {imageUrl && !isGeneratingImage && !imageError && (
                <img src={imageUrl} alt={activity.imagePrompt} className="max-w-full max-h-48 object-contain rounded" />
              )}
            </div>
           )}
           {/* 생성 버튼 */}
           {!imageUrl && !isGeneratingImage && (
              <button
                 onClick={handleGenerateImage}
                 disabled={isGeneratingImage}
                 className={`w-full inline-flex justify-center items-center gap-1.5 px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition duration-150 ease-in-out ${isGeneratingImage ? 'opacity-75 cursor-wait' : ''}`}
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                   <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                 </svg>
                 {imageError ? '이미지 생성 재시도' : '그림 생성하기'}
               </button>
           )}
           {/* 이미지 아이디어 텍스트 */}
           <div className="p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
               </svg>
              <span>
                <strong>이미지 아이디어:</strong> {activity.imagePrompt}
              </span>
           </div>
        </div>
      )}
    </div>
  );
};


// --- WorksheetDisplay 컴포넌트 본체 ---
const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing, onPlanChange }) => {

    // ✅ 핸들러 함수 제거됨
    // const handleFieldChange = ...
    // const handleLevelChange = ...
    // const handleActivityChange = ...

    // 색상 정의는 유지
    const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
        '기본': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
        '보충': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
        '심화': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
    };

    return (
        <div className="space-y-8">
            {/* ✅ 제목, 설명 표시 (EditableField 없이 기본 태그 사용) */}
             <div>
                 <h2 className="text-2xl font-bold text-slate-800 mb-2">{plan.title}</h2>
                 <p className="text-slate-600">{plan.description}</p>
            </div>

            {/* --- 수준별 활동 표시 --- */}
            <div className="space-y-6">
                {plan.levels.map((level, levelIndex) => {
                    const colors = levelColors[level.levelName] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' };
                    return (
                        <div key={levelIndex} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
                             {/* ✅ 레벨 이름, 제목 표시 (EditableField 없이 기본 태그 사용) */}
                             <div className="flex items-center gap-3 mb-4">
                               <span className={`px-3 py-1 text-sm font-bold rounded-full ${colors.bg} border-2 ${colors.border} ${colors.text}`}>
                                     {level.levelName}
                               </span>
                               <h4 className={`text-lg font-bold ${colors.text}`}>
                                     {level.title}
                               </h4>
                             </div>

                            <div className="space-y-4">
                                {level.activities.map((activity, activityIndex) => (
                                    // ActivityItem 컴포넌트 호출 (handleActivityChange prop 제거)
                                    <ActivityItem
                                      key={activityIndex}
                                      activity={activity}
                                      isEditing={isEditing} // isEditing 전달 (이미지 버튼 표시에 사용)
                                      levelIndex={levelIndex}
                                      activityIndex={activityIndex}
                                      // handleActivityChange 제거됨
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


