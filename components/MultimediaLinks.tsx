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

  // 검색어에서 불필요한 특수기호 제거하여 검색 정확도 향상
  const cleanSearchQuery = (rawQuery: string) => {
    return (rawQuery || '')
      .replace(/[\[\]'"“”‘’!?,.:;~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // 검색 링크를 생성하는 함수
  const createSearchUrl = (resource: MultimediaResource) => {
    const cleaned = cleanSearchQuery(resource.search_query || resource.title);
    const query = encodeURIComponent(cleaned);
    const platformLower = (resource.platform || '').toLowerCase();

    if (platformLower.includes('youtube') || platformLower.includes('유튜브')) {
      return `https://www.youtube.com/results?search_query=${query}`;
    }
    if (platformLower.includes('image') || platformLower.includes('이미지')) {
      return `https://www.google.com/search?tbm=isch&q=${query}`;
    }
    // 기본적으로는 유튜브 교육 영상 검색 링크를 반환
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  return (
    <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
      <h3 className="text-lg font-bold text-emerald-800 mb-3">💡 추천 멀티미디어 학습 자료</h3>
      <div className="space-y-2.5">
        {resources.map((resource, index) => {
          const cleanedQuery = cleanSearchQuery(resource.search_query || resource.title);
          return (
            <a
              key={index}
              href={createSearchUrl(resource)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-wrap items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <span className="font-medium">- [{resource.platform || 'YouTube'}] {resource.title}</span>
              <span className="text-xs bg-white text-emerald-700 border border-emerald-300 px-2 py-0.5 rounded-full no-underline">
                🔍 검색어: {cleanedQuery}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default MultimediaLinks;
