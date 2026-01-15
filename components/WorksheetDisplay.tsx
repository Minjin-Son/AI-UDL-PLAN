import React, { useState } from 'react';
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';

interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean;
  fontSize?: number;
  fontFamily?: string;
}
const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing, fontSize, fontFamily }) => {
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  const contentTextSize = fontSize ? '' : 'text-base';
  const descTextSize = fontSize ? '' : 'text-sm';
  const tableBorderColor = "border-slate-300";
  const headerBgColor = "bg-orange-100";
  const headerTextColor = "text-slate-800";

  // ✅ [핵심 기능] AI 이미지 생성 요청 핸들러
  const handleGenerateImage = async (levelIndex: number, activityIndex: number, title: string, content: string, prompt?: string) => {
    const key = `${levelIndex}-${activityIndex}`;
    setLoadingImages(prev => ({ ...prev, [key]: true }));

    // ✅ 첫 번째 활동(index 0)인 경우 '활동지 자체' 생성 모드로 요청
    const isWorksheetMode = (activityIndex === 0);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          imagePrompt: prompt || title,
          isWorksheet: isWorksheetMode // API에 플래그 전달
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || '이미지 생성 실패');
      setGeneratedImages(prev => ({ ...prev, [key]: data.image }));
    } catch (error) {
      console.error(error);
      alert("이미지를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoadingImages(prev => ({ ...prev, [key]: false }));
    }
  };

  const renderActivityContent = (activity: WorksheetActivity, levelIndex: number, activityIndex: number) => {
    const imageKey = `${levelIndex}-${activityIndex}`;
    const hasImage = generatedImages[imageKey];
    const isLoading = loadingImages[imageKey];

    // 첫 번째 활동 여부 확인
    const isFirstActivity = (activityIndex === 0);

    switch (activity.type) {
      case 'table':
        return (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {activity.tableData?.headers.map((h, i) => (
                    <th key={i} className="border border-slate-300 p-2 text-center font-bold text-slate-700">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activity.tableData?.rows.map((row, rI) => (
                  <tr key={rI}>
                    {row.map((cell, cI) => (
                      <td key={cI} className="border border-slate-300 p-2 h-12 align-middle">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Fallback description if content exists */}
            {activity.content && <p className="text-xs text-slate-500 mt-2">※ {activity.content}</p>}

            {/* ✅ 첫 번째 활동이 Table 유형일 때도 활동지 이미지 생성 버튼 노출 */}
            {isFirstActivity && (
              <div className="mt-4 flex justify-center">
                {hasImage ? (
                  <div className="relative group">
                    <img src={hasImage} alt="AI Worksheet" className="max-w-md w-full rounded shadow-md border-2 border-orange-200" />
                    <button onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                      className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full text-xs hover:bg-white text-orange-600 shadow font-bold">↻ 다시 생성</button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm shadow-md flex items-center gap-2 font-bold transition-transform transform hover:scale-105"
                  >
                    {isLoading ? <span className="animate-spin">⌛</span> : <span>📄 이 문제의 활동지(이미지) 생성하기</span>}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'drawing':
        return (
          <div className="mt-4">
            <p className="mb-2 text-slate-700 font-medium">{activity.content}</p>
            <div
              className="w-full border-2 border-slate-300 rounded-lg bg-white shadow-inner flex items-center justify-center text-slate-400"
              style={{ height: activity.boxHeight ? `${activity.boxHeight}px` : '200px' }}
            >
              (이곳에 그림을 그리거나 내용을 작성하세요)
            </div>

            {/* ✅ 첫 번째 활동이 Drawing 유형일 때도 활동지 이미지 생성 버튼 노출 */}
            {isFirstActivity && (
              <div className="mt-4 flex justify-center">
                {hasImage ? (
                  <div className="relative group">
                    <img src={hasImage} alt="AI Worksheet" className="max-w-md w-full rounded shadow-md border-2 border-orange-200" />
                    <button onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                      className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full text-xs hover:bg-white text-orange-600 shadow font-bold">↻ 다시 생성</button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm shadow-md flex items-center gap-2 font-bold transition-transform transform hover:scale-105"
                  >
                    {isLoading ? <span className="animate-spin">⌛</span> : <span>📄 이 문제의 활동지(이미지) 생성하기</span>}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      case 'image_select':
        return (
          <div className="mt-4 flex flex-col gap-4">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700" style={{ whiteSpace: 'pre-wrap' }}>
              {activity.content}
            </div>
            {/* Image Gen UI: First Activity -> Worksheet Mode, Others -> Illustration Mode */}
            <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg ${isFirstActivity ? 'border-orange-200 bg-orange-50/30' : 'border-blue-200 bg-blue-50/30'}`}>
              {hasImage ? (
                <div className="relative group">
                  <img src={hasImage} alt={isFirstActivity ? "AI Worksheet" : "AI Generated"} className="max-w-full h-auto max-h-96 rounded shadow-md" />
                  <button onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                    className="absolute bottom-2 right-2 bg-white/80 p-1 rounded-full text-xs hover:bg-white text-blue-600 shadow-sm">↺</button>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-xs text-slate-500 mb-2">{activity.imagePrompt || (isFirstActivity ? "이 내용을 바탕으로 활동지 이미지 생성" : "삽화 생성 가능")}</p>
                  <button
                    onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                    disabled={isLoading}
                    className={`px-3 py-1.5 text-white rounded text-sm shadow-sm flex items-center gap-1 mx-auto ${isFirstActivity ? 'bg-orange-500 hover:bg-orange-600 font-bold' : 'bg-blue-500 hover:bg-blue-600'}`}
                  >
                    {isLoading ? <span className="animate-spin">⌛</span> : <span>{isFirstActivity ? "📄 활동지(이미지) 생성" : "🎨 AI 삽화 생성"}</span>}
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div className={`mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed text-slate-700 whitespace-pre-wrap ${contentTextSize}`}>
            {activity.content}
            {/* ✅ 첫 번째 활동이 Text 유형일 때도 활동지 이미지 생성 버튼 노출 */}
            {isFirstActivity && (
              <div className="mt-4 flex justify-center border-t border-slate-100 pt-3">
                {hasImage ? (
                  <div className="relative group">
                    <img src={hasImage} alt="AI Worksheet" className="max-w-md w-full rounded shadow-md border-2 border-orange-200" />
                    <button onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                      className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full text-xs hover:bg-white text-orange-600 shadow font-bold">↻ 다시 생성</button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleGenerateImage(levelIndex, activityIndex, activity.title, activity.content, activity.imagePrompt)}
                    disabled={isLoading}
                    className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm shadow-md flex items-center gap-2 font-bold transition-transform transform hover:scale-105"
                  >
                    {isLoading ? <span className="animate-spin">⌛</span> : <span>📄 이 문제의 활동지(이미지) 생성하기</span>}
                  </button>
                )}
              </div>
            )}
          </div>
        );
    }
  };


  return (
    <div className="space-y-8 font-sans" style={{ fontSize: fontSize ? `${fontSize}px` : undefined, fontFamily: fontFamily !== 'inherit' ? fontFamily : undefined }}>

      {/* 1. Header Table Section (Metadata) - Hidden by user request */}
      {/* 
      {plan.metadata && (
          <div className="border-2 border-orange-300 rounded-lg overflow-hidden shadow-sm">
             ... (hidden) ...
          </div>
      )} 
      */}


      {/* Main Title if not redundant */}
      <h2 className="text-3xl font-extrabold text-center text-slate-800 border-b-2 border-slate-200 pb-4 mb-8">
        {plan.title}
      </h2>

      {/* 2. Levels Loop */}
      <div className="space-y-12">
        {plan.levels.map((level, levelIndex) => (
          <div key={levelIndex} className="relative">
            {/* Level Badge/Separator */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm 
                        ${level.levelName === '기본' ? 'bg-green-100 text-green-700 border border-green-200' :
                  level.levelName === '보충' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                {level.levelName} 활동
              </span>
              <h3 className="text-xl font-bold text-slate-700">{level.title}</h3>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 gap-8"> {/* Could be 2 cols for print layout later */}
              {level.activities.map((activity, activityIndex) => (
                <div key={activityIndex} className="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                  {/* Activity Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                      {activityIndex + 1}
                    </span>
                    <div>
                      <h4 className="text-lg font-bold text-slate-800">{activity.title}</h4>
                      <p className={`${descTextSize} text-slate-500 mt-1`}>{activity.description}</p>
                    </div>
                  </div>

                  {/* Activity Content (Dynamic Rendering) */}
                  <div className="pl-11">
                    {renderActivityContent(activity, levelIndex, activityIndex)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorksheetDisplay;



