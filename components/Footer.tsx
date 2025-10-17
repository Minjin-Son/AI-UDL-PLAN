import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 border-t border-slate-200">
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI UDL 지도안 생성기. 교육자를 위해 AI로 설계되었습니다.</p>
        <p className="mt-2">
          기능 개선 사항이나 사이트 관련 문의 사항이 있으면 사이트 개발자 및 운영자 이메일 주소인 edugene47@gmail.com으로 보내주세요.
        </p>
        
        {/* 법적 고지 사항 섹션 */}
        <div className="mt-4 text-xs text-slate-400 space-y-1">
          <p>
            AI가 생성한 결과물을 검토 없이 사용하여 발생하는 모든 문제에 대한 최종 책임은 AI나 개발자가 아닌, 해당 자료를 실제 교육 활동에 사용하는 교사(사용자) 본인에게 있습니다.
          </p>
          {/* ✅ 바로 이 부분을 추가했습니다! */}
          <p>
            단, 생성된 결과물을 유료로 판매하거나 직접적인 영리적 목적으로 사용하는 것은 허용되지 않습니다.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
