import { VercelRequest, VercelResponse } from '@vercel/node';

// ✅ 독립형 이미지 생성 함수
const generateImageForActivity = async (
  activityTitle: string,
  activityContent: string,
  originalImagePrompt: string
): Promise<string> => {
  const maxRetries = 1;
  const delayMs = 2000;
  
  // Vercel 환경변수에서 API Key 가져오기
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
      throw new Error("API Key가 설정되지 않았습니다.");
  }

  // ✅ [핵심 수정] 선생님이 찾으신 모델 ID 적용!
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:predict?key=${apiKey}`;

  // 프롬프트 설정 (고화질 유지)
  const detailedPrompt = `
    Create a high-quality, flat vector art illustration suitable for an elementary school worksheet.
    
    [Context]
    - Activity Title: "${activityTitle}"
    - Visual Idea: "${originalImagePrompt}"
    
    [Style Guide]
    - Style: Clean line art or simple flat vector illustration.
    - Background: Pure white background.
    - Target Audience: Elementary school students.
    
    [Critical Rules]
    - ABSOLUTELY NO TEXT, NO CHARACTERS, NO LETTERS inside the image.
    - Focus ONLY on visual elements.
  `.trim();

  // 데이터 전송 양식
  const payload = {
    instances: [{ prompt: detailedPrompt }],
    parameters: {
        sampleCount: 1,
        // 이 모델은 aspectRatio(비율) 설정을 지원할 수도 있습니다. (1:1 권장)
        aspectRatio: "1:1",
        negativePrompt: "text, writing, letters, numbers, symbols, watermark, blurry, distorted"
    }
  };

  for (let i = 0; i <= maxRetries; i++) {
    try {
      console.log(`🖼️ Image Gen Attempt ${i + 1} with gemini-3-pro-image-preview`);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // 에러가 나면 로그에 자세히 찍히도록 함
        console.error("API Error Detail:", JSON.stringify(errorData, null, 2));
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();

      // 응답 구조 확인 (모델마다 다를 수 있어서 안전하게 처리)
      if (result.predictions && result.predictions[0]?.bytesBase64Encoded) {
        return `data:image/png;base64,${result.predictions[0].bytesBase64Encoded}`;
      } else {
        console.error("Unexpected Response Structure:", result);
        throw new Error("이미지 데이터가 응답에 없습니다.");
      }

    } catch (error: any) {
      console.error(`Error (${i + 1}):`, error);
      if (i === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  throw new Error("Image generation failed");
};

// --- 메인 핸들러 ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content, imagePrompt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
    }

    const base64Image = await generateImageForActivity(title, content, imagePrompt);
    return res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: error.message || "서버 내부 오류 발생" });
  }
}