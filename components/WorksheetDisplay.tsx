import React, { useState } from 'react';
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';

interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean;
}
const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing }) => {
  
  // ✅ [상태 관리] 생성된 이미지와 로딩 상태를 저장
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
    '기본': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    '보충': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    '심화': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
  };

  // 구글 이미지 검색 URL 생성 (보조용)
  const createGoogleImageSearchUrl = (query: string | undefined): string | null => {
    if (!query) return null;
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  };

  // ✅ [핵심 기능] AI 이미지 생성 요청 핸들러
  const handleGenerateImage = async (levelIndex: number, activityIndex: number, title: string, content: string, prompt?: string) => {
    const key = `${levelIndex}-${activityIndex}`;
    setLoadingImages(prev => ({ ...prev, [key]: true })); // 로딩 시작

    try {
      // 아까 만든 백엔드 API 호출
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title, 
            content, 
            imagePrompt: prompt || title 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || '이미지 생성 실패');

      // 성공 시 이미지 저장 (Base64)
      setGeneratedImages(prev => ({ ...prev, [key]: data.image }));
    } catch (error) {
      console.error(error);
      alert("이미지를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoadingImages(prev => ({ ...prev, [key]: false })); // 로딩 끝
    }
  };

  return (
    <div className="space-y-8">
      {/* 제목 및 설명 */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">{plan.title}</h2>
        <p className="text-slate-600">{plan.description}</p>
      </div>

      {/* 수준별 활동 루프 */}
      <div className="space-y-6">
        {plan.levels.map((level, levelIndex) => {
          const colors = levelColors[level.levelName] || { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800' };
          
          return (
            <div key={levelIndex} className={`p-5 rounded-xl border ${colors.bg} ${colors.border}`}>
              {/* 레벨 뱃지 & 제목 */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${colors.bg} border-2 ${colors.border} ${colors.text}`}>
                  {level.levelName}
                </span>
                <h4 className={`text-lg font-bold ${colors.text}`}>
                  {level.title}
                </h4>
              </div>

              <div className="space-y-6">
                {level.activities.map((activity, activityIndex) => {
                  const searchUrl = createGoogleImageSearchUrl(activity.imagePrompt);
                  const imageKey = `${levelIndex}-${activityIndex}`;
                  const hasImage = generatedImages[imageKey];
                  const isLoading = loadingImages[imageKey];

                  return (
                    <div key={activityIndex} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      
                      {/* 1. 활동 텍스트 영역 */}
                      <div className="mb-4">
                        <h5 className="font-bold text-lg text-slate-800 mb-2 flex items-center gap-2">
                           <span className="text-blue-500 text-sm">●</span> {activity.title}
                        </h5>
                        <p className="text-sm text-slate-500 mb-3 ml-4">{activity.description}</p>
                        
                        {/* 문제/지문 박스 */}
                        <div className="ml-4 text-slate-700 text-base p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed">
                          <div style={{ whiteSpace: 'pre-wrap' }}>{activity.content}</div>
                        </div>
                      </div>

                      {/* 2. ✅ AI 이미지 생성 및 표시 영역 */}
                      <div className="ml-4 mt-4 border-t border-slate-100 pt-4">
                        {hasImage ? (
                          // (A) 이미지가 생성된 경우
                          <div className="relative group animate-fade-in">
                            <img 
                              src={hasImage} 
                              alt={activity.title} 
                              className="w-full max-w-md rounded-lg shadow-md border border-slate-200"
                            />
                            <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-slate-400">✨ AI가 생성한 맞춤형 삽화</span>
                                <button 
                                    onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                                    className="text-xs text-blue-400 hover:text-blue-600 underline"
                                    title="마음에 안 들면 다시 생성할 수 있습니다."
                                >
                                    다시 그리기 ↻
                                </button>
                            </div>
                          </div>
                        ) : (
                          // (B) 이미지가 없는 경우 (생성 버튼)
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 border-dashed">
                             <div className="flex flex-col">
                                <div className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <span>🎨 시각 자료 생성</span>
                                </div>
                                <span className="text-xs text-slate-500 mt-1">
                                    "{activity.imagePrompt || activity.title}" 관련 그림 그리기
                                </span>
                             </div>
                             
                             <div className="flex items-center gap-2">
                                {/* 구글 검색 (보조) */}
                                {searchUrl && (
                                    <a href={searchUrl} target="_blank" rel="noopener noreferrer" 
                                       className="px-3 py-2 text-xs font-medium text-slate-500 bg-white border border-slate-200 rounded hover:bg-slate-50">
                                        Google 검색
                                    </a>
                                )}
                                
                                {/* 생성 버튼 */}
                                <button
                                    onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                                    disabled={isLoading}
                                    className={`px-4 py-2 rounded text-sm font-bold shadow-sm flex items-center gap-2 transition-all
                                    ${isLoading 
                                        ? 'bg-slate-100 text-slate-400 cursor-wait border border-slate-200' 
                                        : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                                    }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            그리는 중...
                                        </>
                                    ) : (
                                        <>✨ AI 삽화 생성</>
                                    )}
                                </button>
                             </div>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorksheetDisplay;




