import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 border-t border-slate-200">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI UDL 지도안 생성기. 교육자를 위해 AI로 설계되었습니다.</p>
        <p className="mt-2">
          기능 개선 사항이나 사이트 관련 문의 사항이 있으면 사이트 개발자 및 운영자 이메일 주소인 edugene47@gmail.com으로 보내주세요.
        </p>
        
        {/* ✅ 법적 고지 및 주의사항 섹션 */}
        <div className="mt-6 max-w-4xl mx-auto p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 space-y-2">
          <div className="flex justify-center items-center gap-1.5 font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>중요 안내사항</span>
          </div>
          {/* ✅ 하나의 <p> 태그를 다시 두 개로 분리하여 줄바꿈을 적용했습니다. */}
          <p>
            AI가 생성한 결과물을 검토 없이 사용하여 발생하는 모든 문제에 대한 최종 책임은 AI나 개발자가 아닌, 해당 자료를 실제 교육 활동에 사용하는 교사(사용자) 본인에게 있습니다.
          </p>
          <p>
            단, 생성된 결과물을 유료로 판매하거나 직접적인 영리적 목적으로 사용하는 것은 허용되지 않습니다.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;


