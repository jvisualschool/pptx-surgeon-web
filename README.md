# PPTX Surgeon Web Interface 🩺

![PPTX Surgeon](https://img.shields.io/badge/PPTX-Surgeon-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

**사용자 친화적인 웹 인터페이스를 통한 PowerPoint 폰트 문제 해결 도구**

PPTX Surgeon의 강력한 CLI 기능을 직관적인 웹 인터페이스로 쉽게 사용할 수 있습니다. 복잡한 명령어 없이 드래그앤드롭으로 PowerPoint 파일의 폰트 문제를 해결하세요!

## ✨ 주요 기능

### 🎯 4단계 간편 프로세스
1. **파일 업로드** - 드래그앤드롭 또는 클릭으로 PPTX 파일 선택
2. **폰트 분석** - 파일 내 폰트 정보 자동 분석 및 문제점 탐지
3. **수술 옵션 선택** - 직관적인 체크박스로 원하는 작업 선택
4. **수술 실행** - 실시간 진행상황 표시 및 결과 다운로드

### 🛠️ 폰트 수술 옵션
- **폰트 임베딩 제거** - 깨진 폰트 임베딩 정보를 완전히 제거
- **폰트 이름 매핑** - 특정 폰트를 다른 폰트로 교체 (다중 매핑 지원)
- **올인원 폰트 정리** - 지정된 폰트만 유지하고 나머지는 기본 폰트로 통합
- **상세 로그** - 처리 과정 실시간 모니터링

### 🎨 사용자 경험
- **다크/라이트 테마** 자동 전환
- **한국어/영어** 언어 지원
- **실시간 진행바** 및 WebSocket 통신
- **반응형 디자인** - 모바일, 태블릿, 데스크톱 지원
- **드래그앤드롭** 파일 업로드

## 🚀 빠른 시작

### 필수 요구사항
- **Node.js** 18.0.0 이상
- **npm** 또는 **yarn**

### 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/pptx-surgeon-web.git
cd pptx-surgeon-web

# 2. 의존성 설치
npm install

# 3. 서버 실행
npm start
# 또는
node server.js

# 4. 브라우저에서 접속
# http://localhost:3000
```

## 📦 Docker 실행 (선택사항)

```bash
# Docker 이미지 빌드
docker build -t pptx-surgeon-web .

# 컨테이너 실행
docker run -p 3000:3000 pptx-surgeon-web
```

## 🖥️ 사용 방법

### 1. 파일 업로드
- PPTX 파일을 업로드 영역에 드래그앤드롭
- 또는 "파일 선택" 버튼 클릭

### 2. 폰트 분석
- "폰트 분석 시작" 버튼 클릭
- 파일 내 모든 폰트 정보 자동 스캔

### 3. 수술 옵션 선택
#### 폰트 임베딩 제거
```
✅ 폰트 임베딩 제거
   깨진 폰트 임베딩 정보를 완전히 제거합니다
```

#### 폰트 매핑
```
✅ 폰트 이름 매핑
   Arial → 맑은 고딕
   Times New Roman → 나눔명조
   + 매핑 추가
```

#### 올인원 정리
```
✅ 올인원 폰트 정리
   ☑️ 맑은 고딕
   ☑️ 나눔바른고딕
   ☑️ Arial
   ☐ Times New Roman (제거됨)
```

### 4. 수술 실행 및 다운로드
- "수술 시작" 버튼 클릭
- 실시간 진행상황 확인
- 완료 후 "결과 파일 다운로드" 클릭

## 🔧 고급 설정

### 환경 변수
```bash
PORT=3000                    # 서버 포트 (기본값: 3000)
NODE_ENV=production          # 운영 환경 설정
UPLOAD_LIMIT=10MB           # 업로드 파일 크기 제한
```

### 개발 모드 실행
```bash
# 개발 서버 실행 (nodemon 사용)
npm run dev

# 코드 스타일 검사
npm run lint

# 빌드 (배포용 바이너리 생성)
npm run build
```

## 🛡️ 보안 정보

### 파일 업로드 보안
- ✅ PPTX 파일만 업로드 허용
- ✅ 파일 크기 제한 적용
- ✅ 안전한 파일 경로 처리
- ✅ 임시 파일 자동 정리

### 네트워크 보안
- ✅ CORS 설정 적용
- ✅ WebSocket 보안 연결
- ⚠️ HTTPS 사용 권장 (운영 환경)

## 🔍 문제 해결

### 일반적인 문제들

**Q: 업로드가 안 돼요**
```bash
# 파일 권한 확인
chmod 755 uploads/

# 디스크 용량 확인
df -h
```

**Q: 수술이 실패해요**
```bash
# 상세 로그 확인 (체크박스 활성화)
# 또는 서버 로그 확인
tail -f server.log
```

**Q: 윈도우에서 실행이 안 돼요**
```cmd
# PowerShell에서 실행 정책 변경
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Node.js 재설치 후 재시도
node --version
npm --version
```

## 🤝 기여하기

1. Fork 프로젝트
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 확인하세요.

원본 PPTX Surgeon CLI 도구: © 2020-2021 Dr. Ralf S. Engelschall

## 🙏 감사의 말

- **Dr. Ralf S. Engelschall** - 원본 [pptx-surgeon](https://github.com/rse/pptx-surgeon) CLI 도구 개발
- **Font Awesome** - 아이콘 제공
- **Express.js & WebSocket** - 웹 서버 및 실시간 통신

## 📞 지원

- 🐛 **버그 리포트**: [Issues](https://github.com/your-username/pptx-surgeon-web/issues)
- 💡 **기능 제안**: [Discussions](https://github.com/your-username/pptx-surgeon-web/discussions)


---

<div align="center">

**⚡ PowerPoint 폰트 문제, 이제 클릭 몇 번으로 해결하세요! ⚡**

[🌟 Star](https://github.com/your-username/pptx-surgeon-web) | [🍴 Fork](https://github.com/your-username/pptx-surgeon-web/fork) | [📝 Issues](https://github.com/your-username/pptx-surgeon-web/issues)

</div>