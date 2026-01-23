import React, { useState, useRef, useLayoutEffect } from 'react';
import { Worksheet, WorksheetLevel, WorksheetActivity } from '../types';

interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

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
  placeholder?: string;
}

const EditableField: React.FC<EditableFieldProps> = ({ isEditing, value, onChange, multiline = true, className = '', textClassName = '', placeholder = '' }) => {
  if (isEditing) {
    const commonProps = {
      value,
      onChange,
      placeholder,
      className: `w-full p-1 rounded-md bg-orange-50 border border-orange-200 focus:ring-1 focus:ring-orange-500 focus:outline-none resize-none ${className}`,
    };
    return multiline ? <AutoGrowTextarea {...commonProps} /> : <textarea {...commonProps} rows={1} />;
  }
  return <div className={textClassName}>{value || placeholder}</div>;
};

interface WorksheetDisplayProps {
  plan: Worksheet;
  isEditing: boolean;
  onPlanChange: (updatedPlan: Worksheet) => void;
  fontSize?: number;
  fontFamily?: string;
}

const WorksheetDisplay: React.FC<WorksheetDisplayProps> = ({ plan, isEditing, onPlanChange, fontSize, fontFamily }) => {
  const [generatedImages, setGeneratedImages] = useState<{ [key: string]: string }>({});
  const [loadingImages, setLoadingImages] = useState<{ [key: string]: boolean }>({});

  const contentTextSize = fontSize ? '' : 'text-base';
  const descTextSize = fontSize ? '' : 'text-sm';

  // --- Change Handlers ---
  const handleFieldChange = (field: keyof Worksheet, value: any) => {
    onPlanChange({ ...plan, [field]: value });
  };

  const handleMetadataChange = (field: keyof Worksheet['metadata'], value: any) => {
    onPlanChange({ ...plan, metadata: { ...plan.metadata, [field]: value } });
  };

  const handleLevelChange = (levelIndex: number, field: keyof WorksheetLevel, value: any) => {
    const newLevels = [...plan.levels];
    newLevels[levelIndex] = { ...newLevels[levelIndex], [field]: value };
    onPlanChange({ ...plan, levels: newLevels });
  };

  const handleActivityChange = (levelIndex: number, activityIndex: number, field: keyof WorksheetActivity, value: any) => {
    const newLevels = [...plan.levels];
    const newActivities = [...newLevels[levelIndex].activities];
    newActivities[activityIndex] = { ...newActivities[activityIndex], [field]: value };
    newLevels[levelIndex] = { ...newLevels[levelIndex], activities: newActivities };
    onPlanChange({ ...plan, levels: newLevels });
  };

  const handleTableDataChange = (levelIndex: number, activityIndex: number, newTableData: any) => {
    const newLevels = [...plan.levels];
    const newActivities = [...newLevels[levelIndex].activities];
    newActivities[activityIndex] = { ...newActivities[activityIndex], tableData: newTableData };
    newLevels[levelIndex] = { ...newLevels[levelIndex], activities: newActivities };
    onPlanChange({ ...plan, levels: newLevels });
  };

  // ✅ [핵심 기능] AI 이미지 생성 요청 핸들러
  const handleGenerateImage = async (levelIndex: number, activityIndex: number, title: string, content: string, prompt?: string) => {
    const key = `${levelIndex}-${activityIndex}`;
    setLoadingImages(prev => ({ ...prev, [key]: true }));
    const isWorksheetMode = (activityIndex === 0);

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          imagePrompt: prompt || title,
          isWorksheet: isWorksheetMode
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
    const isFirstActivity = (activityIndex === 0);

    // Common Image Generation Button Component
    const ImageGenButton = () => (
      <div className="mt-4 flex justify-center no-print">
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
    );

    switch (activity.type) {
      case 'table':
        return (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full border-collapse border border-slate-300 text-sm">
              <thead>
                <tr className="bg-slate-50">
                  {activity.tableData?.headers.map((h, i) => (
                    <th key={i} className="border border-slate-300 p-2 text-center font-bold text-slate-700 min-w-[100px]">
                      <EditableField
                        isEditing={isEditing}
                        value={h}
                        onChange={(e) => {
                          const newHeaders = [...(activity.tableData?.headers || [])];
                          newHeaders[i] = e.target.value;
                          handleTableDataChange(levelIndex, activityIndex, { ...activity.tableData, headers: newHeaders });
                        }}
                        multiline={false}
                        textClassName="font-bold"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activity.tableData?.rows.map((row, rI) => (
                  <tr key={rI}>
                    {row.map((cell, cI) => (
                      <td key={cI} className="border border-slate-300 p-2 h-12 align-middle">
                        <EditableField
                          isEditing={isEditing}
                          value={cell}
                          onChange={(e) => {
                            const newRows = [...(activity.tableData?.rows || [])];
                            const newRow = [...newRows[rI]];
                            newRow[cI] = e.target.value;
                            newRows[rI] = newRow;
                            handleTableDataChange(levelIndex, activityIndex, { ...activity.tableData, rows: newRows });
                          }}
                          // Use multiline for cell content just in case
                          multiline={true}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Content / Note */}
            <div className="mt-2">
              <EditableField
                isEditing={isEditing}
                value={activity.content}
                onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'content', e.target.value)}
                textClassName="text-xs text-slate-500"
                placeholder="※ 추가 설명이나 유의사항을 입력하세요."
              />
            </div>

            {isFirstActivity && <ImageGenButton />}
          </div>
        );
      case 'drawing':
        return (
          <div className="mt-4">
            <EditableField
              isEditing={isEditing}
              value={activity.content}
              onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'content', e.target.value)}
              textClassName="mb-2 text-slate-700 font-medium"
            />
            <div
              className="w-full border-2 border-slate-300 rounded-lg bg-white shadow-inner flex items-center justify-center text-slate-400 overflow-hidden relative"
              style={{ height: activity.boxHeight ? `${activity.boxHeight}px` : '200px' }}
            >
              {/* Box Height Controller if editing? Might be too complex for now, just render box */}
              <span className="z-0">(이곳에 그림을 그리거나 내용을 작성하세요)</span>
              {isEditing && (
                <div className="absolute top-2 right-2 z-10">
                  <label className="text-xs text-slate-500 bg-white/80 p-1 rounded">높이: </label>
                  <input
                    type="number"
                    value={activity.boxHeight || 200}
                    onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'boxHeight', parseInt(e.target.value) || 200)}
                    className="w-16 text-xs border border-slate-300 rounded p-1"
                  />
                </div>
              )}
            </div>

            {isFirstActivity && <ImageGenButton />}
          </div>
        );
      case 'image_select':
        return (
          <div className="mt-4 flex flex-col gap-4">
            <div className={`bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700`}>
              <EditableField
                isEditing={isEditing}
                value={activity.content}
                onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'content', e.target.value)}
                textClassName="whitespace-pre-wrap"
              />
            </div>

            {/* Image Prompt Editing */}
            {isEditing && (
              <div className="bg-blue-50 p-2 rounded border border-blue-100">
                <span className="text-xs font-bold text-blue-600">AI 이미지 프롬프트:</span>
                <EditableField
                  isEditing={true}
                  value={activity.imagePrompt || ''}
                  onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'imagePrompt', e.target.value)}
                  className="bg-white"
                  placeholder="이미지 생성 프롬프트 입력"
                />
              </div>
            )}

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
          <div className={`mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 leading-relaxed text-slate-700 ${contentTextSize}`}>
            <EditableField
              isEditing={isEditing}
              value={activity.content}
              onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'content', e.target.value)}
              textClassName="whitespace-pre-wrap"
            />
            {isFirstActivity && <ImageGenButton />}
          </div>
        );
    }
  };


  return (
    <div className="space-y-8 font-sans" style={{ fontSize: fontSize ? `${fontSize}px` : undefined, fontFamily: fontFamily !== 'inherit' ? fontFamily : undefined }}>

      {/* Main Title */}
      <div className="border-b-2 border-slate-200 pb-4 mb-8">
        <EditableField
          isEditing={isEditing}
          value={plan.title}
          onChange={(e) => handleFieldChange('title', e.target.value)}
          textClassName="text-3xl font-extrabold text-center text-slate-800"
          className="text-center text-2xl font-bold"
        />
        <div className="mt-2 text-center max-w-3xl mx-auto">
          <EditableField
            isEditing={isEditing}
            value={plan.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            textClassName="text-slate-500"
            placeholder="활동지 설명"
          />
        </div>
      </div>

      {/* 2. Levels Loop */}
      <div className="space-y-12">
        {plan.levels.map((level, levelIndex) => (
          <div key={levelIndex} className="relative">
            {/* Level Badge/Separator */}
            <div className="flex items-center gap-4 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm flex-shrink-0
                        ${level.levelName === '기본' ? 'bg-green-100 text-green-700 border border-green-200' :
                  level.levelName === '보충' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    'bg-purple-100 text-purple-700 border border-purple-200'}`}>
                {/* Level Name Editing */}
                {isEditing ? (
                  <input
                    value={level.levelName}
                    onChange={(e) => handleLevelChange(levelIndex, 'levelName', e.target.value)}
                    className="bg-transparent border-b border-current w-12 text-center focus:outline-none"
                  />
                ) : level.levelName} 활동
              </span>

              <div className="flex-grow">
                <EditableField
                  isEditing={isEditing}
                  value={level.title}
                  onChange={(e) => handleLevelChange(levelIndex, 'title', e.target.value)}
                  textClassName="text-xl font-bold text-slate-700"
                  className="font-bold text-lg"
                />
              </div>

              <div className="h-px bg-slate-200 w-12"></div>
            </div>

            {/* Activities Grid */}
            <div className="grid grid-cols-1 gap-8">
              {level.activities.map((activity, activityIndex) => (
                <div key={activityIndex} className="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                  {/* Activity Header */}
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 mt-1">
                      {activityIndex + 1}
                    </span>
                    <div className="w-full">
                      <div className="mb-1">
                        <EditableField
                          isEditing={isEditing}
                          value={activity.title}
                          onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'title', e.target.value)}
                          textClassName="text-lg font-bold text-slate-800"
                          className="font-bold text-lg"
                        />
                      </div>
                      <EditableField
                        isEditing={isEditing}
                        value={activity.description}
                        onChange={(e) => handleActivityChange(levelIndex, activityIndex, 'description', e.target.value)}
                        textClassName={`${descTextSize} text-slate-500`}
                      />
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



