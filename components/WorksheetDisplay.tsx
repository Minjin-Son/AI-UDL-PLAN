import React from 'react'; // ✅ useState, useCallback 등 불필요한 import 제거
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';
// ✅ import { generateImageForActivity } from '../services/geminiService'; // 이미지 생성 함수 import 제거

// ✅ WorksheetDisplayProps 인터페이스 - onPlanChange 제거됨
interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean; // isEditing prop은 유지 (링크 표시 여부에 사용)
}
// ✅ ActivityItem 컴포넌트 제거됨 - 로직을 WorksheetDisplay 안으로 통합

// --- WorksheetDisplay 컴포넌트 본체 ---
const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing }) => {

    // ✅ 핸들러 함수 제거됨

    // 색상 정의는 유지
    const levelColors: { [key: string]: { bg: string; border: string; text: string; } } = {
        '기본': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' },
        '보충': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
        '심화': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800' },
    };

    // ✅ Google 이미지 검색 URL 생성 함수 (컴포넌트 내부에 정의)
    const createGoogleImageSearchUrl = (query: string | undefined): string | null => {
        if (!query) return null;
        // 이미지 검색을 위한 URL 생성 (tbm=isch 파라미터 사용)
        return `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(query)}`;
    };


    return (
        <div className="space-y-8">
            {/* 제목, 설명 표시 (기본 태그 사용) */}
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
                             {/* 레벨 이름, 제목 표시 (기본 태그 사용) */}
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
                                  // ✅ 각 활동에 대한 검색 URL 생성
                                  const searchUrl = createGoogleImageSearchUrl(activity.imagePrompt);

                                  return (
                                    // ✅ ActivityItem 대신 직접 렌더링
                                    <div key={activityIndex} className="bg-white/50 p-4 rounded-md border border-slate-200/50 space-y-2">
                                      <h5 className="font-semibold text-slate-700">{activity.title}</h5>
                                      <p className="text-sm text-slate-500 italic">{activity.description}</p>
                                      <div className="text-slate-600 text-sm p-3 bg-slate-50 rounded-md border border-slate-200/80">
                                         <div style={{ whiteSpace: 'pre-wrap' }}>{activity.content}</div>
                                      </div>

                                      {/* --- 이미지 아이디어 및 검색 링크 표시 --- */}
                                      {!isEditing && activity.imagePrompt && searchUrl && (
                                        <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700 flex items-center gap-1.5">
                                           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                             <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                           </svg>
                                          <span>
                                            <strong>이미지 아이디어:</strong>{' '}
                                            {/* ✅ 텍스트를 클릭 가능한 검색 링크로 변경 */}
                                            <a
                                              href={searchUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                              title={`"${activity.imagePrompt}" Google 이미지 검색`}
                                            >
                                              "{activity.imagePrompt}" 검색하기
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 inline-block ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                 <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                              </svg>
                                            </a>
                                          </span>
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




