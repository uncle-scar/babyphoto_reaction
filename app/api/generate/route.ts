import { NextRequest, NextResponse } from 'next/server';
import { generateReactionsWithGemini } from '@/lib/gemini-ai';
import { uploadImageToStorage } from '@/lib/storage';
import { createGenerationSession, saveReactionResults } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, options } = body;

    if (!image) {
      return NextResponse.json(
        { error: '이미지가 필요합니다.' },
        { status: 400 }
      );
    }

    let imagePath: string | undefined;
    let reactions: string[] = [];

    // 런타임에 환경 변수 체크
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const useAI = googleApiKey && googleApiKey !== 'your_google_api_key_here';

    console.log('[API] Google API Key exists:', !!googleApiKey);
    console.log('[API] Using AI:', useAI);

    // 이미지를 Supabase Storage에 업로드
    try {
      const uploadResult = await uploadImageToStorage(image);
      if (uploadResult) {
        imagePath = uploadResult.path;
      }
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
    }

    // AI 또는 Mock 데이터로 리액션 생성
    if (useAI) {
      try {
        console.log('[API] Attempting Gemini generation...');
        reactions = await generateReactionsWithGemini(image, options, options.variant);
        console.log('[API] Gemini generation successful:', reactions.length, 'reactions');
      } catch (aiError) {
        console.error('AI generation failed, falling back to mock:', aiError);
        reactions = generateMockReactions(options, options.variant);
      }
    } else {
      console.log('[API] Using mock data (no API key)');
      reactions = generateMockReactions(options, options.variant);
    }

    // 결과를 데이터베이스에 저장
    const results = reactions.map((text, index) => ({
      id: `${Date.now()}-${index}`,
      text,
      variantType: options.variant || 'default',
      createdAt: new Date().toISOString(),
    }));

    try {
      const session = await createGenerationSession(options, imagePath);
      if (session) {
        await saveReactionResults(session.id, results);
      }
    } catch (dbError) {
      console.error('Database save error:', dbError);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('생성 오류:', error);
    return NextResponse.json(
      { error: '리액션 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

function generateMockReactions(options: any, variant?: string): string[] {
  const { toneLevel, intimacyLevel, focusType, speechPreset, emojiLevel } = options;

  const reactions = [];
  const emojiMap = ['', '😊', '😍 ❤️', '🥰 💕 ✨'];
  const emoji = emojiMap[Math.min(emojiLevel, 3)] || '';

  // variant에 따라 톤 조절
  let adjustedTone = toneLevel;
  if (variant === 'calmer') adjustedTone = Math.max(1, toneLevel - 1);
  if (variant === 'excited') adjustedTone = Math.min(5, toneLevel + 1);

  // variant별 다른 리액션 세트
  const reactionSets = {
    calm: [
      `정말 귀엽네요 ${emoji}`,
      `표정이 참 밝아 보여요 ${emoji}`,
      `사랑스러운 모습이네요 ${emoji}`,
      `보기 좋네요 ${emoji}`,
    ],
    normal: [
      `너무 귀엽다 ${emoji}`,
      `눈웃음이 정말 예쁘네요 ${emoji}`,
      `완전 사랑스럽네 ${emoji}`,
      `귀여워 죽겠다 ${emoji}`,
    ],
    excited: [
      `아니 이 볼 뭐야 진짜 찹쌀떡이 따로 없네 ${emoji}`,
      `완전 천사 아니야?? 너무 귀여워 ${emoji}`,
      `헐 대박 귀여워 미쳤다 ${emoji}`,
      `세상에 이렇게 귀여울 수가 ${emoji}`,
    ],
  };

  // variant에 따른 추가 리액션
  if (variant === 'shorter') {
    reactions.push({
      id: '1',
      text: `귀여워 ${emoji}`.trim(),
      variantType: 'short',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '2',
      text: `천사다 ${emoji}`.trim(),
      variantType: 'short',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '3',
      text: `사랑스럽네 ${emoji}`.trim(),
      variantType: 'short',
      createdAt: new Date().toISOString(),
    });
  } else if (variant === 'longer') {
    reactions.push({
      id: '1',
      text: `와 진짜 너무 귀엽다... 볼도 통통하고 눈웃음도 예쁘고 완전 사랑스러워 ${emoji}`.trim(),
      variantType: 'long',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '2',
      text: `표정이 너무 밝아서 보는 사람까지 기분 좋아지네요. 정말 예쁘게 잘 나왔어요 ${emoji}`.trim(),
      variantType: 'long',
      createdAt: new Date().toISOString(),
    });
  } else if (variant === 'specific') {
    reactions.push({
      id: '1',
      text: `눈 깜빡이는 거 봐 완전 귀여워 ${emoji}`.trim(),
      variantType: 'specific',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '2',
      text: `입꼬리 올라간 거 보니까 진짜 행복해 보인다 ${emoji}`.trim(),
      variantType: 'specific',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '3',
      text: `손 모양 너무 귀엽네 ㅋㅋㅋ ${emoji}`.trim(),
      variantType: 'specific',
      createdAt: new Date().toISOString(),
    });
  } else if (variant === 'simple') {
    reactions.push({
      id: '1',
      text: `귀엽네요 ${emoji}`.trim(),
      variantType: 'simple',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '2',
      text: `예쁘게 잘 나왔네요 ${emoji}`.trim(),
      variantType: 'simple',
      createdAt: new Date().toISOString(),
    });
    reactions.push({
      id: '3',
      text: `사랑스럽네요 ${emoji}`.trim(),
      variantType: 'simple',
      createdAt: new Date().toISOString(),
    });
  } else {
    // 기본 생성 (variant 없을 때)
    let selectedSet = reactionSets.normal;
    if (adjustedTone <= 2) selectedSet = reactionSets.calm;
    else if (adjustedTone >= 4) selectedSet = reactionSets.excited;

    const randomIndex = Math.floor(Math.random() * selectedSet.length);
    const startIndex = randomIndex;
    
    for (let i = 0; i < 3; i++) {
      const index = (startIndex + i) % selectedSet.length;
      reactions.push({
        id: `${i + 1}`,
        text: selectedSet[index].trim(),
        variantType: adjustedTone <= 2 ? 'calm' : adjustedTone >= 4 ? 'excited' : 'normal',
        createdAt: new Date().toISOString(),
      });
    }
  }

  // variant가 없을 때만 포커스와 친밀도 기반 추가 리액션 생성
  if (!variant) {
    if (focusType === 'cheeks') {
      reactions.push({
        id: `${reactions.length + 1}`,
        text: `볼이 통통해서 너무 귀엽다 ${emoji}`.trim(),
        variantType: 'focus',
        createdAt: new Date().toISOString(),
      });
    } else if (focusType === 'eyes') {
      reactions.push({
        id: `${reactions.length + 1}`,
        text: `눈망울이 반짝반짝 빛나네 ${emoji}`.trim(),
        variantType: 'focus',
        createdAt: new Date().toISOString(),
      });
    } else if (focusType === 'expression') {
      reactions.push({
        id: `${reactions.length + 1}`,
        text: `웃는 표정이 정말 사랑스럽네요 ${emoji}`.trim(),
        variantType: 'focus',
        createdAt: new Date().toISOString(),
      });
    }

    if (intimacyLevel >= 4 && reactions.length < 4) {
      reactions.push({
        id: `${reactions.length + 1}`,
        text: `우리 아기 진짜 세상 제일 귀엽다 ${emoji}`.trim(),
        variantType: 'intimate',
        createdAt: new Date().toISOString(),
      });
    }

    if (speechPreset === 'funny' && reactions.length < 4) {
      reactions.push({
        id: `${reactions.length + 1}`,
        text: `이건 반칙이지 ㅋㅋㅋ 너무 귀여워서 심장 아파 ${emoji}`.trim(),
        variantType: 'funny',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return reactions.slice(0, 4).map(r => r.text);
}
