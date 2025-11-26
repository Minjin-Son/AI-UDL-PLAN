import { GoogleGenAI, Type } from "@google/genai";
import { LessonPlanInputs, GeneratedLessonPlan, TableLessonPlan, Worksheet, UdlEvaluationPlan, ProcessEvaluationWorksheet, DetailedObjectives } from '../types';
import { achievementStandardsDB } from '../data/achievementStandards';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// AI가 생성할 기본 지도안의 데이터 설계도
const responseSchema = {
    type: Type.OBJECT,
    properties: {
        lessonTitle: { 
            type: Type.STRING,
            description: "학생들의 흥미를 유발할 만한 창의적인 수업 주제"
        },
        subject: { 
            type: Type.STRING,
            description: "사용자가 입력한 교과목 이름 (예: 과학, 수학)"
        },
        gradeLevel: { 
            type: Type.STRING,
            description: "사용자가 입력한 학년 정보 (예: 초등학교 (4학년))"
        },
        detailedObjectives: {
            type: Type.OBJECT,
            description: "모든 학생, 일부 학생, 소수 학생을 위한 세분화된 학습 목표",
            properties: {
                overall: { 
                    type: Type.STRING,
                    description: "모든 학생이 성취해야 할 핵심 목표"
                },
                some: { 
                    type: Type.STRING,
                    description: "일부 학생들이 추가적으로 성취할 수 있는 목표"
                },
                few: { 
                    type: Type.STRING,
                    description: "학습에 어려움이 있거나 빠른 학생들을 위한 개별화된 목표"
                },
            },
            required: ["overall", "some", "few"]
        },
        contextAnalysis: { type: Type.STRING, description: "수업 환경 및 맥락 분석 (2-3문장)" },
        learnerAnalysis: { type: Type.STRING, description: "대상 학년의 발달 단계를 고려한 학습자 분석 (2-3문장)" },
        udlPrinciples: {
            type: Type.ARRAY,
            description: "UDL의 세 가지 원칙(참여, 표상, 실행)에 따른 구체적인 전략들",
            items: {
                type: Type.OBJECT,
                properties: {
                    principle: { type: Type.STRING },
                    description: { type: Type.STRING },
                    strategies: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                guideline: { type: Type.STRING },
                                strategy: { type: Type.STRING },
                                example: { type: Type.STRING },
                            },
                             required: ["guideline", "strategy", "example"]
                        }
                    }
                },
                required: ["principle", "description", "strategies"]
            }
        },
        assessment: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                methods: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
            required: ["title", "methods"]
        },
        multimedia_resources: {
            type: "ARRAY",
            description: "수업과 관련된 추천 멀티미디어 자료 목록",
            items: {
                type: "OBJECT",
                properties: {
                    title: { type: "STRING", description: "자료의 제목" },
                    platform: { type: "STRING", description: "플랫폼 (예: YouTube, Google Images)" },
                    search_query: { type: "STRING", description: "검색에 사용할 검색어" },
                },
                required: ["title", "platform", "search_query"]
            }
        }
    },
    required: ["lessonTitle", "subject", "gradeLevel", "detailedObjectives", "contextAnalysis", "learnerAnalysis", "udlPrinciples", "assessment"]
};

// ✅ [새로 추가] 1, 2단계 내용만 생성하기 위한 간단한 설계도
const analysisOnlySchema = {
    type: Type.OBJECT,
    properties: {
        contextAnalysis: { type: Type.STRING },
        learnerAnalysis: { type: Type.STRING },
    },
    required: ["contextAnalysis", "learnerAnalysis"]
};


