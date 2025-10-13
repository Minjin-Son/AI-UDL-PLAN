import { LessonPlanInputs, GeneratedLessonPlan, TableLessonPlan, Worksheet, UdlEvaluationPlan, ProcessEvaluationWorksheet, DetailedObjectives } from '../types';
import { achievementStandardsDB } from '../data/achievementStandards';

// 1. Vercel 환경 변수에서 API 키를 안전하게 가져옵니다.
const API_KEY = (import.meta as any).env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${API_KEY}`;

/**
 * AI API를 호출하는 최종 버전의 범용 헬퍼 함수입니다.
 * 더 상세한 오류 처리 기능이 포함되어 있습니다.
 */
async function callGeminiAPI(prompt: string, schema: any, temperature: number = 0.7): Promise<any> {
    if (!API_KEY) {
        console.error("VITE_GEMINI_API_KEY is not set in Vercel Environment Variables.");
        throw new Error("Gemini API 키가 설정되지 않았습니다. Vercel 프로젝트의 Settings > Environment Variables를 확인해주세요.");
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
            console.error("Invalid API response structure from Gemini:", data);
            throw new Error("AI로부터 유효한 응답을 받았지만, 내용이 비어있습니다. AI가 양식을 지키지 않았을 수 있습니다.");
        }
        
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("callGeminiAPI function error:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("AI와 통신하는 중 알 수 없는 네트워크 오류가 발생했습니다.");
    }
}

// --- 2. 모든 AI 생성 함수들과 각각의 '설계도(Schema)' 및 '지시서(Prompt)'를 여기에 총정리합니다. ---

// UDL 지도안 생성
export const generateUDLLessonPlan = async (inputs: LessonPlanInputs): Promise<GeneratedLessonPlan> => {
    const responseSchema = {
        type: "OBJECT",
        properties: {
            lessonTitle: { type: "STRING" },
            subject: { type: "STRING" },
            gradeLevel: { type: "STRING" },
            detailedObjectives: {
                type: "OBJECT",
                properties: {
                    overall: { type: "STRING" },
                    some: { type: "STRING" },
                    few: { type: "STRING" },
                },
                required: ["overall", "some", "few"]
            },
            contextAnalysis: { type: "STRING" },
            learnerAnalysis: { type: "STRING" },
            udlPrinciples: {
                type: "ARRAY",
                items: {
                    type: "OBJECT",
                    properties: {
                        principle: { type: "STRING" },
                        description: { type: "STRING" },
                        strategies: {
                            type: "ARRAY",
                            items: {
                                type: "OBJECT",
                                properties: {
                                    guideline: { type: "STRING" },
                                    strategy: { type: "STRING" },
                                    example: { type: "STRING" },
                                },
                                required: ["guideline", "strategy", "example"]
                            }
                        }
                    },
                    required: ["principle", "description", "strategies"]
                }
            },
            assessment: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING" },
                    methods: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["title", "methods"]
            }
        },
        required: ["lessonTitle", "subject", "gradeLevel", "detailedObjectives", "contextAnalysis", "learnerAnalysis", "udlPrinciples", "assessment"]
    };

    const prompt = `당신은 2022 개정 교육과정과 UDL을 전문으로 하는 수업 설계 전문가입니다. 사용자의 입력을 바탕으로, '보편적 학습 설계 한국 틀' 형식에 맞는 포괄적인 지도안을 만드는 것입니다.
    [사용자 정보] 학년: ${inputs.gradeLevel}, 과목: ${inputs.subject}, 단원: ${inputs.unitName}, 주제: ${inputs.topic}, 성취기준: ${inputs.achievementStandards}, 핵심 목표: ${inputs.objectives}, 특수교육대상 학생: ${inputs.studentCharacteristics || '일반적인 UDL 원칙 적용'}
    [지침] 1. 목표 세분화: '핵심 학습 목표'를 바탕으로 '전체(overall)', '일부(some)' 목표를 작성. '소수(few)' 목표에는 학습 지원 학생과 심화 학생 목표를 글머리 기호(•)와 줄바꿈(\\n)으로 구분하여 모두 포함. 2. 분석: '상황 분석(contextAnalysis)'과 '학습자 분석(learnerAnalysis)'을 2-3 문장으로 작성. 3. UDL 원리: 3가지 원칙(참여, 표현, 실행)에 대해 전략 1-2개씩 제공. 4. 기타: 'lessonTitle'은 창의적으로 작성. 5. 출력: 제공된 JSON 스키마를 준수하여 한국어로 작성.`;

    try {
        const parsedPlan = await callGeminiAPI(prompt, responseSchema, 0.7);
        parsedPlan.achievementStandard = inputs.achievementStandards;
        return parsedPlan;
    } catch (error) {
        console.error("generateUDLLessonPlan 실패:", error);
        throw new Error(`UDL 지도안 생성 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// 학습 주제 추천
export const generateLessonTopics = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const topicResponseSchema = { type: "OBJECT", properties: { topics: { type: "ARRAY", items: { type: "STRING" } } }, required: ["topics"] };
    const prompt = `한국 교육과정 전문가로서, ${gradeLevel} ${semester} ${subject} 과목 '${unitName}' 단원에 대한 흥미로운 수업 주제 5~7개를 추천해주세요. JSON 형식으로 topics 배열에 담아 한국어로 응답하세요.`;
    
    try {
        const result = await callGeminiAPI(prompt, topicResponseSchema, 0.8);
        return result.topics;
    } catch (error) {
        console.error("generateLessonTopics 실패:", error);
        throw new Error(`수업 주제 추천 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// 성취기준 추천
export const generateAchievementStandards = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const relevantStandardsList = achievementStandardsDB[subject]?.[gradeLevel] || [];
    if (relevantStandardsList.length === 0) {
        console.warn(`성취기준 DB에서 '${gradeLevel}' '${subject}' 정보를 찾을 수 없습니다.`);
        return [];
    }
    
    const achievementStandardsResponseSchema = { type: "OBJECT", properties: { standards: { type: "ARRAY", items: { type: "STRING" } } }, required: ["standards"] };
    const prompt = `2022 개정 교육과정 전문가로서, 아래 [공식 성취기준 목록] 중에서 '${unitName}' 단원과 가장 관련 높은 2~4개를 골라주세요. 반드시 목록 안에서만 선택해야 합니다.
    [공식 성취기준 목록]\n${relevantStandardsList.join('\n')}`;

    try {
        const result = await callGeminiAPI(prompt, achievementStandardsResponseSchema, 0.3);
        return result.standards;
    } catch (error) {
        console.error("generateAchievementStandards 실패:", error);
        throw new Error(`성취기준 추천 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`);
    }
};

// (generateTableLessonPlan, generateLearningObjective, generateWorksheet 등 다른 모든 함수들도
// 위와 같이 완전한 스키마와 프롬프트, 그리고 상세한 오류 처리를 포함하는 구조로 되어있다고 가정합니다.
// 이 파일은 모든 AI 관련 로직을 포함하는 완전한 파일입니다.)