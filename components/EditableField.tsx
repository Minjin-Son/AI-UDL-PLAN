import React, { useRef, useLayoutEffect } from 'react';

// 텍스트 영역 높이를 자동으로 조절하는 컴포넌트
interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const AutoGrowTextarea: React.FC<AutoGrowTextareaProps> = (props) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // 높이를 먼저 초기화해야 정확한 scrollHeight를 계산할 수 있습니다.
      textarea.style.height = 'inherit'; 
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
    // value가 변경될 때마다 높이를 다시 계산합니다.
  }, [props.value]); 

  return <textarea ref={textareaRef} {...props} />;
};

// 수정 모드와 보기 모드를 전환하는 필드 컴포넌트
interface EditableFieldProps {
  isEditing: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  multiline?: boolean; // 여러 줄 입력 가능 여부 (기본값: true)
  className?: string; // <textarea> 또는 <div>에 적용될 추가 클래스
  textClassName?: string; // 보기 모드일 때 <div>에만 적용될 추가 클래스
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  isEditing, 
  value, 
  onChange, 
  multiline = true, 
  className = '', 
  textClassName = '' 
}) => {
  if (isEditing) {
    // 수정 모드일 때: <textarea> 또는 AutoGrowTextarea 렌더링
    const commonProps = {
      value,
      onChange,
      // 스타일: 기본 스타일 + 추가 className
      className: `w-full p-1 rounded-md bg-indigo-50 border border-indigo-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none ${className}`,
    };
    // multiline prop에 따라 AutoGrowTextarea 또는 기본 textarea 사용
    return multiline ? <AutoGrowTextarea {...commonProps} /> : <textarea {...commonProps} rows={1} />;
  }
  // 보기 모드일 때: <div> 렌더링
  return <div className={textClassName}>{value}</div>; 
};

export default EditableField; // 다른 파일에서 사용할 수 있도록 export
