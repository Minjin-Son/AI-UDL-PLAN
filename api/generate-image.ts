// api/generate-image.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// ✅ [핵심] GoogleGenAI SDK를 사용하여 구현
const generateImageForActivity = async (
  activityTitle: string,
  activityContent: string,
  originalImagePrompt: string,
  isWorksheet: boolean = false // ✅ 새로운 플래그 추가
): Promise<string> => {

  // Vercel 환경변수에서 API Key를 가져옵니다.
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key가 환경변수에 설정되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });

  let detailedPrompt = "";

  if (isWorksheet) {
    // ✅ 활동지 자체를 생성하는 프롬프트
    detailedPrompt = `
        Create a high-quality, realistic image of a printed educational worksheet.
        
        [Context]
        - Subject/Title: "${activityTitle}"
        - Topic: "${originalImagePrompt}"
        - Content hint: "${activityContent.substring(0, 100)}..."
        
        [Visual Style]
        - A4 Paper layout, clean black and white lines.
        - Structure: Title at top, clear header with name/grade lines.
        - Content: Organized sections with geometric shapes for questions, empty boxes for answers, lines for writing.
        - Diagrams: Include a clear, scientific or educational diagram relevant to the topic in the center.
        - Text: Use illegible scribbles or block text for layout purposes (pseudotext), but keep the layout very professional and structured.
        - Background: Pure white paper.
        
        [Goal]
        - The image should look like a professional teacher's handout ready to be printed.
      `.trim();
  } else {
    // 기존의 삽화 프롬프트
    detailedPrompt = `
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
  }

  // Nano Banana 2 모델 사용
  const modelId = "nano-banana-2";

  try {
    console.log(`🖼️ Image Gen Request to ${modelId} (Worksheet Mode: ${isWorksheet})`);

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        {
          role: "user",
          parts: [
            { text: detailedPrompt }
          ]
        }
      ],
      config: {
        sampleCount: 1,
      } as any
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const firstPart = candidates[0].content?.parts?.[0];

    if (firstPart?.inlineData?.data) {
      return `data:${firstPart.inlineData.mimeType || 'image/png'};base64,${firstPart.inlineData.data}`;
    }

    if (firstPart?.text) {
      console.warn("Image generation returned text instead of image:", firstPart.text);
      throw new Error(`Image generation failed: ${firstPart.text}`);
    }

    throw new Error("No image data found in response");

  } catch (error: any) {
    console.error("Image Gen Error:", error);
    if (error.response) {
      console.error("Error Response:", JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
};

// --- 메인 핸들러 ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content, imagePrompt, isWorksheet } = req.body; // ✅ isWorksheet 파라미터 받기

    if (!title || !content) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const base64Image = await generateImageForActivity(title, content, imagePrompt, isWorksheet);

    return res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "서버 내부 오류 발생" });
  }
}