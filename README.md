# 아기리액션

단톡방 아이 사진에 센스있는 리액션을 빠르게 생성해주는 웹 서비스

## 주요 기능

- 📸 **빠른 입력**: 사진 붙여넣기/업로드/드래그 앤 드롭 지원
- 🎨 **상황 맞춤형**: 톤, 친밀도, 말투를 조절해 관계에 맞는 표현 제공
- 📋 **즉시 사용**: 생성된 문구를 복사해서 단톡방에 바로 전송
- 📱 **모바일 최적화**: 모바일 웹 환경에 최적화된 반응형 UI

## 기술 스택

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Storage, Auth)
- **Icons**: Lucide React
- **Deployment**: Vercel

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
baby-reaction/
├── app/
│   ├── page.tsx              # 메인 페이지 (리액션 생성)
│   └── api/
│       └── generate/
│           └── route.ts      # 리액션 생성 API
├── components/
│   ├── ImageUploadArea.tsx   # 이미지 업로드 컴포넌트
│   ├── OptionsPanel.tsx      # 옵션 설정 패널
│   └── ResultsDisplay.tsx    # 결과 표시 컴포넌트
├── lib/
│   ├── supabase.ts           # Supabase 클라이언트
│   └── types.ts              # TypeScript 타입 정의
└── docs/
    └── database-schema.md    # 데이터베이스 스키마
```

## MVP 기능 범위

- ✅ 사진 붙여넣기/업로드/드래그 앤 드롭
- ✅ 톤 조절 (점잖음 ~ 호들갑)
- ✅ 친밀도 입력 (어색한 지인 ~ 가족급 찐친)
- ✅ 리액션 포커스 선택 (얼굴, 표정, 눈웃음, 볼살 등)
- ✅ 말투 프리셋 (다정한 친구, 이모/삼촌, 웃긴 드립 등)
- ✅ 리액션 3~5개 생성
- ✅ 복사 버튼
- ✅ 재생성 옵션 (더 짧게, 더 점잖게, 더 호들갑스럽게 등)
- ✅ 모바일 반응형 UI

## 향후 확장 기능

- 부모 사진 참고 기능
- 계정 기반 기록 저장
- 방별 프리셋 저장
- AI 기반 실제 리액션 생성 (현재는 Mock 데이터)

## 배포

### Vercel 배포

```bash
npm run build
```

Vercel에 연결하여 자동 배포하거나, Vercel CLI를 사용하세요:

```bash
vercel
```

### Supabase 설정

데이터베이스 스키마 및 설정은 `docs/database-schema.md`를 참고하세요.

## 라이선스

MIT

## 문서

- [PRD 문서](../baby_reaction_prd.md)
- [데이터베이스 스키마](./docs/database-schema.md)
