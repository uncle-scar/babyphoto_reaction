# 데이터베이스 스키마

## Supabase 설정

### 1. 테이블 생성

#### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  nickname TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### generation_sessions
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

#### uploaded_images
```sql
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
```

#### reaction_results
```sql
CREATE TABLE reaction_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generation_session_id UUID REFERENCES generation_sessions(id) ON DELETE CASCADE,
  result_text TEXT NOT NULL,
  variant_type TEXT,
  copied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reaction_results_session_id ON reaction_results(generation_session_id);
```

#### user_presets
```sql
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
```

#### safety_logs
```sql
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

### 2. Row Level Security (RLS) 설정

```sql
-- users 테이블
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- generation_sessions 테이블
ALTER TABLE generation_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON generation_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create sessions"
  ON generation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- reaction_results 테이블
ALTER TABLE reaction_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own results"
  ON reaction_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM generation_sessions
      WHERE generation_sessions.id = reaction_results.generation_session_id
      AND (generation_sessions.user_id = auth.uid() OR generation_sessions.user_id IS NULL)
    )
  );

-- user_presets 테이블
ALTER TABLE user_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own presets"
  ON user_presets FOR ALL
  USING (auth.uid() = user_id);
```

### 3. Storage 버킷 생성

```sql
-- Supabase Storage에서 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('baby-photos', 'baby-photos', false);

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

### 4. 자동 삭제 함수 (이미지 만료)

```sql
-- 만료된 이미지 자동 삭제 함수
CREATE OR REPLACE FUNCTION delete_expired_images()
RETURNS void AS $$
BEGIN
  DELETE FROM uploaded_images
  WHERE expires_at IS NOT NULL
  AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 매일 실행되는 크론 작업 (Supabase pg_cron 확장 필요)
SELECT cron.schedule(
  'delete-expired-images',
  '0 2 * * *', -- 매일 새벽 2시
  'SELECT delete_expired_images();'
);
```

## 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 초기 데이터 설정

MVP에서는 회원가입 없이 사용 가능하므로, 초기 데이터 설정은 선택사항입니다.
