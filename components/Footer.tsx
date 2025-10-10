import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-8 border-t border-slate-200">
      <div className="container mx-auto py-4 px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} AI UDL 지도안 생성기. 교육자를 위해 AI로 설계되었습니다.</p>
      </div>
    </footer>
  );
};

export default Footer;