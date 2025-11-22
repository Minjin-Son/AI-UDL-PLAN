import React, { useState } from 'react';
import { Worksheet } from '../types';

interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean;
}

const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing }) => {
  
  // ✅ [추가] 생성된 이미지들을 저장하는 상태 (키: "levelIndex-activityIndex")
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});
  // ✅ [추가] 로딩 중인 상태를 추적하는 상태
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
    '기본': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
    '보충': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
    '심화': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
  };

  const createGoogleImageSearchUrl = (query: string | undefined): string | null => {
    if (!query) return null;
    return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
  };

  // ✅ [핵심 기능] 이미지 생성 핸들러
  const handleGenerateImage = async (levelIndex: number, activityIndex: number, title: string, content: string, prompt?: string) => {
    const key = `${levelIndex}-${activityIndex}`;
    
    // 로딩 시작
    setLoadingImages(prev => ({ ...prev, [key]: true }));

    try {
      // 1단계에서 만든 API 호출
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title, 
            content, 
            imagePrompt: prompt || title // 프롬프트 없으면 제목 사용
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || '이미지 생성 실패');

      // 성공 시 이미지 저장
      setGeneratedImages(prev => ({ ...prev, [key]: data.image }));
    } catch (error) {
      alert("이미지를 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      console.error(error);
    } finally {
      // 로딩 종료
      setLoadingImages(prev => ({ ...prev, [key]: false }));
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
            <div key={levelIndex} className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}>
              {/* 레벨 뱃지 & 제목 */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-3 py-1 text-sm font-bold rounded-full ${colors.bg} border-2 ${colors.border} ${colors.text}`}>
                  {level.levelName}
                </span>
                <h4 className={`text-lg font-bold ${colors.text}`}>
                  {level.title}
                </h4>
              </div>

              <div className="space-y-4">
                {level.activities.map((activity, activityIndex) => {
                  const searchUrl = createGoogleImageSearchUrl(activity.imagePrompt);
                  const imageKey = `${levelIndex}-${activityIndex}`;
                  const hasImage = generatedImages[imageKey];
                  const isLoading = loadingImages[imageKey];

                  return (
                    <div key={activityIndex} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 transition-all hover:shadow-md">
                      
                      {/* 1. 활동 텍스트 영역 */}
                      <div>
                        <h5 className="font-bold text-lg text-slate-800 mb-1">{activity.title}</h5>
                        <p className="text-sm text-slate-500 mb-3">{activity.description}</p>
                        <div className="text-slate-700 text-base p-4 bg-slate-50 rounded-lg border border-slate-100 leading-relaxed">
                          <div style={{ whiteSpace: 'pre-wrap' }}>{activity.content}</div>
                        </div>
                      </div>

                      {/* 2. AI 이미지 생성 영역 (UDL 시각화) */}
                      <div className="border-t border-slate-100 pt-4">
                        {hasImage ? (
                          // 이미지가 생성된 경우
                          <div className="relative group">
                            <img 
                              src={hasImage} 
                              alt={activity.title} 
                              className="w-full max-w-md mx-auto rounded-lg shadow-md border border-slate-200"
                            />
                            <div className="mt-2 text-center text-xs text-slate-400">
                              ✨ AI가 생성한 맞춤형 삽화입니다.
                            </div>
                          </div>
                        ) : (
                          // 이미지가 없는 경우 (생성 버튼 표시)
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100 border-dashed">
                             <div className="text-sm text-slate-600 flex items-center gap-2">
                                <span className="text-xl">🎨</span>
                                <span>
                                    <strong>시각 자료가 필요한가요?</strong>
                                    <span className="block text-xs text-slate-400">AI가 활동 내용에 맞는 그림을 그려줍니다.</span>
                                </span>
                             </div>
                             
                             <button
                                onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                                disabled={isLoading}
                                className={`px-4 py-2 rounded-md text-sm font-semibold shadow-sm transition-all flex items-center gap-2
                                  ${isLoading 
                                    ? 'bg-slate-100 text-slate-400 cursor-wait' 
                                    : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300'
                                  }`}
                             >
                                {isLoading ? (
                                  <>
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    그리는 중...
                                  </>
                                ) : (
                                  <>✨ AI 삽화 생성하기</>
                                )}
                             </button>
                          </div>
                        )}
                      </div>

                      {/* 3. 기존 구글 검색 링크 (보조 수단) */}
                      {!isEditing && activity.imagePrompt && searchUrl && !hasImage && (
                        <div className="flex justify-end">
                            <a
                              href={searchUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-slate-400 hover:text-blue-600 hover:underline flex items-center gap-1 transition-colors"
                            >
                              Google 이미지 검색으로 찾기
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                        </div>
                      )}
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




