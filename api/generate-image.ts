// api/generate-image.ts
import { VercelRequest, VercelResponse } from '@vercel/node';

// ✅ [핵심] src에서 가져오지 않고, 여기에 직접 함수를 넣었습니다. (독립 실행)
const generateImageForActivity = async (
  activityTitle: string,
  activityContent: string,
  originalImagePrompt: string
): Promise<string> => {
  const maxRetries = 1;
  const delayMs = 2000;
  
  // Vercel 환경변수에서 API Key를 가져옵니다.
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
      throw new Error("API Key가 Vercel 환경변수에 설정되지 않았습니다.");
  }

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;

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