export const generateUDLLessonPlan = async (inputs: LessonPlanInputs): Promise<GeneratedLessonPlan> => {
    const { gradeLevel, semester, subject, topic, duration, objectives, unitName, achievementStandards, specialNeeds, studentCharacteristics } = inputs;

    const prompt = `
      당신은 2022 개정 교육과정과 보편적 학습 설계(UDL)를 전문으로 하는 수업 설계 전문가입니다.
      당신의 임무는 사용자의 입력을 바탕으로, '보편적 학습 설계 한국 틀' 형식에 맞는 포괄적인 지도안을 만드는 것입니다.

      **사용자 수업 정보:**
      - **학년:** ${gradeLevel} (${semester})
      - **과목:** ${subject}
      - **단원명:** ${unitName}
      - **수업 주제:** ${topic}
      - **성취기준:** ${achievementStandards}
      - **수업 시간:** ${duration}
      - **핵심 학습 목표:** ${objectives}
      - **고려할 특수교육대상 학생 유형:** ${specialNeeds || '해당 없음'}
      - **특수교육대상 학생의 구체적인 특성:** ${studentCharacteristics || '구체적인 정보 없음.'}

      **지도안 생성 지침:**
      1.  **1단계 - 목표 세분화:**           - 사용자가 입력한 '핵심 학습 목표'를 바탕으로, 모든 학생(overall)과 일부 학생(some)을 위한 목표를 'detailedObjectives' 객체에 작성해주세요.
          - **(중요!)** '소수(few)' 목표에는 두 가지 종류의 목표를 반드시 포함해야 합니다.
            1) 학습에 어려움이 있는 학생(예: 특수교육대상 학생)을 위한 지원 중심의 목표.
            2) 학습이 빠른 학생을 위한 심화 또는 확장 중심의 목표.
         - **각 목표는 글머리 기호(•)로 시작하며, 각 항목은 줄바꿈(\\n)으로 분리된 별도의 줄에 작성해주세요.**

      2.  **2단계 - 분석:** 2022 개정 교육과정에 근거하여, '상황 분석(contextAnalysis)'과 '학습자 분석(learnerAnalysis)' 항목을 각각 2~3 문장으로 구체적으로 작성해주세요. 상황 분석은 수업 환경과 맥락을, 학습자 분석은 학생들의 발달 특성을 고려해야 합니다.
      3.  **3단계 - UDL 원리 적용:** 세 가지 UDL 원칙(참여, 표상, 실행) 각각에 대해 뚜렷하고 실행 가능한 전략을 1~2개씩 제공해 주세요. 각 전략에는 구체적인 가이드라인, 명확한 전략 이름, 수업 주제와 관련된 구체적인 예시가 포함되어야 합니다.
      4.  **멀티미디어 자료 추천:** 수업 주제와 관련된 유용한 시청각 자료(유튜브 영상, 이미지 등)를 2~3개 추천하여 'multimedia_resources' 배열 형식으로 제공해주세요. 각 자료에는 title, platform, search_query가 포함되어야 합니다.
      5.  **평가 계획:** 학생들이 자신의 이해도를 보여줄 수 있는 다양한 방법을 제공하는 평가 섹션을 포함해 주세요.
      6.  **기타:** 'lessonTitle'은 주제와 관련하여 창의적으로 작성하고, 'subject'와 'gradeLevel'은 입력받은 값을 그대로 사용해주세요.
      7.  **출력 형식:** 제공된 스키마를 준수하는 JSON 객체 형식으로, 모든 내용을 한국어로 작성해주세요. (중요!) multimedia_resources를 포함한 모든 필수 항목을 절대로 빠뜨리지 마세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        // ✅ AI가 반환한 결과를 임시로 저장합니다.
        let parsedPlan = JSON.parse(jsonText) as Partial<GeneratedLessonPlan>;

        // ✅ [새로 추가] AI가 1, 2단계 내용을 빠뜨렸는지 확인하고, 그렇다면 다시 요청하는 '보험용' 코드
        if (!parsedPlan.contextAnalysis || !parsedPlan.learnerAnalysis) {
            console.warn("AI did not generate analysis fields. Trying a fallback prompt...");

            const analysisPrompt = `
                주어진 수업 정보를 바탕으로 '상황 분석'과 '학습자 분석'을 2022 개정 교육과정에 맞게 각각 2~3문장으로 작성해주세요.

                **수업 정보:**
                - 학년: ${inputs.gradeLevel}
                - 과목: ${inputs.subject}
                - 주제: ${inputs.topic}

                **출력 형식 (JSON):**
                {
                  "contextAnalysis": "여기에 상황 분석 내용 작성",
                  "learnerAnalysis": "여기에 학습자 분석 내용 작성"
                }
            `;

            const analysisResponse = await ai.models.generateContent({
                model: "gemini-3-pro-preview",
                contents: analysisPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: analysisOnlySchema, // 새로 만든 간단한 설계도 사용
                    temperature: 0.8,
                },
            });

            const analysisJsonText = analysisResponse.text.trim();
            const analysisContent = JSON.parse(analysisJsonText);

            // 다시 요청해서 받은 1, 2단계 내용을 기존 결과에 합칩니다.
            parsedPlan = { ...parsedPlan, ...analysisContent };
        }
        
        // 사용자 입력을 최종 결과에 포함시킵니다.
        parsedPlan.achievementStandard = inputs.achievementStandards;

        // 최종적으로 완전한 형태의 지도안으로 변환하여 반환합니다.
        return parsedPlan as GeneratedLessonPlan;

    } catch (error) {
        console.error("Error generating lesson plan:", error);
        throw new Error("AI로부터 지도안을 생성하는 데 실패했습니다. 응답이 유효한 JSON이 아닐 수 있습니다.");
    }
};

const tablePlanSchema = {
    type: Type.OBJECT,
    properties: {
        metadata: {
            type: Type.OBJECT,
            properties: {
                lessonTitle: { type: Type.STRING },
                subject: { type: Type.STRING },
                gradeLevel: { type: Type.STRING },
                topic: { type: Type.STRING },
                objectives: { type: Type.STRING },
                duration: { type: Type.STRING },
                materials: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
            },
             required: ["lessonTitle", "subject", "gradeLevel", "topic", "objectives", "duration", "materials"]
        },
        steps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    phase: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    process: { type: Type.STRING },
                    teacherActivities: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    studentActivities: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    materialsAndNotes: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                },
                required: ["phase", "duration", "process", "teacherActivities", "studentActivities", "materialsAndNotes"]
            }
        },
        evaluationPlan: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "평가 계획 제목 (예: '평가 계획')" },
                criteria: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            content: { type: Type.STRING, description: "평가 내용 또는 질문 (예: '물의 순환 과정을 설명할 수 있는가?')" },
                            method: { type: Type.STRING, description: "평가 방법 (예: 관찰평가, 활동지)" },
                            excellent: { type: Type.STRING, description: "'잘함' 수준에 대한 명확하고 관찰 가능한 평가 기준" },
                            good: { type: Type.STRING, description: "'보통' 수준에 대한 명확하고 관찰 가능한 평가 기준" },
                            needsImprovement: { type: Type.STRING, description: "'노력요함' 수준에 대한 명확하고 관찰 가능한 평가 기준" }
                        },
                        required: ["content", "method", "excellent", "good", "needsImprovement"]
                    }
                }
            },
            required: ["title", "criteria"]
        }
    },
    required: ["metadata", "steps", "evaluationPlan"]
};

export const generateTableLessonPlan = async (inputs: LessonPlanInputs): Promise<TableLessonPlan> => {
    const { gradeLevel, semester, subject, topic, duration, objectives, unitName, achievementStandards, specialNeeds, studentCharacteristics } = inputs;

    const prompt = `
      당신은 초등학교 교육과정 및 수업 설계에 매우 능숙한 베테랑 교사입니다.
      제공된 수업 정보를 바탕으로, 한국의 초등학교에서 일반적으로 사용되는 '교수·학습 과정안' 형식의 명료한 표를 만들어 주세요.

      **수업 정보:**
      - **학년:** ${gradeLevel} (${semester})
      - **과목:** ${subject}
      - **단원명:** ${unitName}
      - **수업 주제:** ${topic}
      - **성취기준:** ${achievementStandards}
      - **수업 시간:** ${duration}
      - **학습 목표:** ${objectives}
      - **고려할 특수교육대상 학생 유형:** ${specialNeeds || '해당 없음'}
      - **특수교육대상 학생의 구체적인 특성:** ${studentCharacteristics || '구체적인 정보 없음.'}

      **표 형식 지도안 생성 지침:**
      1.  **전체 구조:** 지도안은 크게 '수업 정보 요약(metadata)', '교수·학습 과정(steps)', '평가 계획(evaluationPlan)'으로 구성됩니다.
      2.  **교수·학습 과정 (steps):**
          - 수업의 흐름을 '도입', '전개', '정리'의 3단계(phase)로 명확히 구분해 주세요.
          - 각 단계 내에서 세부적인 '학습 과정(process)'을 제시해 주세요. (예: 동기 유발, 학습 활동 1, 학습 내용 정리)
          - 각 '학습 과정'마다 예상 소요 시간(duration), 교사 활동(teacherActivities), 학생 활동(studentActivities), 그리고 '자료 및 유의점(materialsAndNotes)'을 구체적으로 서술해 주세요.
          - '교사 활동'과 '학생 활동'은 서로 상호작용이 잘 드러나도록 작성해 주세요.
          - '자료 및 유의점'에는 수업 자료뿐만 아니라, 수업 운영에 필요한 팁이나 학생 지도 유의점을 '※' 기호와 함께 포함할 수 있습니다. **특히, '특수교육대상 학생의 구체적인 특성'에 기술된 내용을 바탕으로 해당 학생을 지원하기 위한 매우 구체적인 유의사항을 '※' 기호와 함께 이 부분에 포함시켜 주세요.**
      3.  **평가 계획 (evaluationPlan):**
          - 'title'은 '평가 계획'으로 고정해 주세요.
          - 'criteria' 배열에는 학습 목표와 연관된 평가 항목을 1~2개 포함시켜 주세요.
          - 각 평가 항목은 다음을 포함해야 합니다:
              - 'content': 구체적인 평가 내용 (예: "물의 순환 과정을 설명할 수 있는가?")
              - 'method': 평가 방법 (예: "관찰 평가", "산출물 평가")
              - 'excellent': '잘함' 수준의 학생이 보일 행동이나 결과에 대한 명확한 기준.
              - 'good': '보통' 수준의 기준.
              - 'needsImprovement': '노력요함' 수준의 기준.
          - 평가 기준은 구체적이고 관찰 가능하도록 서술해 주세요.
      4.  **메타데이터:** \`lessonTitle\`은 제공된 수업 주제를 바탕으로 창의적이고 흥미롭게 만들어 주세요. \`materials\`는 수업 전반에 필요한 준비물을 목록으로 제공해 주세요.
      5.  **언어:** 모든 내용은 한국어로 작성해야 합니다.
      6.  **출력 형식:** 반드시 제공된 JSON 스키마를 엄격히 준수하여 응답을 생성해 주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: tablePlanSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as TableLessonPlan;

    } catch (error) {
        console.error("Error generating table lesson plan:", error);
        throw new Error("AI로부터 표 형식 지도안을 생성하는 데 실패했습니다. 응답이 유효한 JSON이 아닐 수 있습니다.");
    }
};

const topicResponseSchema = {
    type: Type.OBJECT,
    properties: {
        topics: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Suggested lesson topics as an array of strings."
        }
    },
    required: ["topics"]
};

export const generateLessonTopics = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    const prompt = `
        당신은 한국 학교의 교육과정 설계 전문가입니다.
        아래 정보를 바탕으로, 구체적이고 흥미로운 수업 주제 5~7개를 추천해 주세요.
        주제는 주어진 학년과 과목 수준에 적합해야 합니다.

        - 학년: ${gradeLevel} (${semester})
        - 과목: ${subject}
        - 단원명: ${unitName}

        단원의 여러 측면을 다루는 다양한 주제 목록을 제공해 주세요.
        제공된 스키마를 준수하는 JSON 객체로 응답을 반환해 주세요. 전체 응답은 한국어로 작성되어야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: topicResponseSchema,
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as { topics: string[] };

        if (!parsedResponse.topics || !Array.isArray(parsedResponse.topics)) {
            throw new Error("Invalid response format from AI: 'topics' array not found.");
        }

        return parsedResponse.topics;

    } catch (error) {
        console.error("Error generating lesson topics:", error);
        throw new Error("AI로부터 수업 주제를 생성하는 데 실패했습니다. 응답이 유효한 JSON이 아닐 수 있습니다.");
    }
};

