import { GoogleGenerativeAI } from '@google/generative-ai';
import { GenerationOptions } from './types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export function buildGeminiPrompt(options: GenerationOptions): string {
  const toneMap: Record<number, string> = {
    1: '매우 점잖고 차분한',
    2: '담백하고 정중한',
    3: '다정하고 따뜻한',
    4: '신나고 활기찬',
    5: '호들갑스럽고 과장된',
  };

  const intimacyMap: Record<number, string> = {
    1: '어색한 지인에게 쓸',
    2: '가벼운 친구에게 쓸',
    3: '친한 친구에게 쓸',
    4: '매우 친한 친구에게 쓸',
    5: '가족처럼 친한 사람에게 쓸',
  };

  const focusMap: Record<string, string> = {
    auto: '자동으로 포인트를 찾아서',
    face: '얼굴을 중심으로',
    expression: '표정을 중심으로',
    eyes: '눈웃음을 중심으로',
    cheeks: '볼살을 중심으로',
    hands: '손 모양을 중심으로',
  };

  const speechMap: Record<string, string> = {
    friendly: '다정한 친구처럼',
    aunt_uncle: '이모/삼촌처럼',
    funny: '웃긴 드립을 섞어서',
    formal: '정중하고 격식있게',
  };

  const emojiGuidance = options.emojiLevel === 0 
    ? '이모지를 사용하지 마세요.' 
    : options.emojiLevel === 1 
    ? '이모지를 최소한으로 사용하세요 (1개 정도).'
    : options.emojiLevel === 2
    ? '이모지를 적당히 사용하세요 (2-3개 정도).'
    : '이모지를 풍부하게 사용하세요 (3개 이상).';

  return `당신은 단톡방에서 아이 사진에 반응하는 사람입니다.
다음 조건으로 리액션을 3~4개 생성해주세요:

- 톤: ${toneMap[options.toneLevel]}
- 관계: ${intimacyMap[options.intimacyLevel]}
- 포커스: ${focusMap[options.focusType || 'auto']}
- 말투: ${speechMap[options.speechPreset || 'friendly']}
- 이모지: ${emojiGuidance}

규칙:
1. 자연스럽고 진심 어린 표현 사용
2. 단톡방에 바로 쓸 수 있는 짧은 문장 (한 문장 또는 두 문장)
3. 과도한 외모 평가 금지
4. 부모 비교나 민감한 표현 금지
5. 각 리액션은 서로 다른 포인트를 언급
6. 체형이나 외모를 비교하거나 평가하지 말 것
7. 성인화된 표현 금지
8. 사진 속 아이의 실제 모습을 보고 구체적으로 반응할 것

JSON 형식으로만 응답하세요:
{
  "reactions": ["리액션1", "리액션2", "리액션3"]
}`;
}

export async function generateReactionsWithGemini(
  imageBase64: string,
  options: GenerationOptions,
  variant?: string
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    let prompt = buildGeminiPrompt(options);

    if (variant === 'shorter') {
      prompt += '\n\n추가 요청: 더 짧고 간결하게 만들어주세요 (한 문장으로).';
    } else if (variant === 'longer') {
      prompt += '\n\n추가 요청: 더 길고 자세하게 만들어주세요 (두세 문장으로).';
    } else if (variant === 'calmer') {
      prompt += '\n\n추가 요청: 톤을 한 단계 더 점잖게 만들어주세요.';
    } else if (variant === 'excited') {
      prompt += '\n\n추가 요청: 톤을 한 단계 더 신나게 만들어주세요.';
    } else if (variant === 'specific') {
      prompt += '\n\n추가 요청: 사진의 구체적인 디테일을 언급해주세요.';
    } else if (variant === 'simple') {
      prompt += '\n\n추가 요청: 무난하고 부담없는 표현으로 만들어주세요.';
    }

    const base64Data = imageBase64.split(',')[1] || imageBase64;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.reactions || [];
    }

    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
}
