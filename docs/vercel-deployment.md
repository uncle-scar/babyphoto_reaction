# Vercel 배포 가이드

## 1. Vercel 계정 생성 및 프로젝트 연결

### 단계 1: Vercel 접속
1. https://vercel.com 접속
2. "Sign Up" 또는 "Login" 클릭
3. **GitHub 계정으로 로그인** (권장)

### 단계 2: 새 프로젝트 생성
1. 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 연결
   - "Import Git Repository" 섹션에서
   - `uncle-scar/babyphoto_reaction` 검색
   - "Import" 클릭

### 단계 3: 프로젝트 설정
- **Framework Preset**: Next.js (자동 감지됨)
- **Root Directory**: `./` (기본값)
- **Build Command**: `npm run build` (자동 설정됨)
- **Output Directory**: `.next` (자동 설정됨)

## 2. 환경 변수 설정 (중요!)

"Environment Variables" 섹션에서 다음 변수들을 추가:

### 필수 환경 변수

```
NEXT_PUBLIC_SUPABASE_URL
```
**Value**: `https://ufsacdneqdupujfdiojp.supabase.co`

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```
**Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmc2FjZG5lcWR1cHVqZmRpb2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODA3NTUsImV4cCI6MjA5MDE1Njc1NX0.bpkCmbganmtY9ak1JU3ZAWXpmcs0HVkivqbrf5I2h_0`

```
GOOGLE_API_KEY
```
**Value**: `AIzaSyAS0jPMe9NjIbbz7vVVfnGPkq0ypwxd9sE`

### 환경 변수 입력 방법
1. 각 변수명을 "Name" 필드에 입력
2. 값을 "Value" 필드에 붙여넣기
3. "Add" 버튼 클릭
4. 모든 변수 추가 후 다음 단계로

## 3. 배포 시작

1. "Deploy" 버튼 클릭
2. 배포 진행 상황 확인 (약 2-3분 소요)
3. 배포 완료 시 "Congratulations!" 메시지 표시

## 4. 배포된 사이트 확인

배포 완료 후:
- **URL**: `https://babyphoto-reaction.vercel.app` (또는 자동 생성된 URL)
- "Visit" 버튼 클릭하여 사이트 확인

## 5. 도메인 설정 (선택사항)

### 커스텀 도메인 연결
1. 프로젝트 대시보드 → "Settings" → "Domains"
2. 원하는 도메인 입력
3. DNS 설정 안내에 따라 도메인 연결

### Vercel 무료 도메인
- 자동으로 `프로젝트명.vercel.app` 도메인 제공
- 추가 설정 불필요

## 6. 자동 배포 설정

Vercel은 GitHub와 자동 연동되어:
- **main 브랜치에 푸시** → 자동으로 프로덕션 배포
- **다른 브랜치에 푸시** → 프리뷰 배포 생성
- **Pull Request 생성** → 자동 프리뷰 URL 생성

## 7. 배포 후 테스트

1. 배포된 URL 접속
2. 이미지 업로드 테스트
3. 리액션 생성 테스트
4. 다양한 이미지로 AI 응답 확인

### 확인 사항
- ✅ 이미지 업로드 동작
- ✅ Gemini AI 리액션 생성
- ✅ Supabase Storage 업로드
- ✅ 데이터베이스 저장
- ✅ 복사 기능
- ✅ 재생성 기능

## 8. 문제 해결

### "Internal Server Error" 발생 시
1. Vercel 대시보드 → 프로젝트 → "Deployments"
2. 최신 배포 클릭 → "Functions" 탭
3. 에러 로그 확인
4. 환경 변수가 올바르게 설정되었는지 확인

### 환경 변수 수정 후
1. Settings → Environment Variables에서 수정
2. Deployments → 최신 배포 → "..." → "Redeploy"

### Gemini API 에러
- Google API 키가 올바른지 확인
- API 사용량 한도 확인
- Gemini API가 활성화되어 있는지 확인

### Supabase 연결 에러
- Supabase URL과 Key가 정확한지 확인
- Supabase 프로젝트가 활성 상태인지 확인

## 9. 모니터링

### Vercel Analytics (무료)
1. 프로젝트 → "Analytics" 탭
2. 방문자 수, 페이지뷰 등 확인

### Vercel Logs
1. 프로젝트 → "Logs" 탭
2. 실시간 로그 확인
3. 에러 추적

## 10. 성능 최적화 (선택사항)

### Edge Functions 활성화
- Vercel은 자동으로 Edge에서 실행
- 전 세계 빠른 응답 속도

### 이미지 최적화
- Next.js Image 컴포넌트 사용 시 자동 최적화
- WebP 변환 자동 적용

## 배포 완료 체크리스트

- [ ] Vercel 계정 생성
- [ ] GitHub 저장소 연결
- [ ] 환경 변수 3개 설정
- [ ] 배포 완료
- [ ] 배포된 사이트 접속 확인
- [ ] 이미지 업로드 테스트
- [ ] AI 리액션 생성 테스트
- [ ] Supabase 데이터 저장 확인

## 다음 단계

배포 완료 후:
1. 실제 사용자 테스트
2. 피드백 수집
3. 버그 수정 및 개선
4. GitHub에 푸시 → 자동 재배포

## 유용한 링크

- Vercel 대시보드: https://vercel.com/dashboard
- Vercel 문서: https://vercel.com/docs
- Next.js 배포 가이드: https://nextjs.org/docs/deployment
