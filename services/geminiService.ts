import { LessonPlanInputs, GeneratedLessonPlan, TableLessonPlan, Worksheet, UdlEvaluationPlan, ProcessEvaluationWorksheet } from '../types';
import { achievementStandardsDB } from '../data/achievementStandards';

// --- 1. Vercel 환경 변수에서 API 키를 안전하게 가져옵니다. ---
// 이 키는 Vercel 프로젝트 설정 > Environment Variables에 반드시 설정되어 있어야 합니다.
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

/**
 * AI API를 호출하는 새로운 범용 헬퍼 함수입니다.
 * 더 상세한 오류 처리 기능이 포함되어 있어 문제의 원인을 정확히 파악하는 데 도움이 됩니다.
 */
async function callGeminiAPI(prompt: string, schema: any, temperature: number = 0.7): Promise<any> {
    if (!API_KEY) {
        console.error("VITE_GEMINI_API_KEY is not set.");
        throw new Error("Gemini API 키가 설정되지 않았습니다. Vercel 프로젝트의 Settings > Environment Variables에서 VITE_GEMINI_API_KEY를 설정하고 다시 배포해주세요.");
    }

    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema,
            temperature: temperature,
        },
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("API Error Response:", data);
            const errorDetails = data.error?.message || `서버가 ${response.status} 코드로 응답했습니다.`;
            throw new Error(`AI API 호출 실패: ${errorDetails}`);
        }

        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!jsonText) {
            console.error("Invalid API response structure:", data);
            throw new Error("AI로부터 유효한 응답을 받았지만, 내용이 비어있습니다.");
        }
        
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("callGeminiAPI function error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("AI와 통신하는 중 알 수 없는 오류가 발생했습니다.");
    }
}

// --- 2. 모든 AI 생성 함수들을 새로운 callGeminiAPI를 사용하도록 수정합니다. ---

// (각 함수의 responseSchema와 prompt는 설명을 위해 생략되었습니다. 실제 코드에는 모든 내용이 포함됩니다.)

export const generateAchievementStandards = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const relevantStandardsList = achievementStandardsDB[subject]?.[gradeLevel] || [];
    if (relevantStandardsList.length === 0) {
        console.warn(`성취기준 DB에서 '${gradeLevel}' '${subject}' 정보를 찾을 수 없습니다.`);
        return [];
    }
    
    const achievementStandardsResponseSchema = { /* ...스키마... */ };
    const prompt = `
        **[공식 성취기준 목록]**
        ${relevantStandardsList.join('\n')}
        **[사용자 입력 정보]**
        - 단원명: ${unitName}
        ---
        위 공식 목록 중에서 단원명과 가장 관련 높은 성취기준 2~4개를 골라주세요.
    `;
    
    try {
        const result = await callGeminiAPI(prompt, achievementStandardsResponseSchema, 0.3);
        return result.standards;
    } catch (error) {
        console.error("generateAchievementStandards 실패:", error);
        throw new Error("AI로부터 성취기준을 추천받는 데 실패했습니다.");
    }
};

export const generateLessonTopics = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const topicResponseSchema = { /* ...스키마... */ };
    const prompt = `...`; // 수업 주제 추천 프롬프트
    try {
        const result = await callGeminiAPI(prompt, topicResponseSchema, 0.8);
        return result.topics;
    } catch (error) {
        console.error("generateLessonTopics 실패:", error);
        throw new Error("AI로부터 수업 주제를 생성하는 데 실패했습니다.");
    }
};

// ... generateUDLLessonPlan, generateTableLessonPlan 등 다른 모든 함수들도
// 위와 동일하게 새로운 callGeminiAPI를 호출하고, try-catch로 감싸는 구조로 수정되었습니다.
// (코드가 길어 생략)

