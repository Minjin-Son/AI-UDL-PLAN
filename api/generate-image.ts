// api/generate-image.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

const generateImageForActivity = async (
  activityTitle: string,
  activityContent: string,
  originalImagePrompt: string,
  isWorksheet: boolean = false,
  metadata?: any,
  levelName?: string,
  activities?: any[]
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key가 환경변수에 설정되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const gradeInfo = metadata?.grade || "초등학교";
  const subjectInfo = metadata?.subject || "수업";
  const topicInfo = metadata?.topic || originalImagePrompt || activityTitle;
  const levelInfo = levelName || "기본";

  let detailedPrompt = "";

  if (isWorksheet) {
    const activitySummaries = Array.isArray(activities)
      ? activities.map((a, i) => `${i + 1}. [${a.title || '활동'}] ${a.content || a.description || ''}`).join('\n')
      : `${activityTitle}: ${activityContent}`;

    detailedPrompt = `
      Create a high-resolution, printable A4 educational worksheet for elementary/middle school students.
      
      [Header Information]
      - Grade & Subject: ${gradeInfo} ${subjectInfo}
      - Worksheet Level: [${levelInfo} 과정]
      - Lesson Topic: "${topicInfo}"
      - Title: "${activityTitle}"
      
      [Worksheet Content & Structure]
      - Top section: Clear title header with student information boxes (Grade: __, Class: __, No: __, Name: __).
      - Main section: Cleanly structured questions and activities based on:
${activitySummaries}
      - Includes clear geometric answer boxes, ruled lines for writing answers, and neat table grids.
      - Includes a clean black-and-white educational diagram or scientific illustration relevant to "${topicInfo}".
      
      [Crucial Visual Rules - MUST FOLLOW]
      1. BACKGROUND: Pure, solid white background ONLY (#FFFFFF). Absolutely NO wooden desk, NO background table, NO drop shadows, NO borders or environment outside the white paper.
      2. FORMAT: Portrait A4 paper layout (3:4 aspect ratio), clean black line art style.
      3. QUALITY: High quality, clean typography, ready for printing directly on A4 paper for actual classroom use.
    `.trim();
  } else {
    detailedPrompt = `
      Create a clean, simple educational illustration for an elementary school worksheet.
      
      [Subject & Topic]
      - Topic: "${topicInfo}"
      - Activity: "${activityTitle}"
      - Visual Details: "${originalImagePrompt}"
      
      [Crucial Visual Rules]
      1. BACKGROUND: Pure, solid white background ONLY (#FFFFFF). Absolutely NO background scene, NO shadows.
      2. STYLE: Clean line art or simple flat vector illustration with bright, clear colors.
      3. NO TEXT: Absolutely NO text, NO letters, NO numbers inside the image.
    `.trim();
  }

  // 이미지 생성 전용 모델로 gemini-3.1-flash-lite-image 통일
  const candidateModels = [
    { type: 'genai', name: 'gemini-3.1-flash-lite-image' },
  ];

  let lastError: any = null;

  for (const item of candidateModels) {
    try {
      console.log(`🖼️ Image Gen Request to ${item.name} (Type: ${item.type}, Worksheet Mode: ${isWorksheet})`);

      const response = await ai.models.generateContent({
        model: item.name,
        contents: [
          {
            role: "user",
            parts: [{ text: detailedPrompt }]
          }
        ],
        config: {
          sampleCount: 1,
        } as any
      });

      const candidates = response.candidates;
      if (candidates && candidates.length > 0) {
        const firstPart = candidates[0].content?.parts?.[0];
        if (firstPart?.inlineData?.data) {
          return `data:${firstPart.inlineData.mimeType || 'image/png'};base64,${firstPart.inlineData.data}`;
        }
      }
    } catch (err: any) {
      console.warn(`Model ${item.name} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "이미지 생성 실패: gemini-3.1-flash-lite-image 모델에서 유효한 이미지 응답을 받지 못했습니다.");
};

// --- 메인 핸들러 ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content, imagePrompt, isWorksheet, metadata, levelName, activities } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const base64Image = await generateImageForActivity(
      title,
      content,
      imagePrompt,
      isWorksheet,
      metadata,
      levelName,
      activities
    );

    return res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "서버 내부 오류 발생" });
  }
}