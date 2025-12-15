// api/generate-image.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from "@google/genai";

// ✅ [핵심] GoogleGenAI SDK를 사용하여 구현
const generateImageForActivity = async (
  activityTitle: string,
  activityContent: string,
  originalImagePrompt: string
): Promise<string> => {

  // Vercel 환경변수에서 API Key를 가져옵니다.
  // 로컬 테스트 시 process.env가 없을 수 있으므로 주의 (이전 코드 로직 유지)
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API Key가 환경변수에 설정되지 않았습니다.");
  }

  const ai = new GoogleGenAI({ apiKey });

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

  // Nano Banana Pro (Gemini 3 Pro Image) 모델 사용
  // 모델 ID: gemini-3-pro-image-preview
  const modelId = "gemini-3-pro-image-preview";

  try {
    console.log(`🖼️ Image Gen Request to ${modelId}`);

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
        // Nano Banana Pro does not support responseMimeType: "image/png" in generateContent config
        sampleCount: 1,
      } as any // 타입 정의가 최신이 아닐 수 있어 any로 우회
    });

    // 응답 처리
    // Gemini Image generation returns Inline Data or Byte code
    // SDK의 응답 구조 확인 필요. 보통 response.text()는 텍스트를 주지만, 이미지는 parts 안에 inlineData로 올 수 있음.

    // SDK 최신 버전에 따라 다를 수 있으므로, raw response 구조를 확인하며 처리

    // 1. 만약 text로 base64가 오는 경우 (일부 모델)
    // 2. candidates[0].content.parts[0].inlineData (표준 멀티모달 반환)

    // @google/genai SDK의 경우:
    // response.candidates[0].content.parts[0].inlineData

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const firstPart = candidates[0].content?.parts?.[0];

    if (firstPart?.inlineData?.data) {
      return `data:${firstPart.inlineData.mimeType || 'image/png'};base64,${firstPart.inlineData.data}`;
    }

    // 만약 text 필드에 바이너리가 아닌 텍스트(거절 메시지 등)가 있다면
    if (firstPart?.text) {
      console.warn("Image generation returned text instead of image:", firstPart.text);
      throw new Error(`Image generation failed: ${firstPart.text}`);
    }

    throw new Error("No image data found in response");

  } catch (error: any) {
    console.error("Image Gen Error:", error);
    // 상세한 에러 로깅
    if (error.response) {
      console.error("Error Response:", JSON.stringify(error.response, null, 2));
    }
    throw error;
  }
};

// --- 메인 핸들러 ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content, imagePrompt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    // 2. 위에 정의한 내부 함수 호출
    const base64Image = await generateImageForActivity(title, content, imagePrompt);

    // 3. 성공 응답
    return res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "서버 내부 오류 발생" });
  }
}