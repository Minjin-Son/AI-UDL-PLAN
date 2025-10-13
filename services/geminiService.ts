/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";
import { LessonPlanInputs, GeneratedLessonPlan, TableLessonPlan, Worksheet, UdlEvaluationPlan, ProcessEvaluationWorksheet } from '../types';
import { achievementStandardsDB } from '../data/achievementStandards';

// ✅ Vercel 환경 변수에서 API 키를 가져오는 올바른 방식입니다.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("VITE_GEMINI_API_KEY is not defined. Please set it in your Vercel environment variables.");
}
const ai = new GoogleGenerativeAI(API_KEY);

// --- 1. UDL 지도안 생성을 위한 함수 ---
export const generateUDLLessonPlan = async (inputs: LessonPlanInputs): Promise<GeneratedLessonPlan> => {
    const { gradeLevel, semester, subject, topic, duration, objectives, unitName, achievementStandards, specialNeeds, studentCharacteristics } = inputs;
    
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    
    const prompt = `
      You are an expert in instructional design specializing in Universal Design for Learning (UDL) and the 2022 revised South Korean curriculum.
      Your task is to create a comprehensive lesson plan based on user input.

      **User's Lesson Information:**
      - Grade Level: ${gradeLevel} (${semester}), Subject: ${subject}, Unit Name: ${unitName}, Lesson Topic: ${topic}
      - Achievement Standard: ${achievementStandards}, Lesson Duration: ${duration}, Core Learning Objective: ${objectives}
      - Students with Special Needs: ${studentCharacteristics || 'Apply general UDL principles.'}

      **Generation Instructions:**
      1.  **Phase 1 - Differentiated Objectives:** Based on the 'Core Learning Objective', create objectives for all (overall), some (some), and a few (few) students. For the 'few' objective, MUST include two types of goals: 1) A support-focused goal and 2) An enrichment goal. Use a bullet point (•) and a newline character (\\n) to separate them.
      2.  **Phase 2 - Analysis:** Write 2-3 sentences for 'contextAnalysis' and 'learnerAnalysis' based on the 2022 curriculum.
      3.  **Phase 3 - UDL Principles:** Provide 1-2 actionable strategies for each of the three UDL principles.
      4.  **Other:** Create a creative 'lessonTitle'.
      5.  **Output Format:** Respond strictly in JSON format, written entirely in Korean. Ensure the JSON is valid.

      Here is the JSON structure to follow:
      {
        "lessonTitle": "string", "subject": "string", "gradeLevel": "string",
        "detailedObjectives": { "overall": "string", "some": "string", "few": "string" },
        "contextAnalysis": "string", "learnerAnalysis": "string",
        "udlPrinciples": [ { "principle": "string", "description": "string", "strategies": [ { "guideline": "string", "strategy": "string", "example": "string" } ] } ],
        "assessment": { "title": "string", "methods": [ "string" ] }
      }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const jsonText = response.text();
        const parsedPlan = JSON.parse(jsonText) as GeneratedLessonPlan;
        parsedPlan.achievementStandard = inputs.achievementStandards;
        return parsedPlan;
    } catch (error) {
        console.error("Error generating UDL lesson plan:", error);
        throw new Error("AI로부터 UDL 지도안을 생성하는 데 실패했습니다.");
    }
};

// --- 2. 성취기준 추천을 위한 함수 ---
export const generateAchievementStandards = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const relevantStandardsList = achievementStandardsDB[subject]?.[gradeLevel] || [];
    if (relevantStandardsList.length === 0) {
        return [`'${subject}' 과목의 성취기준 데이터가 없습니다.`];
    }

    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const prompt = `
        From the [Official List] below, select the 2-4 most relevant standards for the unit '${unitName}'.
        You MUST select only from the list. Respond in JSON format.
        [Official List]\n${relevantStandardsList.join('\n')}
        JSON structure: { "standards": [ "string" ] }
    `;
    try {
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text();
        return (JSON.parse(jsonText) as { standards: string[] }).standards;
    } catch (error) {
        console.error("Error generating achievement standards:", error);
        throw new Error("AI로부터 성취기준을 추천받는 데 실패했습니다.");
    }
};

// --- 3. 나머지 모든 함수들도 최신 방식으로 업데이트합니다. ---

export const generateLessonTopics = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `Recommend 5 interesting lesson topics for the unit '${unitName}' in ${subject} for ${gradeLevel}. Respond in Korean within a JSON object with a "topics" array.`;
    try {
        const result = await model.generateContent(prompt);
        return (JSON.parse(result.response.text()) as { topics: string[] }).topics;
    } catch (e) { console.error(e); throw new Error("AI로부터 수업 주제를 생성하는 데 실패했습니다."); }
};

export const generateLearningObjective = async (gradeLevel: string, subject: string, topic: string): Promise<string> => {
    const model = ai.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const prompt = `Create a single, core, observable learning objective for a lesson on '${topic}' for ${gradeLevel} ${subject}. Phrase it as "학생들은 ~할 수 있다." Respond in Korean within a JSON object with an "objective" string.`;
    try {
        const result = await model.generateContent(prompt);
        return (JSON.parse(result.response.text()) as { objective: string }).objective;
    } catch (e) { console.error(e); throw new Error("AI로부터 학습 목표를 생성하는 데 실패했습니다."); }
};

// App.tsx와의 연결을 위해 나머지 함수들도 유효한 함수 형태로 유지합니다.
export const generateTableLessonPlan = async (inputs: LessonPlanInputs): Promise<TableLessonPlan> => {
    return Promise.reject(new Error("표 형식 지도안 생성 기능은 현재 구현되지 않았습니다."));
};

export const generateWorksheet = async (inputs: LessonPlanInputs): Promise<Worksheet> => {
    return Promise.reject(new Error("활동지 생성 기능은 현재 구현되지 않았습니다."));
};

export const generateUdlEvaluationPlan = async (inputs: LessonPlanInputs): Promise<UdlEvaluationPlan> => {
    return Promise.reject(new Error("UDL 평가 계획 생성 기능은 현재 구현되지 않았습니다."));
};

export const generateProcessEvaluationWorksheet = async (inputs: LessonPlanInputs, udlEvaluationPlan?: UdlEvaluationPlan): Promise<ProcessEvaluationWorksheet> => {
    return Promise.reject(new Error("과정중심평가지 생성 기능은 현재 구현되지 않았습니다."));
};