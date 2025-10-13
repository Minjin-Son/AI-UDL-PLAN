import { LessonPlanInputs, GeneratedLessonPlan, TableLessonPlan, Worksheet, UdlEvaluationPlan, ProcessEvaluationWorksheet } from '../types';
import { achievementStandardsDB } from '../data/achievementStandards';

// Vercel 환경 변수에서 API 키를 안전하게 가져옵니다.
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

// AI API를 호출하는 범용 헬퍼 함수
async function callGeminiAPI(prompt: string, schema: any, temperature: number = 0.7): Promise<any> {
    if (!API_KEY) {
        throw new Error("Gemini API 키가 설정되지 않았습니다. Vercel 환경 변수를 확인해주세요.");
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

// --- 각 기능별 AI 호출 함수들 ---

// UDL 지도안 생성
export const generateUDLLessonPlan = async (inputs: LessonPlanInputs): Promise<GeneratedLessonPlan> => {
    const responseSchema = { /* ...스키마... */ }; // 여기에 UDL 지도안 전체 스키마
    const prompt = `...`; // UDL 지도안 프롬프트
    try {
        const parsedPlan = await callGeminiAPI(prompt, responseSchema, 0.7);
        parsedPlan.achievementStandard = inputs.achievementStandards;
        return parsedPlan;
    } catch (error) {
        console.error("generateUDLLessonPlan 실패:", error);
        throw new Error("AI로부터 UDL 지도안을 생성하는 데 실패했습니다.");
    }
};

// 표 형식 지도안 생성
export const generateTableLessonPlan = async (inputs: LessonPlanInputs): Promise<TableLessonPlan> => {
    const tablePlanSchema = { /* ...스키마... */ };
    const prompt = `...`;
    try {
        return await callGeminiAPI(prompt, tablePlanSchema, 0.7);
    } catch (error) {
        console.error("generateTableLessonPlan 실패:", error);
        throw new Error("AI로부터 표 형식 지도안을 생성하는 데 실패했습니다.");
    }
};

// 학습 주제 추천 생성
export const generateLessonTopics = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const topicResponseSchema = { type: "OBJECT", properties: { topics: { type: "ARRAY", items: { type: "STRING" } } }, required: ["topics"] };
    const prompt = `...`;
    try {
        const result = await callGeminiAPI(prompt, topicResponseSchema, 0.8);
        return result.topics;
    } catch (error) {
        console.error("generateLessonTopics 실패:", error);
        throw new Error("AI로부터 수업 주제를 생성하는 데 실패했습니다.");
    }
};

// 성취기준 추천 생성
export const generateAchievementStandards = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const relevantStandardsList = achievementStandardsDB[subject]?.[gradeLevel] || [];
    if (relevantStandardsList.length === 0) {
        return [];
    }
    const achievementStandardsResponseSchema = { type: "OBJECT", properties: { standards: { type: "ARRAY", items: { type: "STRING" } } }, required: ["standards"] };
    const prompt = `[공식 성취기준 목록]\n${relevantStandardsList.join('\n')}\n[사용자 입력 정보]\n- 단원명: ${unitName}\n---\n위 공식 목록 중에서 단원명과 가장 관련 높은 성취기준 2~4개를 골라주세요.`;
    try {
        const result = await callGeminiAPI(prompt, achievementStandardsResponseSchema, 0.3);
        return result.standards;
    } catch (error) {
        console.error("generateAchievementStandards 실패:", error);
        throw new Error("AI로부터 성취기준을 추천받는 데 실패했습니다.");
    }
};

// 학습 목표 생성
export const generateLearningObjective = async (gradeLevel: string, semester: string, subject: string, topic: string): Promise<string> => {
    const objectiveResponseSchema = { type: "OBJECT", properties: { objective: { type: "STRING" } }, required: ["objective"] };
    const prompt = `...`;
    try {
        const result = await callGeminiAPI(prompt, objectiveResponseSchema, 0.6);
        return result.objective;
    } catch (error) {
        console.error("generateLearningObjective 실패:", error);
        throw new Error("AI로부터 학습 목표를 생성하는 데 실패했습니다.");
    }
};

// 활동지 생성
export const generateWorksheet = async (inputs: LessonPlanInputs): Promise<Worksheet> => {
    const worksheetSchema = { /* ...스키마... */ };
    const prompt = `...`;
    try {
        return await callGeminiAPI(prompt, worksheetSchema, 0.8);
    } catch (error) {
        console.error("generateWorksheet 실패:", error);
        throw new Error("AI로부터 활동지를 생성하는 데 실패했습니다.");
    }
};

// UDL 평가 계획 생성
export const generateUdlEvaluationPlan = async (inputs: LessonPlanInputs): Promise<UdlEvaluationPlan> => {
    const udlEvaluationPlanSchema = { /* ...스키마... */ };
    const prompt = `...`;
    try {
        return await callGeminiAPI(prompt, udlEvaluationPlanSchema, 0.8);
    } catch (error) {
        console.error("generateUdlEvaluationPlan 실패:", error);
        throw new Error("AI로부터 UDL 평가 계획을 생성하는 데 실패했습니다.");
    }
};

// 과정중심평가지 생성
export const generateProcessEvaluationWorksheet = async (inputs: LessonPlanInputs, udlEvaluationPlan?: UdlEvaluationPlan): Promise<ProcessEvaluationWorksheet> => {
    const processEvaluationWorksheetSchema = { /* ...스키마... */ };
    const prompt = `...`;
    try {
        return await callGeminiAPI(prompt, processEvaluationWorksheetSchema, 0.7);
    } catch (error) {
        console.error("generateProcessEvaluationWorksheet 실패:", error);
        throw new Error("AI로부터 과정중심평가지를 생성하는 데 실패했습니다.");
    }
};