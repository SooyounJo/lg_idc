# LG IDC - Furon AI Smart Home Project

한국예술종합학교와 LG가 협력하여 개발한 공감형 지능 스마트홈 가이드 '퓨론(Furon)'

Next.js 기반의 Three.js 3D 환경과 OpenAI 음성 대화 기능을 통합한 프로젝트입니다.

## 주요 기능

- 🎨 Three.js를 활용한 3D 렌더링 환경
- 🎤 음성 인식 (브라우저 Web Speech API)
- 💬 퓨론 AI 대화 (OpenAI GPT-4)
- 🏠 스마트홈 디바이스 제어 (에어컨, 공기청정기, 조명, 냉장고, 스피커)
- 🔄 실시간 음성-텍스트-AI 응답 플로우
- 😊 감정 기반 스마트홈 제어 제안
- 🆓 무료 음성 인식 (브라우저 내장)

## 설치 및 실행

### 1. 의존성 설치

```bash
yarn install
```

### 2. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 OpenAI API 키를 추가하세요:

```
OPENAI_API_KEY=your_openai_api_key_here
```

OpenAI API 키는 [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급받을 수 있습니다.

### 3. 개발 서버 실행

```bash
yarn dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

```
lg_idc/
├── components/
│   ├── ThreeScene.js      # Three.js 3D 씬 컴포넌트
│   └── VoiceChat.js       # 음성 대화 UI 컴포넌트
├── hooks/
│   └── useVoiceRecorder.js # 음성 녹음 커스텀 훅
├── pages/
│   ├── api/
│   │   ├── voice-to-text.js # Whisper API 엔드포인트
│   │   └── chat.js          # GPT Chat API 엔드포인트
│   ├── _app.js
│   └── index.js
├── utils/
│   └── prompts.js         # AI 프롬프트 설정 파일
├── styles/
│   └── globals.css
└── public/
```

## 사용 방법

1. **Three.js 환경**: 메인 화면에서 흰색 3D 공간이 표시됩니다.
2. **퓨론과 음성 대화**: 우측 상단의 퓨론 채팅 패널에서:
   - 🎤 "녹음 시작" 버튼을 클릭하여 감정이나 상태 말하기
   - 🔴 "녹음 중지" 버튼을 클릭하여 녹음 종료
   - 퓨론이 자동으로 감정을 이해하고 스마트홈 제어를 제안합니다

### 퓨론 사용 예시

- "더워" → 에어컨 온도를 낮추고 시원한 음악을 제안
- "피곤해" → 편안한 조명으로 바꾸고 잔잔한 음악을 제안
- "답답해" → 공기청정기를 켜고 상쾌한 공기로 만들어주는 제안
- "배고파" → 냉장고 추천 메뉴 제안
- "우울해" → 밝은 조명과 기분 좋은 음악 제안

## 퓨론 AI 커스터마이징

`utils/prompts.js` 파일에서 퓨론의 성격과 응답 스타일을 커스터마이징할 수 있습니다:

```javascript
export const FURON_PERSONALITY = {
  name: "퓨론 (Furon)",
  description: "한국예술종합학교와 LG가 협력하여 개발한 공감형 지능 스마트홈 가이드",
  greeting: "안녕하세요! 저는 퓨론이에요. 오늘 기분이 어떠신가요?",
  smartHomeDevices: [
    "Air Conditioner",
    "Air Purifier", 
    "Lighting",
    "Refrigerator",
    "Speaker"
  ],
  // ... 시스템 프롬프트 및 설정
}

// 대화 설정
export const CONVERSATION_CONFIG = {
  max_tokens: 150,       // 최대 토큰 수 (50자 내외 응답)
  temperature: 0.8,      // 창의성 (0.0 ~ 2.0)
  model: 'gpt-4o-mini', // GPT 모델 (최신 버전)
  language: 'ko',        // 언어
}
```

## 기술 스택

- **Frontend**: React, Next.js (Page Router)
- **3D Graphics**: Three.js, React Three Fiber, Drei
- **AI Integration**: OpenAI GPT-4o-mini API
- **Speech Recognition**: Web Speech API (브라우저 내장)
- **HTTP Client**: Axios
- **Package Manager**: Yarn

## 지원 브라우저

- ✅ Chrome (데스크톱/모바일) - 권장
- ✅ Microsoft Edge
- ✅ Safari (iOS 14.5+)
- ❌ Firefox (Web Speech API 미지원)

## API 엔드포인트

### POST /api/chat
- 사용자 메시지를 받아 퓨론 AI 응답 생성
- Request: `{ message: string, conversationHistory: array, customPrompt: string }`
- Response: `{ response: string, usage: object }`
- 음성 인식은 브라우저에서 처리되므로 별도 API 불필요

## 주의사항

- **OpenAI GPT-4o-mini API** 사용 시 비용이 발생할 수 있습니다 (음성 인식은 무료, GPT-4o-mini는 저렴)
- 마이크 권한이 필요합니다
- HTTPS 환경 또는 localhost에서만 마이크 접근이 가능합니다
- Chrome, Edge, Safari 브라우저 권장 (Firefox는 음성 인식 미지원)

## 라이센스

Private Project
