import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 border-t border-slate-200">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI UDL 지도안 생성기. 교육자를 위해 AI로 설계되었습니다.</p>
        
        {/* 👇 이 부분을 추가하세요! */}
        <p className="mt-2"> 
          기능 개선 사항이나 사이트 관련해서 문의 사항이 있으면 사이트 개발자 및 운영자 이메일 주소인 edugene47@gmail.com으로 보내주세요.
        </p>
      </div>
    </footer>
  );
};

export default Footer;