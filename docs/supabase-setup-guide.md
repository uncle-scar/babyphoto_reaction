# Supabase 데이터베이스 설정 가이드

## 1. 환경 변수 설정 ✅

`.env.local` 파일이 생성되었습니다.

```
NEXT_PUBLIC_SUPABASE_URL=https://ufsacdneqdupujfdiojp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 2. 데이터베이스 스키마 적용

### 방법 1: Supabase SQL Editor 사용 (권장)

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard/project/ufsacdneqdupujfdiojp

2. **SQL Editor 열기**
   - 왼쪽 메뉴에서 "SQL Editor" 클릭
   - 또는 직접 접속: https://supabase.com/dashboard/project/ufsacdneqdupujfdiojp/sql

3. **새 쿼리 생성**
   - "New query" 버튼 클릭

4. **아래 SQL 복사해서 붙여넣기**

```sql
-- 1. users 테이블
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. generation_sessions 테이블
CREATE TABLE generation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_key TEXT NOT NULL,
  tone_level INTEGER CHECK (tone_level BETWEEN 1 AND 5),
  intimacy_level INTEGER CHECK (intimacy_level BETWEEN 1 AND 5),
  focus_type TEXT,
  speech_preset TEXT,
  output_format TEXT,
  emoji_level INTEGER DEFAULT 2,
  parent_reference_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_sessions_user_id ON generation_sessions(user_id);
CREATE INDEX idx_generation_sessions_created_at ON generation_sessions(created_at DESC);

-- 3. uploaded_images 테이블
CREATE TABLE uploaded_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_session_id UUID REFERENCES generation_sessions(id) ON DELETE CASCADE,
  image_type TEXT CHECK (image_type IN ('child', 'parent')),
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_uploaded_images_session_id ON uploaded_images(generation_session_id);

-- 4. reaction_results 테이블
CREATE TABLE reaction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_session_id UUID REFERENCES generation_sessions(id) ON DELETE CASCADE,
  result_text TEXT NOT NULL,
  variant_type TEXT,
  copied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reaction_results_session_id ON reaction_results(generation_session_id);

-- 5. user_presets 테이블
CREATE TABLE user_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tone_level INTEGER CHECK (tone_level BETWEEN 1 AND 5),
  intimacy_level INTEGER CHECK (intimacy_level BETWEEN 1 AND 5),
  focus_type TEXT,
  speech_preset TEXT,
  emoji_level INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_presets_user_id ON user_presets(user_id);

-- 6. safety_logs 테이블
CREATE TABLE safety_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_session_id UUID REFERENCES generation_sessions(id),
  rule_type TEXT NOT NULL,
  blocked_text TEXT,
  action_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_safety_logs_created_at ON safety_logs(created_at DESC);
```

5. **"Run" 버튼 클릭** (또는 Ctrl+Enter)
6. 성공 메시지 확인: "Success. No rows returned"

### 방법 2: 단계별 실행 (오류 발생 시)

위 SQL을 한 번에 실행했을 때 오류가 나면, 테이블을 하나씩 생성하세요:

#### Step 1: users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Step 2: generation_sessions 테이블
```sql
CREATE TABLE generation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_key TEXT NOT NULL,
  tone_level INTEGER CHECK (tone_level BETWEEN 1 AND 5),
  intimacy_level INTEGER CHECK (intimacy_level BETWEEN 1 AND 5),
  focus_type TEXT,
  speech_preset TEXT,
  output_format TEXT,
  emoji_level INTEGER DEFAULT 2,
  parent_reference_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_generation_sessions_user_id ON generation_sessions(user_id);
CREATE INDEX idx_generation_sessions_created_at ON generation_sessions(created_at DESC);
```

나머지도 동일하게 하나씩 실행하세요.

## 3. Storage 버킷 생성

1. **Storage 메뉴 열기**
   - 왼쪽 메뉴에서 "Storage" 클릭

2. **새 버킷 생성**
   - "Create a new bucket" 클릭
   - **Name**: `baby-photos`
   - **Public bucket**: ❌ 체크 해제 (비공개)
   - "Create bucket" 클릭

3. **버킷 정책 설정**
   - SQL Editor로 돌아가서 아래 SQL 실행:

```sql
-- Storage 정책 설정
CREATE POLICY "Users can upload own images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'baby-photos');

CREATE POLICY "Users can view own images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'baby-photos');

CREATE POLICY "Images auto-delete after expiry"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'baby-photos');
```

## 4. Row Level Security (RLS) 설정 (선택사항)

MVP에서는 RLS 없이도 동작하지만, 보안을 위해 나중에 추가할 수 있습니다.

```sql
-- users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- generation_sessions 테이블
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create sessions"
  ON generation_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own sessions"
  ON generation_sessions FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
```

## 5. 연결 테스트

개발 서버를 재시작하세요:

```bash
# 개발 서버 중지 (Ctrl+C)
# 다시 시작
npm run dev
```

브라우저에서 http://localhost:3000 접속 후:
1. 이미지 업로드
2. 리액션 생성 버튼 클릭
3. 콘솔에서 에러 확인

## 6. 테이블 확인

Supabase Dashboard → Table Editor에서 생성된 테이블들을 확인할 수 있습니다:
- users
- generation_sessions
- uploaded_images
- reaction_results
- user_presets
- safety_logs

## 문제 해결

### "relation does not exist" 오류
→ 테이블이 생성되지 않았습니다. SQL을 다시 실행하세요.

### "permission denied" 오류
→ RLS가 활성화되어 있습니다. 위의 RLS 정책을 적용하거나 임시로 비활성화하세요.

### 연결 오류
→ `.env.local` 파일의 URL과 Key를 다시 확인하세요.

## 다음 단계

데이터베이스 설정이 완료되면:
1. 실제 이미지를 Supabase Storage에 업로드하는 기능 구현
2. 생성 세션을 데이터베이스에 저장하는 기능 구현
3. AI API 연동 (OpenAI GPT-4 Vision 또는 Claude Vision)

현재는 Mock 데이터로 동작하므로 데이터베이스 없이도 테스트 가능합니다.
