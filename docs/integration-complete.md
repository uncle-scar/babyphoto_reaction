# Supabase 및 AI 연동 완료

## 구현 완료 사항 ✅

### 1. Supabase Storage 연동
- **파일**: `lib/storage.ts`
- **기능**:
  - 이미지를 Supabase Storage의 `baby-photos` 버킷에 업로드
  - Base64 이미지를 JPEG 파일로 변환하여 저장
  - 고유한 파일명 생성 (타임스탬프 + 랜덤 ID)
  - 업로드된 이미지의 경로와 URL 반환
  - 이미지 삭제 기능

### 2. 데이터베이스 연동
- **파일**: `lib/database.ts`
- **기능**:
  - 생성 세션 저장 (`generation_sessions` 테이블)
  - 업로드된 이미지 정보 저장 (`uploaded_images` 테이블)
  - 생성된 리액션 결과 저장 (`reaction_results` 테이블)
  - 복사 이벤트 추적 (`copied_at` 필드)

### 3. OpenAI GPT-4 Vision API 연동
- **파일**: `lib/ai.ts`
- **기능**:
  - 이미지와 옵션을 기반으로 프롬프트 생성
  - GPT-4o 모델을 사용한 리액션 생성
  - variant에 따른 프롬프트 조정 (더 짧게, 더 길게 등)
  - 세이프티 가이드라인 포함 (외모 평가 금지, 민감한 표현 금지)
  - JSON 형식으로 응답 파싱

### 4. API 라우트 업데이트
- **파일**: `app/api/generate/route.ts`
- **기능**:
  - OpenAI API 키가 설정되어 있으면 AI 사용, 없으면 Mock 데이터 사용
  - 이미지 업로드 → AI 생성 → 데이터베이스 저장 파이프라인
  - 에러 발생 시 자동으로 Mock 데이터로 fallback
  - 모든 단계에서 에러 핸들링

## 환경 변수 설정

`.env.local` 파일에 다음 변수들이 설정되어야 합니다:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ufsacdneqdupujfdiojp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=your_openai_api_key_here
```

### OpenAI API 키 발급 방법

1. https://platform.openai.com 접속
2. 로그인 또는 회원가입
3. 상단 우측 프로필 → "API keys" 클릭
4. "Create new secret key" 클릭
5. 키 이름 입력 (예: baby-reaction)
6. 생성된 키를 복사하여 `.env.local`에 추가

**중요**: API 키는 한 번만 표시되므로 반드시 안전한 곳에 저장하세요!

## 테스트 방법

### 1. Mock 데이터로 테스트 (OpenAI API 키 없이)

현재 상태에서 바로 테스트 가능합니다:

1. 브라우저에서 http://localhost:3000 접속
2. 이미지 업로드
3. 옵션 설정
4. "리액션 생성하기" 클릭
5. Mock 데이터 기반 리액션 확인

**확인 사항**:
- ✅ 이미지가 Supabase Storage에 업로드되는지
- ✅ 세션이 데이터베이스에 저장되는지
- ✅ 리액션 결과가 저장되는지

### 2. AI로 테스트 (OpenAI API 키 설정 후)

1. OpenAI API 키 발급
2. `.env.local` 파일 수정:
   ```bash
   # Windows
   notepad .env.local
   
   # 마지막 줄을 실제 API 키로 변경
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   ```
3. 개발 서버 재시작 (자동으로 환경 변수 리로드됨)
4. 브라우저에서 테스트
5. 실제 AI가 생성한 리액션 확인

**확인 사항**:
- ✅ AI가 이미지를 분석하여 적절한 리액션 생성
- ✅ 톤, 친밀도, 포커스 옵션이 반영됨
- ✅ 재생성 버튼이 다른 리액션 생성

### 3. Supabase Dashboard에서 확인

1. https://supabase.com/dashboard/project/ufsacdneqdupujfdiojp 접속
2. **Storage** → `baby-photos` 버킷에서 업로드된 이미지 확인
3. **Table Editor**에서 데이터 확인:
   - `generation_sessions`: 생성 세션 기록
   - `uploaded_images`: 이미지 정보
   - `reaction_results`: 생성된 리액션

## 동작 흐름

```
1. 사용자가 이미지 업로드
   ↓
2. 프론트엔드에서 Base64로 변환
   ↓
3. API 호출 (/api/generate)
   ↓
4. 이미지를 Supabase Storage에 업로드
   ↓
5. AI 또는 Mock으로 리액션 생성
   ↓
6. 세션 및 결과를 데이터베이스에 저장
   ↓
7. 결과를 프론트엔드에 반환
   ↓
8. 사용자가 리액션 확인 및 복사
```

## 비용 안내

### Supabase (Free Tier)
- Storage: 1GB
- Database: 500MB
- Bandwidth: 5GB/월
- 무료로 충분히 테스트 가능

### OpenAI API
- GPT-4o: 입력 $2.50/1M tokens, 출력 $10/1M tokens
- 이미지 분석: 약 $0.01~0.02/요청
- 예상 비용: 100회 테스트 시 약 $1~2

**팁**: 개발 중에는 Mock 데이터로 테스트하고, 최종 테스트 시에만 AI를 사용하면 비용 절약 가능!

## 문제 해결

### "Storage upload error"
→ Supabase Storage에 `baby-photos` 버킷이 생성되어 있는지 확인
→ 버킷이 비공개(private)로 설정되어 있는지 확인

### "AI generation failed"
→ OpenAI API 키가 올바른지 확인
→ API 사용량 한도를 초과하지 않았는지 확인
→ 자동으로 Mock 데이터로 fallback되므로 서비스는 계속 동작

### "Database save error"
→ Supabase 데이터베이스 스키마가 적용되어 있는지 확인
→ `docs/supabase-setup-guide.md` 참고하여 테이블 생성

### "Permission denied"
→ Supabase RLS(Row Level Security) 정책 확인
→ 임시로 RLS를 비활성화하거나 정책 추가

## 다음 단계

1. **실제 이미지로 AI 테스트**
   - 다양한 아기 사진으로 테스트
   - 옵션 조합별 결과 확인
   - 부적절한 표현이 생성되는지 확인

2. **세이프티 필터 강화**
   - 금지 표현 목록 추가
   - 결과 필터링 로직 구현
   - 로그 기록 및 모니터링

3. **사용자 피드백 수집**
   - 좋아요/싫어요 버튼 추가
   - 피드백을 데이터베이스에 저장
   - AI 프롬프트 개선에 활용

4. **성능 최적화**
   - 이미지 압축 및 리사이징
   - API 응답 캐싱
   - 병렬 처리 최적화

5. **배포**
   - Vercel에 배포
   - 환경 변수 설정
   - 프로덕션 테스트

## 참고 문서

- [Supabase 설정 가이드](./supabase-setup-guide.md)
- [데이터베이스 스키마](./database-schema.md)
- [다음 단계](./next-steps.md)
- [OpenAI API 문서](https://platform.openai.com/docs)
