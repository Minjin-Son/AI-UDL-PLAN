import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고와 웹사이트 제목 부분 */}
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              AI UDL 지도안 생성기
            </h1>
          </div>
          
          {/* ✅ 바로 이 부분을 추가했습니다! */}
          <div className="hidden sm:block">
            <p className="text-sm text-slate-500">
              수업에 맞게 재가공하여 사용하는 것을 권장하며, 출처를 밝힌 공유 및 배포를 환영합니다.
            </p>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;