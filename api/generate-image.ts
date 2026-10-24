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
      ? activities.map((a, i) => {
          const desc = a.description || '';
          const body = a.content || '';
          const tableText = a.tableData
            ? ` [표 항목: ${(a.tableData.headers || []).join(' | ')} / ${(a.tableData.rows || []).map((r: string[]) => r.join(' | ')).join('; ')}]`
            : '';
          return `${i + 1}. [${a.title || '활동'}] ${desc} ${body}${tableText}`.trim();
        }).join('\n')
      : `${activityTitle}: ${activityContent}`;

    detailedPrompt = `
      Create a high-resolution, printable A4 educational worksheet for elementary/middle school students.
      
      [Header Information]
      - Grade & Subject: ${gradeInfo} ${subjectInfo} [${levelInfo} 과정]
      - Main Title: "${topicInfo}"
      
      [Worksheet Content & Structure]
      - Top section: Clean, large title header ("${topicInfo}") and a neat student information box (학년: __ 반: __ 번호: __ 이름: ____). Do NOT add any small maps with text or character speech bubbles in the header.
      - Main section: Cleanly structured questions, tables, and answer boxes based ONLY on the following content:
${activitySummaries}
      - Use clean geometric answer boxes, ruled lines for writing answers, and neat table grids.
      
      [Crucial Visual & Typography Rules - MUST FOLLOW STRICTLY]
      1. NO GARBLED OR TINY TEXT (글자 깨짐 및 임의 지명/말풍선 절대 금지):
         - NEVER put any text, labels, region/place names (지명), or speech bubbles (말풍선) inside illustrations, maps, icons, or decorative borders at the top or bottom of the worksheet.
         - If any small icon or simple line-art illustration is included, it MUST be 100% pure visual line art with ZERO text or letters inside or around it.
         - Keep the bottom drawing/answer box completely clean and simple without decorative speech bubbles, tags, or random labels in the corners.
      2. EXACT TEXT ONLY:
         - Write ONLY the exact Korean text provided above. Do NOT invent or hallucinate extra place names, extra labels, or extra small annotations anywhere on the worksheet.
         - All Korean characters must be rendered in large, crisp, clear, standard Korean Sans-Serif (Gothic) typography so every character is 100% legible and accurate.
      3. BACKGROUND & FORMAT:
         - Pure, solid white background ONLY (#FFFFFF). Absolutely NO wooden desk, NO background table, NO drop shadows, NO borders outside the white paper.
         - Portrait A4 paper layout (3:4 aspect ratio), clean black line art style, ready for direct classroom printing.
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
      3. NO TEXT: Absolutely NO text, NO letters, NO numbers, NO speech bubbles, and NO labels inside the image.
    `.trim();
  }

  // 이미지 생성 전용 모델로 gemini-nano-banana-2.1 통일
  const candidateModels = [
    { type: 'genai', name: 'gemini-nano-banana-2.1' },
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
        const parts = candidates[0].content?.parts || [];
        const imagePart = parts.find((p: any) => p?.inlineData?.data);
        if (imagePart?.inlineData?.data) {
          return `data:${imagePart.inlineData.mimeType || 'image/png'};base64,${imagePart.inlineData.data}`;
        }
      }
    } catch (err: any) {
      console.warn(`Model ${item.name} failed:`, err?.message || err);
      lastError = err;
    }
  }

  throw new Error(lastError?.message || "이미지 생성 실패: gemini-nano-banana-2.1 모델에서 유효한 이미지 응답을 받지 못했습니다.");
};

// --- 메인 핸들러 ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content, imagePrompt, isWorksheet, metadata, levelName, activities } = req.body;

    const safeTitle = title || imagePrompt || '활동지';
    const safeContent = content || activities?.[0]?.description || imagePrompt || safeTitle;

    if (!safeTitle) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const base64Image = await generateImageForActivity(
      safeTitle,
      safeContent,
      imagePrompt || safeTitle,
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
