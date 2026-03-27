# 다음 단계

## 현재 완료된 작업

### ✅ MVP 핵심 기능
- Next.js 16 + TypeScript + Tailwind CSS 프로젝트 구조 설정
- 홈페이지 (서비스 소개, 예시 리액션)
- 리액션 생성 페이지
- 이미지 업로드 컴포넌트 (붙여넣기/업로드/드래그 앤 드롭)
- 옵션 설정 패널 (톤, 친밀도, 포커스, 말투, 이모지)
- 결과 표시 및 복사 기능
- 재생성 옵션 (더 짧게, 더 점잖게 등)
- Mock API 구현

### ✅ 문서화
- README.md 업데이트
- 데이터베이스 스키마 문서
- 프로젝트 구조 정리

## 다음 작업 우선순위

### 1. AI 리액션 생성 구현 (높음)
**현재 상태**: Mock 데이터 사용 중  
**필요 작업**:
- OpenAI GPT-4 Vision API 또는 Claude Vision API 연동
- 이미지 분석 및 프롬프트 엔지니어링
- 옵션 기반 프롬프트 생성 로직
- 세이프티 필터 구현

**구현 예시**:
```typescript
// app/api/generate/route.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateReactions(imageBase64: string, options: GenerationOptions) {
  const prompt = buildPrompt(options);
  
  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageBase64 } }
        ]
      }
    ],
    max_tokens: 500,
  });
  
  return parseReactions(response.choices[0].message.content);
}
```

### 2. Supabase 연동 (중간)
**필요 작업**:
- Supabase 프로젝트 생성
- 데이터베이스 스키마 적용 (`docs/database-schema.md` 참고)
- Storage 버킷 설정
- 이미지 업로드 로직 구현
- 생성 세션 저장 로직

**구현 순서**:
1. `.env.local` 파일에 Supabase 환경 변수 추가
2. 이미지 Storage 업로드 구현
3. 생성 세션 및 결과 저장
4. (선택) 최근 기록 조회 기능

### 3. 세이프티 필터 구현 (높음)
**필요 작업**:
- 금지 표현 목록 관리
- 결과 필터링 로직
- 부적절한 표현 차단
- 로그 기록

**금지 표현 예시**:
- 체형 평가
- 외모 비교
- 성인화된 표현
- 부모 우열 비교

### 4. 모바일 UX 개선 (중간)
**필요 작업**:
- 모바일에서 붙여넣기 제한 시 fallback UX
- 하단 고정 생성 버튼
- 터치 영역 최적화
- 로딩 상태 개선

### 5. 성능 최적화 (낮음)
**필요 작업**:
- 이미지 압축 및 리사이징
- API 응답 캐싱
- 컴포넌트 lazy loading
- Next.js Image 컴포넌트 적용

### 6. 추가 기능 (낮음)
**선택적 구현**:
- 회원가입/로그인 (Supabase Auth)
- 최근 생성 기록 페이지
- 프리셋 저장 기능
- 다크 모드
- 공유 기능

## 즉시 시작 가능한 작업

### A. OpenAI API 연동
```bash
npm install openai
```

환경 변수 추가:
```env
OPENAI_API_KEY=your_openai_api_key
```

### B. Supabase 프로젝트 설정
1. https://supabase.com 에서 프로젝트 생성
2. SQL Editor에서 `docs/database-schema.md`의 스키마 실행
3. Storage에서 `baby-photos` 버킷 생성
4. `.env.local`에 URL과 Key 추가

### C. 프롬프트 엔지니어링
`lib/prompts.ts` 파일 생성:
```typescript
export function buildPrompt(options: GenerationOptions): string {
  const toneMap = {
    1: '매우 점잖고 차분한',
    2: '담백하고 정중한',
    3: '다정하고 따뜻한',
    4: '신나고 활기찬',
    5: '호들갑스럽고 과장된'
  };
  
  const intimacyMap = {
    1: '어색한 지인에게 쓸',
    2: '가벼운 친구에게 쓸',
    3: '친한 친구에게 쓸',
    4: '매우 친한 친구에게 쓸',
    5: '가족처럼 친한 사람에게 쓸'
  };
  
  return `당신은 단톡방에서 아이 사진에 반응하는 사람입니다.
다음 조건으로 리액션을 3~4개 생성해주세요:

- 톤: ${toneMap[options.toneLevel]}
- 관계: ${intimacyMap[options.intimacyLevel]}
- 포커스: ${options.focusType}
- 말투: ${options.speechPreset}

규칙:
1. 자연스럽고 진심 어린 표현 사용
2. 단톡방에 바로 쓸 수 있는 짧은 문장
3. 과도한 외모 평가 금지
4. 부모 비교나 민감한 표현 금지
5. 각 리액션은 서로 다른 포인트를 언급

JSON 형식으로 응답:
{
  "reactions": ["리액션1", "리액션2", "리액션3"]
}`;
}
```

## 테스트 체크리스트

- [ ] 이미지 붙여넣기 동작 확인
- [ ] 이미지 업로드 동작 확인
- [ ] 드래그 앤 드롭 동작 확인
- [ ] 옵션 변경 시 UI 업데이트 확인
- [ ] 리액션 생성 버튼 동작 확인
- [ ] 복사 버튼 동작 확인
- [ ] 재생성 버튼 동작 확인
- [ ] 모바일 반응형 확인
- [ ] 에러 처리 확인

## 배포 전 체크리스트

- [ ] 환경 변수 설정 확인
- [ ] Supabase 프로젝트 설정 완료
- [ ] OpenAI API 키 설정 완료
- [ ] 프로덕션 빌드 테스트 (`npm run build`)
- [ ] Vercel 배포 설정
- [ ] 도메인 연결 (선택)
- [ ] 분석 도구 연동 (선택)

## 참고 문서

- [PRD 문서](../../baby_reaction_prd.md)
- [데이터베이스 스키마](./database-schema.md)
- [Next.js 문서](https://nextjs.org/docs)
- [Supabase 문서](https://supabase.com/docs)
- [OpenAI API 문서](https://platform.openai.com/docs)
