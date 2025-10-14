import React from 'react';
import { MultimediaResource } from '../types';

// props 타입 정의: multimedia_resources 배열을 받도록 설정
interface MultimediaLinksProps {
  resources: MultimediaResource[];
}

const MultimediaLinks: React.FC<MultimediaLinksProps> = ({ resources }) => {
  // 만약 resources 데이터가 없거나 비어있으면 아무것도 보여주지 않음
  if (!resources || resources.length === 0) {
    return null;
  }

  // 검색 링크를 생성하는 함수
  const createSearchUrl = (resource: MultimediaResource) => {
    const query = encodeURIComponent(resource.search_query);
    if (resource.platform.toLowerCase().includes('youtube')) {
      return `https://www.youtube.com/results?search_query=${query}`;
    }
    if (resource.platform.toLowerCase().includes('image')) {
      return `https://www.google.com/search?tbm=isch&q=${query}`;
    }
    // 기본적으로는 구글 검색 링크를 반환
    return `https://www.google.com/search?q=${query}`;
  };

  return (
    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <h3 className="text-lg font-bold text-emerald-800 mb-3">💡 추천 멀티미디어 학습 자료</h3>
      <div className="space-y-2">
        {resources.map((resource, index) => (
          <a
            key={index}
            href={createSearchUrl(resource)}
            target="_blank" // 새 탭에서 열기
            rel="noopener noreferrer" // 보안 설정
            className="block text-blue-600 hover:text-blue-800 hover:underline transition-colors"
          >
            - [{resource.platform}] {resource.title} 검색하기
          </a>
        ))}
      </div>
    </div>
  );
};

export default MultimediaLinks;