// api/generate-image.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
// ⚠️ 중요: geminiService가 있는 경로를 정확히 맞춰주세요.
// api 폴더가 루트에 있으므로, src 폴더로 들어가려면 '../src/...'가 됩니다.
import { generateImageForActivity } from '../services/geminiService';

// Vercel이 알아듣는 표준 함수 형태입니다.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. POST 요청인지 확인
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { title, content, imagePrompt } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: '필수 정보(제목, 내용)가 누락되었습니다.' });
    }

    // 2. 선생님이 만드신 Gemini 서비스 호출
    const base64Image = await generateImageForActivity(title, content, imagePrompt);

    // 3. 성공 응답 보내기
    return res.status(200).json({ image: base64Image });

  } catch (error: any) {
    console.error("API Error:", error);
    return res.status(500).json({ error: error.message || "이미지 생성 실패" });
  }
}