# AI Commander 🚀

AI Commander는 여러 AI 서비스를 하나의 통합된 인터페이스에서 사용할 수 있는 Electron 기반 데스크톱 브라우저입니다.

## 주요 기능 ✨

### 1. 웹 AI 서비스 통합
- **ChatGPT** - OpenAI의 대화형 AI
- **Claude** - Anthropic의 AI 어시스턴트
- **Gemini** - Google의 AI 모델
- **Perplexity** - AI 기반 검색 엔진

각 서비스는 독립적인 세션으로 관리되어 로그인 상태가 유지됩니다.

### 2. 로컬 LLM 지원 (Ollama)
- **Llama 3.1 70B** - Meta의 오픈소스 모델
- **ChatGPT OSS 120B** - 대규모 오픈소스 모델
- **Qwen 2.5 72B** - Alibaba의 다국어 모델

로컬에서 Ollama를 통해 대규모 언어 모델을 실행할 수 있습니다.

### 3. 브라우저 기능
- 주소창을 통한 자유로운 웹 브라우징
- 뒤로가기, 앞으로가기, 새로고침 네비게이션
- Google 검색 통합
- 각 서비스별 세션 유지

## 시스템 요구사항 📋

- **OS**: Linux, macOS, Windows
- **Node.js**: 16.0 이상
- **Electron**: 25.0 이상
- **Ollama**: 로컬 LLM 사용 시 필요

## 설치 방법 🛠️

### 1. 저장소 클론
```bash
git clone https://github.com/yourusername/ai-commander.git
cd ai-commander
```

### 2. 의존성 설치
```bash
npm install
```

### 3. Electron 재빌드 (필요시)
```bash
npx electron-rebuild
```

### 4. Ollama 설치 (로컬 LLM 사용 시)
```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# 모델 다운로드
ollama pull llama3.1:70b
ollama pull qwen2.5:72b
```

## 실행 방법 🚀

### 기본 실행
```bash
npm start
```

### 개발 모드 실행
```bash
ELECTRON_DISABLE_SANDBOX=1 NODE_ENV=development npx electron ai-commander.cjs
```

### Ollama 서버 시작 (로컬 LLM 사용 시)
```bash
ollama serve
```

## 사용 방법 📖

### 웹 AI 서비스 사용
1. 왼쪽 사이드바에서 원하는 서비스 클릭 (ChatGPT, Claude 등)
2. 처음 사용 시 각 서비스에 로그인
3. 상단 주소창을 통해 자유롭게 웹 브라우징

### 로컬 LLM 사용
1. 터미널에서 `ollama serve` 실행
2. 왼쪽 사이드바에서 원하는 로컬 모델 선택
3. 채팅 인터페이스에서 대화 시작

### 네비게이션
- ◀ 뒤로가기
- ▶ 앞으로가기
- 🔄 새로고침
- 주소창에 URL 입력 또는 검색어 입력

## 프로젝트 구조 📁

```
ai-commander/
├── ai-commander.cjs      # 메인 애플리케이션 파일
├── package.json          # 프로젝트 설정
├── README.md            # 문서
└── node_modules/        # 의존성 패키지
```

## 주요 기술 스택 🔧

- **Electron** - 크로스 플랫폼 데스크톱 앱 프레임워크
- **Node.js** - JavaScript 런타임
- **BrowserView** - 웹 콘텐츠 표시
- **HTTP Module** - Ollama API 통신

## 특징 🌟

- **통합 인터페이스**: 여러 AI 서비스를 한 곳에서 관리
- **세션 유지**: 각 서비스별 로그인 상태 유지
- **로컬 실행**: 인터넷 연결 없이도 로컬 LLM 사용 가능
- **클린 UI**: Claude 스타일의 깔끔한 채팅 인터페이스
- **빠른 전환**: 서비스 간 빠른 전환 가능

## 문제 해결 🔍

### Electron 실행 오류
```bash
# GPU 가속 비활성화
app.disableHardwareAcceleration()
```

### Ollama 연결 실패
```bash
# Ollama 서버 확인
curl http://localhost:11434/api/version

# 모델 목록 확인
ollama list
```

### 모듈 버전 불일치
```bash
# Electron 재빌드
npx electron-rebuild
```

## 기여하기 🤝

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 라이선스 📄

MIT License - 자유롭게 사용, 수정, 배포 가능

## 개발자 정보 👨‍💻

- 개발 환경: Linux (Ubuntu)
- Electron 버전: 25.x
- Node.js 버전: 18.x

## 향후 계획 🔮

- [ ] API 서비스 통합 (Groq, OpenAI API 직접 연동)
- [ ] 대화 내역 저장 기능
- [ ] 다크 모드 지원
- [ ] 멀티 윈도우 지원
- [ ] 플러그인 시스템

## 스크린샷 📸

### 메인 인터페이스
- 왼쪽: 서비스 선택 사이드바
- 중앙: 웹뷰/채팅 인터페이스
- 상단: 주소창 및 네비게이션

### 로컬 LLM 채팅
- Claude 스타일의 깔끔한 UI
- 실시간 스트리밍 응답
- 모델 상태 표시

---

**Note**: 이 프로젝트는 계속 개발 중이며, 기능이 추가되거나 변경될 수 있습니다.

## 연락처 📧

문제나 제안사항이 있으시면 Issue를 등록해주세요.