const achievementStandardsResponseSchema = {
    type: Type.OBJECT,
    properties: {
        standards: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "가장 관련성이 높은 성취기준 2~4개를 담은 배열"
        }
    },
    required: ["standards"]
};

export const generateAchievementStandards = async (gradeLevel: string, semester: string, subject: string, unitName: string): Promise<string[]> => {
    
    // ✅ 1. 데이터베이스에서 해당 과목, 학년의 성취기준 목록을 찾습니다.
    const relevantStandardsList = achievementStandardsDB[subject]?.[gradeLevel] || [];

    // ✅ 2. 만약 데이터베이스에 해당 정보가 없으면, 빈 목록을 반환하고 함수를 종료합니다.
    if (relevantStandardsList.length === 0) {
        console.warn(`성취기준 데이터베이스에서 '${gradeLevel}' '${subject}'에 대한 정보를 찾을 수 없습니다.`);
        return [`'${subject}' 과목의 성취기준 데이터가 없습니다. data/achievementStandards.ts 파일을 확인해주세요.`];
    }
    
    // ✅ 3. AI에게 "기억하지 말고, 내가 주는 이 목록 안에서 골라줘" 라고 명확하게 지시합니다.
    const prompt = `
        당신은 2022 개정 교육과정 전문가입니다.
        아래에 제공된 **'공식 성취기준 목록'** 중에서, 주어진 **'단원명'**과 가장 관련성이 높은 것을 2~4개만 골라주세요.

        **[공식 성취기준 목록]**
        ${relevantStandardsList.join('\n')}

        **[사용자 입력 정보]**
        - 학년: ${gradeLevel}
        - 과목: ${subject}
        - 단원명: ${unitName}

        **지침:**
        - 반드시 위에 제공된 **[공식 성취기준 목록]** 안에서만 선택해야 합니다. 목록에 없는 내용을 절대로 만들어서는 안 됩니다.
        - 목록에서 가장 관련성이 높다고 생각되는 2~4개의 성취기준 전체 텍스트를 골라 JSON 형식으로 응답해주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: achievementStandardsResponseSchema,
                temperature: 0.3, // 더 정확한 선택을 위해 온도를 낮춤
            },
        });
        
        const jsonText = response.text.trim();
        const parsedResponse = JSON.parse(jsonText) as { standards: string[] };

        if (!parsedResponse.standards || !Array.isArray(parsedResponse.standards)) {
            throw new Error("AI 응답 형식이 올바르지 않습니다: 'standards' 배열을 찾을 수 없습니다.");
        }

        return parsedResponse.standards;

    } catch (error) {
        console.error("성취기준 추천 생성 중 오류:", error);
        throw new Error("AI로부터 성취기준을 추천받는 데 실패했습니다.");
    }
};

const objectiveOptionsSchema = { // 이름 변경
    type: Type.OBJECT,
    properties: {
        objectives: { // 'objective' -> 'objectives' (복수)
            type: Type.ARRAY, // 'STRING' -> 'ARRAY'
            items: { type: Type.STRING },
            description: "추천 학습 목표 3~5개를 담은 배열"
        }
    },
    required: ["objectives"] // 'objective' -> 'objectives'
};

// [수정] 함수 이름 및 반환 타입 변경
// generateLearningObjective -> generateLearningObjectiveOptions
// Promise<string> -> Promise<string[]>
export const generateLearningObjectiveOptions = async (
    gradeLevel: string, 
    semester: string, 
    subject: string, 
    topic: string,
    // [개선] 성취기준도 함께 보내면 더 정확한 목표가 생성됩니다.
    achievementStandards: string 
): Promise<string[]> => {
    
    // [개선] 프롬프트에 성취기준 문맥 추가
    const standardsContext = achievementStandards 
        ? `\n- 관련 성취기준: ${achievementStandards}`
        : '';

    // [수정] 프롬프트 수정 (3~5개 요청)
    const prompt = `
        당신은 교육 목표 설정 전문가입니다.
        아래 정보를 바탕으로, 학생들이 달성해야 할 구체적인 학습 목표 **3~5개**를 추천해 주세요.
        학습 목표는 '학생들은 ~할 수 있다.' 또는 '~을 설명할 수 있다.'와 같은 형태로, 관찰과 측정이 가능하도록 서술해야 합니다.

        - 학년: ${gradeLevel} (${semester})
        - 과목: ${subject}
        - 수업 주제: ${topic}
        ${standardsContext}

        가장 대표적인 학습 목표 3~5개를 생성하여 JSON 배열 형식으로 제공해 주세요.
        제공된 스키마를 준수하는 JSON 객체로 응답을 반환해 주세요. 전체 응답은 한국어로 작성되어야 합니다.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview", // (사용 중이신 모델)
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: objectiveOptionsSchema, // [수정] 변경된 스키마 사용
                temperature: 0.8,
            },
        });
        
        const jsonText = response.text.trim();
        
        // [수정] 파싱 로직 변경 (객체에서 'objectives' 배열을 추출)
        const parsedResponse = JSON.parse(jsonText) as { objectives: string[] };

        if (!parsedResponse.objectives || !Array.isArray(parsedResponse.objectives)) {
            throw new Error("AI 응답 형식이 올바르지 않습니다: 'objectives' 배열을 찾을 수 없습니다.");
        }

        return parsedResponse.objectives; // [수정] 문자열 배열 반환

    } catch (error) {
        console.error("Error generating learning objective options:", error); // [수정] 로그 메시지
        throw new Error("AI로부터 학습 목표 옵션을 생성하는 데 실패했습니다."); // [수정] 오류 메시지
    }
};

const worksheetSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    levels: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          levelName: { type: Type.STRING, description: "'기본', '보충', 또는 '심화'" },
          title: { type: Type.STRING, description: "해당 수준의 활동 제목" },
          activities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "개별 활동의 소제목 또는 질문" },
                description: { type: Type.STRING, description: "활동에 대한 간단한 설명이나 지시문" },
                content: { type: Type.STRING, description: "활동의 구체적인 내용 (예: 문제, 지문, 과제)" },
                imagePrompt: { // ✅ 이 부분이 올바른지 다시 확인
                  type: Type.STRING,
                  description: "해당 활동 내용에 어울리는 간단한 삽화 이미지 생성을 위한 프롬프트 아이디어 (한국어, 없을 경우 생략 가능)",
                  nullable: true
                }
              },
              required: ["title", "description", "content"]
            }
          }
        },
        required: ["levelName", "title", "activities"]
      }
    }
  },
  required: ["title", "description", "levels"]
};

export const generateWorksheet = async (inputs: LessonPlanInputs): Promise<Worksheet> => {
    const { gradeLevel, semester, subject, topic, objectives, studentCharacteristics } = inputs;

    const prompt = `
        당신은 UDL(보편적 학습 설계)과 수준별 수업에 전문성을 가진 교육 자료 개발 전문가입니다.
        제공된 수업 정보를 바탕으로, 모든 학생이 참여할 수 있는 '수준별 활동지'를 생성해 주세요.

        **수업 정보:**
        - **학년:** ${gradeLevel} (${semester})
        - **과목:** ${subject}
        - **수업 주제:** ${topic}
        - **학습 목표:** ${objectives}
        - **고려할 학생 특성:** ${studentCharacteristics || '일반적인 학생 집단을 가정합니다.'}

        **활동지 생성 지침:**
        1.  **전체 구조:** 활동지는 '제목(title)', '설명(description)', 그리고 3개의 '수준(levels)' 배열로 구성됩니다.
        2.  **수준별 구성:**
            -   **'기본' 수준:** 학습에 어려움을 겪는 학생들을 위한 활동입니다. 핵심 개념을 확인하는 직접적인 질문, 용어 연결하기, 그림 보고 답하기 등 구조화되고 명확한 과제를 1~2개 제시해 주세요. **만약 학생 특성이 제공되었다면, 그 특성에 맞춰 활동을 조정해주세요. (예: 긴 글 읽기 어려움 -> 그림이나 도표 활용)**
            -   **'보충' 수준:** 대부분의 학생들이 성취할 수 있는 활동입니다. 학습한 내용을 적용하고 분석하는 문제, 간단한 자료를 해석하고 자신의 생각을 쓰는 활동 등을 1~2개 제시해 주세요.
            -   **'심화' 수준:** 도전적인 과제가 필요한 학생들을 위한 활동입니다. 비판적 사고, 창의적 문제 해결, 새로운 상황에 개념을 확장 적용하는 개방형 질문이나 프로젝트형 과제를 1~2개 제시해 주세요.
        3.  **활동 내용:** 각 수준(level)에는 '활동 제목(title)'과 '활동 내용(activities)' 배열이 포함되어야 합니다. 각 'activity' 객체에는 소제목(title), 지시문(description), 그리고 구체적인 내용(content)이 있어야 합니다.
        4.  **🎨 이미지 프롬프트 생성 (imagePrompt): 각 활동(activity) 내용에 시각적으로 도움이 될 만한 간단한 삽화 이미지를 상상하여, 그 이미지를 생성할 수 있는 **짧고 명확한 프롬프트 아이디어**를 'imagePrompt' 필드에 한국어로 작성해주세요. (예: "물의 순환 과정을 보여주는 간단한 그림", "웃는 얼굴의 태양 아이콘"). 만약 적절한 이미지 아이디어가 없으면 이 필드는 생략해도 됩니다.**
        5.  **창의성:** 활동지 전체 제목(title)은 수업 주제와 관련하여 학생들이 흥미를 느낄 만하게 만들어 주세요.
        6.  **언어:** 모든 내용은 한국어로 작성해야 합니다.
        7.  **출력 형식:** 반드시 제공된 JSON 스키마를 엄격히 준수하여 응답을 생성해 주세요.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: worksheetSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Worksheet;

    } catch (error) {
        console.error("Error generating worksheet:", error);
        throw new Error("AI로부터 활동지를 생성하는 데 실패했습니다.");
    }
};

const udlEvaluationPlanSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        tasks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    taskTitle: { type: Type.STRING },
                    taskDescription: { type: Type.STRING },
                    udlConnections: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "연결된 UDL 원칙 (예: '다양한 표상 수단 제공')"
                    },
                    levels: {
                        type: Type.OBJECT,
                        properties: {
                            advanced: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING, description: "상 수준 학생을 위한 과제 설명" },
                                    criteria: { type: Type.STRING, description: "상 수준 학생을 위한 평가 기준" }
                                },
                                required: ["description", "criteria"]
                            },
                            proficient: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING, description: "중 수준 학생을 위한 과제 설명" },
                                    criteria: { type: Type.STRING, description: "중 수준 학생을 위한 평가 기준" }
                                },
                                required: ["description", "criteria"]
                            },
                            basic: {
                                type: Type.OBJECT,
                                properties: {
                                    description: { type: Type.STRING, description: "하 수준 학생을 위한 과제 설명" },
                                    criteria: { type: Type.STRING, description: "하 수준 학생을 위한 평가 기준" }
                                },
                                required: ["description", "criteria"]
                            }
                        },
                        required: ["advanced", "proficient", "basic"]
                    }
                },
                required: ["taskTitle", "taskDescription", "udlConnections", "levels"]
            }
        }
    },
    required: ["title", "description", "tasks"]
};

export const generateUdlEvaluationPlan = async (inputs: LessonPlanInputs): Promise<UdlEvaluationPlan> => {
    const { gradeLevel, semester, subject, topic, objectives, studentCharacteristics } = inputs;

    const prompt = `
        당신은 보편적 학습 설계(UDL) 원칙에 기반한 학생 평가 전문가입니다.
        제공된 수업 정보를 바탕으로, 모든 학생의 학습을 평가할 수 있는 'UDL 수준별 평가 계획'을 생성해 주세요.

        **수업 정보:**
        - **학년:** ${gradeLevel} (${semester})
        - **과목:** ${subject}
        - **수업 주제:** ${topic}
        - **학습 목표:** ${objectives}
        - **고려할 학생 특성:** ${studentCharacteristics || '일반적인 학생 집단을 가정합니다.'}

        **평가 계획 생성 지침:**
        1.  **전체 구조:** 평가 계획은 '제목(title)', '설명(description)', 그리고 1~2개의 '평가 과제(tasks)' 배열로 구성됩니다.
        2.  **평가 과제(tasks):**
            -   각 과제는 학습 목표와 직접적으로 연관되어야 합니다.
            -   'taskTitle': 과제의 명확한 제목을 붙여주세요.
            -   'taskDescription': 과제가 무엇인지 구체적으로 설명해주세요.
            -   'udlConnections': 이 과제가 UDL의 어떤 원칙(참여, 표상, 실행)과 관련이 있는지 1~2개 연결하여 설명해주세요.
        3.  **수준별 구성(levels):**
            -   각 과제는 '상(advanced)', '중(proficient)', '하(basic)'의 세 가지 수준으로 나누어 제시해야 합니다.
            -   각 수준별로 학생에게 제공될 '과제 설명(description)'과 교사가 학생을 평가할 '평가 기준(criteria)'을 구체적으로 작성해주세요.
            -   **상(advanced):** 학습 내용을 심화, 확장, 적용하는 도전적인 과제.
            -   **중(proficient):** 학습 목표를 충실히 달성했는지 확인할 수 있는 표준 과제.
            -   **하(basic):** 핵심 개념의 이해를 돕고 성공 경험을 제공하는 지원이 포함된 과제. **만약 학생 특성이 제공되었다면, '하' 수준의 과제는 그 학생의 특성을 고려하여 맞춤형으로 설계해야 합니다.**
        4.  **창의성:** 평가 계획의 전체 제목(title)은 수업 주제와 관련하여 흥미롭게 만들어 주세요.
        5.  **언어:** 모든 내용은 한국어로 작성해야 합니다.
        6.  **출력 형식:** 반드시 제공된 JSON 스키마를 엄격히 준수하여 응답을 생성해 주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: udlEvaluationPlanSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as UdlEvaluationPlan;

    } catch (error) {
        console.error("Error generating UDL evaluation plan:", error);
        throw new Error("AI로부터 UDL 평가 계획을 생성하는 데 실패했습니다.");
    }
};

const processEvaluationWorksheetSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING },
        studentInfo: {
            type: Type.OBJECT,
            properties: {
                grade: { type: Type.STRING, description: "학년 (예: '학년')" },
                class: { type: Type.STRING, description: "반 (예: '반')" },
                number: { type: Type.STRING, description: "번호 (예: '번')" },
                name: { type: Type.STRING, description: "이름 (예: '이름: ')" },
            },
            required: ["grade", "class", "number", "name"]
        },
        overallDescription: { type: Type.STRING },
        evaluationItems: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    criterion: { type: Type.STRING },
                    levels: {
                        type: Type.OBJECT,
                        properties: {
                            excellent: { type: Type.STRING },
                            good: { type: Type.STRING },
                            needsImprovement: { type: Type.STRING }
                        },
                        required: ["excellent", "good", "needsImprovement"]
                    }
                },
                required: ["criterion", "levels"]
            }
        },
        overallFeedback: {
            type: Type.OBJECT,
            properties: {
                teacherComment: { type: Type.STRING },
                studentReflection: { type: Type.STRING }
            },
            required: ["teacherComment", "studentReflection"]
        }
    },
    required: ["title", "studentInfo", "overallDescription", "evaluationItems", "overallFeedback"]
};

export const generateProcessEvaluationWorksheet = async (inputs: LessonPlanInputs, udlEvaluationPlan?: UdlEvaluationPlan): Promise<ProcessEvaluationWorksheet> => {
    const { gradeLevel, semester, subject, topic, objectives } = inputs;

    const evaluationContext = udlEvaluationPlan 
        ? `
        **참고할 UDL 평가 계획:**
        - 평가 계획 제목: ${udlEvaluationPlan.title}
        - 평가 과제:
          ${udlEvaluationPlan.tasks.map(task => `  - ${task.taskTitle}: ${task.taskDescription}`).join('\n')}
        `
        : "기존에 생성된 UDL 평가 계획이 없습니다. 학습 목표를 중심으로 평가지를 구성해 주세요.";

    const prompt = `
        당신은 한국 초등학교의 과정 중심 평가 자료 제작 전문가입니다.
        아래 수업 정보와 UDL 평가 계획을 바탕으로, 학생의 학습 과정을 구체적으로 관찰하고 평가할 수 있는 '과정중심평가지'를 생성해 주세요.

        **수업 정보:**
        - 학년: ${gradeLevel} (${semester})
        - 과목: ${subject}
        - 수업 주제: ${topic}
        - 학습 목표: ${objectives}

        ${evaluationContext}

        **평가지 생성 지침:**
        1.  **전체 구조:** 평가지의 제목, 학생 정보 기입란, 전체 설명, 평가 항목 표, 그리고 종합 의견란으로 구성됩니다.
        2.  **평가 항목 (evaluationItems):**
            -   학습 목표와 UDL 평가 과제를 기반으로 2~4개의 핵심적인 '평가 기준(criterion)'을 설정해 주세요. 평가 기준은 학생의 행동이나 산출물을 통해 관찰 가능한 형태로 서술되어야 합니다.
            -   각 평가 기준에 대해 '상(excellent)', '중(good)', '하(needsImprovement)' 세 단계의 수준별 성취 내용을 구체적으로 기술해 주세요.
        3.  **학생 정보:** 학생이 직접 기입할 수 있도록 '학년', '반', '번호', '이름' 필드를 포함하되, 내용은 비워두고 레이블만 제공해주세요 (예: '학년', '반' 등). 'name' 필드는 '이름: '으로 해주세요.
        4.  **종합 의견:** 교사가 종합적인 피드백을 작성할 '교사 종합 의견(teacherComment)'과 학생이 스스로를 성찰해볼 '자기 성찰(studentReflection)' 항목을 포함하고, 내용은 비워주세요.
        5.  **언어 및 형식:** 모든 내용은 한국어로 작성하고, 반드시 제공된 JSON 스키마를 엄격히 준수하여 응답을 생성해 주세요.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: processEvaluationWorksheetSchema,
                temperature: 0.7,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as ProcessEvaluationWorksheet;

        

    } catch (error) {
        console.error("Error generating process evaluation worksheet:", error);
        throw new Error("AI로부터 과정중심평가지를 생성하는 데 실패했습니다.");
    }
};

export const reviseUDLLessonPlan = async (
  originalPlan: GeneratedLessonPlan,
  userFeedback: string
): Promise<GeneratedLessonPlan> => {
    // 재시도 설정 (재시도 로봇 없이 직접 구현)
    const maxRetries = 2;
    const delayMs = 1500;

    for (let i = 0; i <= maxRetries; i++) {
        try {
            const planToSend = { ...originalPlan };
            delete planToSend.id; 
            const prompt = `
              당신은 UDL 수업 설계 전문가이자, 기존 지도안을 사용자의 피드백에 따라 수정하는 뛰어난 편집자입니다.

              아래에 제공된 **'기존 UDL 지도안'**을 바탕으로, 사용자의 **'수정 요청 사항'**을 반영하여 **개선된 UDL 지도안**을 생성해주세요.
          
              **[기존 UDL 지도안 (JSON 형식)]**
              ${JSON.stringify(planToSend)}
          
              **[사용자 수정 요청 사항]**
              ${userFeedback}
          
              **수정 지침:**
              1.  기존 지도안의 전체 구조와 JSON 스키마 형식(${JSON.stringify(responseSchema)})은 **반드시 그대로 유지**해야 합니다.
              2.  사용자의 수정 요청 사항을 **창의적이면서도 교육적으로 타당하게** 반영하여 내용을 수정하거나 추가/삭제해주세요. (예: '퀴즈 추가' 요청 시, 단순히 퀴즈만 넣는 것이 아니라 수업 흐름에 맞게 자연스럽게 배치)
              3.  결과물은 반드시 기존과 동일한 JSON 스키마 형식(${JSON.stringify(responseSchema)})으로 반환해야 합니다. 모든 내용은 한국어로 작성해주세요.
              4.  결과물에는 **설명이나 \`\`\`json \`\`\` 같은 불필요한 텍스트 없이 순수한 JSON 객체만** 포함해야 합니다.
            `;

            // ✅ 선생님의 기존 API 호출 방식 사용
            // @ts-ignore - response 타입 추론을 위해 무시
            const response = await ai.models.generateContent({
                model: "gemini-3-pro-preview", // Pro 모델 사용
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema, // UDL 지도안과 동일한 서식 사용
                    temperature: 0.8,
                },
            });

            // @ts-ignore - response.text 타입 추론을 위해 무시
            let jsonText = response.text?.trim(); // 최신 라이브러리의 .text() 대신 기존 방식 유지
            if (!jsonText) throw new Error("AI로부터 빈 응답을 받았습니다.");
        
            if (jsonText.startsWith("```json")) {
              jsonText = jsonText.substring(7, jsonText.length - 3);
            }
            const parsed = JSON.parse(jsonText) as Partial<GeneratedLessonPlan>;
            
            // 필수 필드 검증 강화
             const requiredKeys: (keyof GeneratedLessonPlan)[] = [
               "lessonTitle", "subject", "gradeLevel", "learningObjectives", 
               "detailedObjectives", "contextAnalysis", "learnerAnalysis", 
               "udlPrinciples", "assessment", "multimedia_resources"
             ];
             const missingKeys = requiredKeys.filter(key => !(key in parsed));
             if (missingKeys.length > 0) {
                 console.error("AI revision response is missing required keys:", missingKeys, parsed);
                 throw new Error(`AI가 수정한 지도안에 필수 항목이 누락되었습니다: ${missingKeys.join(', ')}`);
             }

            return parsed as GeneratedLessonPlan; // 성공 시 결과 반환

        } catch (error: any) {
             if (i === maxRetries) {
                console.error("지도안 수정 중 모든 재시도 실패:", error);
                throw new Error("AI로부터 지도안을 수정하는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
            console.warn(`지도안 수정 실패 (${i + 1}차 시도). ${delayMs / 1000}초 후 재시도합니다...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
     throw new Error("AI로부터 지도안을 수정하는 데 실패했습니다.");
};

export const generateImageForActivity = async (
  activityTitle: string,
  activityContent: string,
  originalImagePrompt: string
): Promise<string> => {
  const maxRetries = 1;
  const delayMs = 2000;

  // ⚠️ Imagen 모델은 001이 가장 안정적입니다. (API Key 방식)
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${process.env.API_KEY}`;

  const detailedPrompt = `
    Create a simple, clear educational illustration for an elementary school worksheet.
    
    [Context]
    - Activity Title: "${activityTitle}"
    - Visual Idea: "${originalImagePrompt}"
    - Content Context: "${activityContent.substring(0, 100)}..." 
    
    [Style Guide]
    - Style: Clean line art or simple flat vector illustration.
    - Background: Pure white background.
    - Target Audience: Elementary school students.
    
    [Critical Rules]
    - ABSOLUTELY NO TEXT, NO CHARACTERS, NO LETTERS inside the image.
    - Focus ONLY on visual elements.
  `.trim();

  const payload = {
    instances: [{ prompt: detailedPrompt }],
    parameters: {
        sampleCount: 1,
        negativePrompt: "text, writing, letters, numbers, symbols, watermark, blurry, distorted"
    }
  };

  for (let i = 0; i <= maxRetries; i++) {
    try {
      console.log(`🖼️ Image Gen Attempt ${i + 1}`);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Imagen API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
      } else {
        throw new Error("No image data in response");
      }

    } catch (error: any) {
      console.error(`Image Gen Error (${i + 1}):`, error);
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Image generation failed");
};