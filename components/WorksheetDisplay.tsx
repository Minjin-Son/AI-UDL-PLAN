import React, { useState, useCallback } from 'react';
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';
// ✅ EditableField import 제거됨
import { generateImageForActivity } from '../services/geminiService'; // ✅ 이미지 생성 함수 import

// ✅ WorksheetDisplayProps 인터페이스 - isEditing, onPlanChange 유지 (향후 확장 대비)
interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean; // 보기/수정 모드 구분 (이미지 버튼 표시에 사용)
  onPlanChange: (updatedPlan: Worksheet) => void; // 향후 다른 편집 기능 추가될 수 있으므로 유지
}

// ✅ 각 활동 항목을 렌더링하는 내부 컴포넌트
const ActivityItem: React.FC<{
  activity: WorksheetActivity;
  isEditing: boolean; // 이미지 생성 버튼 표시 여부에 사용
}> = ({ activity, isEditing }) => {

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // 이미지 생성 버튼 클릭 핸들러
  const handleGenerateImage = useCallback(async () => {
    if (!activity.imagePrompt || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setImageError(null);
    setImageUrl(null);

    try {
      const generatedImageUrl = await generateImageForActivity(activity.imagePrompt);
      setImageUrl(generatedImageUrl);
    } catch (err) {
      console.error("Image generation failed:", err);
      setImageError(err instanceof Error ? err.message : '이미지 생성 중 오류 발생');
    } finally {
      setIsGeneratingImage(false);
    }
  }, [activity.imagePrompt, isGeneratingImage]);

  return (
    <div className="bg-white/50 p-4 rounded-md border border-slate-200/50 space-y-2">
      {/* ✅ EditableField 대신 기본 태그로 텍스트 표시 */}
      <h5 className="font-semibold text-slate-700">{activity.title}</h5>
      <p className="text-sm text-slate-500 italic">{activity.description}</p>
      <div className="text-slate-600 text-sm p-3 bg-slate-50 rounded-md border border-slate-200/80">
        {/* 내용이 여러 줄일 수 있으므로 white-space 스타일 추가 */}
        <div style={{ whiteSpace: 'pre-wrap' }}>{activity.content}</div>
      </div>

      {/* --- 이미지 생성 및 표시 영역 --- */}
      {!isEditing && activity.imagePrompt && (
        <div className="mt-3 space-y-2">
          {/* 이미지 표시 영역 */}
          {(imageUrl || isGeneratingImage || imageError) && (
            <div className="p-2 border rounded-md bg-slate-50 flex justify-center items-center min-h-[100px]">
              {isGeneratingImage && (
                <div className="flex flex-col items-center text-slate-500">
                  <svg className="animate-spin h-6 w-6 text-indigo-500 mb-2" /* ... 로딩 아이콘 ... */>
                    {/* ... path ... */}
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
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" /* ... 아이콘 ... */>
                 {/* ... path ... */}
               </svg>
               {imageError ? '이미지 생성 재시도' : '그림 생성하기'}
             </button>
          )}
          {/* 이미지 아이디어 텍스트 */}
           <div className="p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 flex items-start gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" /* ... 아이콘 ... */>
                {/* ... path ... */}
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

    // 색상 정의는 유지
    const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
        '기본': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
        '보충': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
        '심화': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
    };

    return (
        <div className="space-y-8">
            {/* ✅ 제목, 설명 표시 (EditableField 없이) */}
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
                             {/* ✅ 레벨 이름, 제목 표시 (EditableField 없이) */}
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
                                    // ActivityItem 컴포넌트 호출
                                    <ActivityItem
                                      key={activityIndex}
                                      activity={activity}
                                      isEditing={isEditing} // isEditing 전달 (이미지 버튼 표시에 사용)
                                      // handleActivityChange prop 제거됨
                                      levelIndex={levelIndex} // key 외에는 필요 없지만 유지
                                      activityIndex={activityIndex} // key 외에는 필요 없지만 유지
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
