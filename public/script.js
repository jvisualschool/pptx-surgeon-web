class PPTXSurgeonUI {
    constructor() {
        this.currentFile = null;
        this.originalFileName = null;
        this.analysisData = null;
        this.ws = null;
        this.currentLanguage = 'ko';
        this.translations = {
            ko: {
                step1Title: 'PPTX 파일 선택',
                step2Title: '폰트 분석',
                step3Title: '수술 옵션 선택',
                step4Title: '폰트 수술 실행',
                uploadText: 'PPTX 파일을 드래그하거나 클릭하여 선택하세요',
                selectFile: '파일 선택',
                analyzeStart: '폰트 분석 시작',
                surgeryStart: '수술 시작',
                removeEmbed: '폰트 임베딩 제거',
                removeEmbedDesc: '깨진 폰트 임베딩 정보를 완전히 제거합니다',
                fontMapping: '폰트 이름 매핑',
                fontMappingDesc: '특정 폰트를 다른 폰트로 교체합니다',
                fontCleanup: '올인원 폰트 정리',
                fontCleanupDesc: '지정된 폰트들만 유지하고 나머지는 기본 폰트로 매핑',
                verboseLog: '상세 로그 출력',
                surgeryComplete: '수술 완료!',
                surgeryCompleteDesc: '폰트 문제가 성공적으로 해결되었습니다.',
                downloadResult: '결과 파일 다운로드'
            },
            en: {
                step1Title: 'Select PPTX File',
                step2Title: 'Font Analysis',
                step3Title: 'Surgery Options',
                step4Title: 'Font Surgery',
                uploadText: 'Drag and drop or click to select PPTX file',
                selectFile: 'Select File',
                analyzeStart: 'Start Analysis',
                surgeryStart: 'Start Surgery',
                removeEmbed: 'Remove Font Embedding',
                removeEmbedDesc: 'Completely remove broken font embedding information',
                fontMapping: 'Font Name Mapping',
                fontMappingDesc: 'Replace specific fonts with other fonts',
                fontCleanup: 'All-in-One Font Cleanup',
                fontCleanupDesc: 'Keep only specified fonts and map others to primary font',
                verboseLog: 'Verbose Logging',
                surgeryComplete: 'Surgery Complete!',
                surgeryCompleteDesc: 'Font issues have been successfully resolved.',
                downloadResult: 'Download Result File'
            }
        };
        this.init();
    }

    init() {
        this.setupWebSocket();
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupImageRotation();
        this.setupThemeToggle();
        this.setupLanguageToggle();
        this.loadLanguage();
    }

    setupWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        this.ws = new WebSocket(`${protocol}//${window.location.host}`);
        
        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
        };

        this.ws.onclose = () => {
            setTimeout(() => this.setupWebSocket(), 3000);
        };
    }

    handleWebSocketMessage(data) {
        switch(data.type) {
            case 'progress':
                this.updateProgress(data.progress, data.message);
                break;
            case 'verbose':
                this.updateProgress(data.progress, data.message);
                this.showVerboseLog(data.message);
                break;
            case 'error':
                this.showToast(data.message, 'error');
                this.hideProgress();
                break;
        }
    }

    setupEventListeners() {
        // File input
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files[0]);
        });

        document.getElementById('removeFileBtn').addEventListener('click', () => {
            this.removeFile();
        });

        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeFile();
        });

        document.getElementById('processBtn').addEventListener('click', () => {
            this.processFile();
        });

        // Checkbox toggles
        document.getElementById('enableMapping').addEventListener('change', (e) => {
            document.getElementById('fontMappings').style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('enableCleanup').addEventListener('change', (e) => {
            document.getElementById('cleanupOptions').style.display = e.target.checked ? 'block' : 'none';
        });
    }

    setupDragAndDrop() {
        const uploadArea = document.getElementById('uploadArea');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, this.preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.add('dragover'), false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadArea.addEventListener(eventName, () => uploadArea.classList.remove('dragover'), false);
        });

        uploadArea.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    async handleFileSelect(file) {
        if (!file || !file.name.toLowerCase().endsWith('.pptx')) {
            this.showToast('PPTX 파일만 선택할 수 있습니다.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('pptxFile', file);

        try {
            this.showToast('파일 업로드 중...', 'info');
            
            const response = await fetch('/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.currentFile = result.filename;
                this.originalFileName = result.originalName;
                this.showFileInfo(result.originalName);
                this.activateStep(2);
                this.showToast('파일 업로드 완료!', 'success');
            } else {
                this.showToast('파일 업로드 실패: ' + result.error, 'error');
            }
        } catch (error) {
            this.showToast('파일 업로드 중 오류가 발생했습니다.', 'error');
        }
    }

    showFileInfo(originalName) {
        document.getElementById('fileName').textContent = originalName;
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('uploadArea').style.display = 'none';
    }

    removeFile() {
        this.currentFile = null;
        this.originalFileName = null;
        this.analysisData = null;
        document.getElementById('fileInput').value = ''; // Clear the file input
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('analysisResult').innerHTML = '';
        this.activateStep(1);
    }

    async analyzeFile() {
        if (!this.currentFile) {
            this.showToast('먼저 파일을 선택해주세요.', 'error');
            return;
        }

        try {
            document.getElementById('analyzeBtn').disabled = true;
            document.getElementById('analyzeBtn').innerHTML = '<i class="fas fa-spinner fa-spin"></i> 분석 중...';

            const response = await fetch('/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: this.currentFile })
            });

            const result = await response.json();
            
            if (result.success) {
                this.analysisData = result.analysis;
                this.displayAnalysis(result.analysis);
                this.activateStep(3);
                this.showToast('폰트 분석 완료!', 'success');
            } else {
                this.showToast('분석 실패: ' + result.error, 'error');
            }
        } catch (error) {
            this.showToast('분석 중 오류가 발생했습니다.', 'error');
        } finally {
            document.getElementById('analyzeBtn').disabled = false;
            document.getElementById('analyzeBtn').innerHTML = '<i class="fas fa-search"></i> 폰트 분석 시작';
        }
    }

    displayAnalysis(analysis) {
        const resultDiv = document.getElementById('analysisResult');
        resultDiv.innerHTML = `<pre>${analysis}</pre>`;
        resultDiv.style.display = 'block';
        
        // 폰트 정보 파싱하여 드롭다운과 체크박스 업데이트
        this.parseFontInfo(analysis);
    }

    parseFontInfo(analysis) {
        // 임베딩된 폰트 목록 추출
        const embeddedFonts = new Set();
        const lines = analysis.split('\n');
        let inEmbedList = false;
        
        for (const line of lines) {
            if (line.includes('fontEmbedList:')) {
                inEmbedList = true;
                continue;
            }
            if (inEmbedList && line.includes('fontTheme:')) {
                inEmbedList = false;
                continue;
            }
            if (inEmbedList && line.includes('typeface:')) {
                const match = line.match(/typeface:\s*(.+)/);
                if (match) {
                    embeddedFonts.add(match[1].trim());
                }
            }
        }

        // 참조된 폰트 목록 추출
        const referencedFonts = new Set();
        let inFontRefs = false;
        
        for (const line of lines) {
            if (line.includes('fontRefs:')) {
                inFontRefs = true;
                continue;
            }
            if (inFontRefs && line.trim() && !line.includes(':') && line.includes(' ')) {
                const match = line.match(/^\s*([^:]+):\s*\d+/);
                if (match) {
                    const fontName = match[1].trim();
                    if (!fontName.startsWith('+')) {
                        referencedFonts.add(fontName);
                    }
                }
            }
        }

        // 모든 폰트 목록 (임베딩된 폰트 + 참조된 폰트)
        const allFonts = new Set([...embeddedFonts, ...referencedFonts]);
        
        this.updateFontSelectors(Array.from(allFonts));
        this.updateFontCheckboxes(Array.from(embeddedFonts), Array.from(referencedFonts));
    }

    updateFontSelectors(fonts) {
        // 매핑 드롭다운 업데이트
        const mappingItems = document.querySelectorAll('.mapping-item');
        mappingItems.forEach(item => {
            const fromSelect = item.querySelector('.mapping-from');
            const toSelect = item.querySelector('.mapping-to');
            
            // 기존 옵션 제거 (첫 번째 옵션 제외)
            while (fromSelect.children.length > 1) {
                fromSelect.removeChild(fromSelect.lastChild);
            }
            while (toSelect.children.length > 1) {
                toSelect.removeChild(toSelect.lastChild);
            }
            
            // 새 옵션 추가
            fonts.forEach(font => {
                const fromOption = document.createElement('option');
                fromOption.value = font;
                fromOption.textContent = font;
                fromSelect.appendChild(fromOption);
                
                const toOption = document.createElement('option');
                toOption.value = font;
                toOption.textContent = font;
                toSelect.appendChild(toOption);
            });
        });
    }

    updateFontCheckboxes(embeddedFonts, referencedFonts) {
        const fontList = document.getElementById('fontList');
        fontList.innerHTML = '';
        
        // 임베딩된 폰트들을 우선적으로 표시
        embeddedFonts.forEach(font => {
            const fontItem = document.createElement('div');
            fontItem.className = 'font-item';
            fontItem.innerHTML = `
                <input type="checkbox" id="font-${font.replace(/\s+/g, '-')}" value="${font}">
                <label for="font-${font.replace(/\s+/g, '-')}">${font} <span style="color: #28a745;">(임베딩됨)</span></label>
            `;
            fontList.appendChild(fontItem);
        });
        
        // 참조만 된 폰트들 표시
        referencedFonts.forEach(font => {
            if (!embeddedFonts.includes(font)) {
                const fontItem = document.createElement('div');
                fontItem.className = 'font-item';
                fontItem.innerHTML = `
                    <input type="checkbox" id="font-${font.replace(/\s+/g, '-')}" value="${font}">
                    <label for="font-${font.replace(/\s+/g, '-')}">${font} <span style="color: #dc3545;">(참조만)</span></label>
                `;
                fontList.appendChild(fontItem);
            }
        });
    }

    addMappingItem() {
        const container = document.getElementById('fontMappings');
        const addButton = container.querySelector('button');
        
        const mappingItem = document.createElement('div');
        mappingItem.className = 'mapping-item';
        mappingItem.innerHTML = `
            <select class="mapping-from">
                <option value="">기존 폰트 선택</option>
            </select>
            <i class="fas fa-arrow-right"></i>
            <select class="mapping-to">
                <option value="">새 폰트 선택</option>
            </select>
            <button class="btn btn-danger btn-sm" onclick="removeMappingItem(this)">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        container.insertBefore(mappingItem, addButton);
        
        // 기존 폰트 목록이 있다면 새 드롭다운에도 추가
        if (this.analysisData) {
            this.parseFontInfo(this.analysisData);
        }
    }

    removeMappingItem(button) {
        button.parentElement.remove();
    }

    async processFile() {
        if (!this.currentFile) {
            this.showToast('먼저 파일을 선택해주세요.', 'error');
            return;
        }

        const options = this.collectOptions();
        
        try {
            document.getElementById('processBtn').disabled = true;
            this.showProgress();

            console.log('Sending to server:', {
                filename: this.currentFile,
                originalName: this.originalFileName,
                options: options
            });
            
            const response = await fetch('/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    filename: this.currentFile,
                    originalName: this.originalFileName,
                    options: options
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showResult(result.outputFile);
                this.showToast('폰트 수술 완료!', 'success');
            } else {
                this.showToast('수술 실패: ' + result.error, 'error');
                this.hideProgress();
            }
        } catch (error) {
            this.showToast('수술 중 오류가 발생했습니다.', 'error');
            this.hideProgress();
        } finally {
            document.getElementById('processBtn').disabled = false;
        }
    }

    collectOptions() {
        const options = {
            removeEmbed: document.getElementById('removeEmbed').checked,
            verbose: document.getElementById('verbose').checked,
            fontMappings: [],
            fontCleanup: ''
        };

        // Font mappings
        if (document.getElementById('enableMapping').checked) {
            const mappingItems = document.querySelectorAll('.mapping-item');
            mappingItems.forEach(item => {
                const from = item.querySelector('.mapping-from').value.trim();
                const to = item.querySelector('.mapping-to').value.trim();
                if (from && to) {
                    options.fontMappings.push({ from, to });
                }
            });
        }

        // Font cleanup
        if (document.getElementById('enableCleanup').checked) {
            const selectedFonts = [];
            const checkboxes = document.querySelectorAll('#fontList input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                selectedFonts.push(checkbox.value);
            });
            options.fontCleanup = selectedFonts.join(',');
        }

        return options;
    }

    showProgress() {
        document.getElementById('progressContainer').style.display = 'block';
        this.updateProgress(0, '준비 중...');
        
        // verbose 모드 확인
        const isVerbose = document.getElementById('verbose').checked;
        if (isVerbose) {
            document.getElementById('verboseLog').style.display = 'block';
            document.getElementById('logContent').innerHTML = '';
        }
    }

    showVerboseLog(message) {
        const logContent = document.getElementById('logContent');
        if (logContent) {
            logContent.innerHTML += message + '\n';
            logContent.scrollTop = logContent.scrollHeight;
        }
    }

    updateProgress(percent, message) {
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = message;
    }

    hideProgress() {
        document.getElementById('progressContainer').style.display = 'none';
    }

    showResult(outputFile) {
        this.hideProgress();
        document.getElementById('resultContainer').style.display = 'block';
        
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.onclick = () => {
            window.location.href = `/download/${outputFile}`;
        };
    }

    activateStep(stepNumber) {
        document.querySelectorAll('.step-card').forEach((card, index) => {
            if (index + 1 <= stepNumber) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });
    }

    setupImageRotation() {
        const images = document.querySelectorAll('.header-img');
        let currentIndex = 0;
        
        if (images.length === 0) return;
        
        setInterval(() => {
            // 다음 이미지로 이동
            const nextIndex = (currentIndex + 1) % images.length;
            
            // 현재 이미지 페이드 아웃
            images[currentIndex].classList.remove('active');
            
            // 새 이미지 페이드 인
            images[nextIndex].classList.add('active');
            
            currentIndex = nextIndex;
        }, 2500);
    }

    setupThemeToggle() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        // 저장된 테마 불러오기
        const savedTheme = localStorage.getItem('pptx-surgeon-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeIcon.className = 'fas fa-sun';
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                themeIcon.className = 'fas fa-sun';
                localStorage.setItem('pptx-surgeon-theme', 'dark');
            } else {
                themeIcon.className = 'fas fa-moon';
                localStorage.setItem('pptx-surgeon-theme', 'light');
            }
        });
    }

    setupLanguageToggle() {
        const languageToggle = document.getElementById('languageToggle');
        const languageText = document.getElementById('languageText');
        
        // 저장된 언어 불러오기
        const savedLanguage = localStorage.getItem('pptx-surgeon-language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            languageText.textContent = savedLanguage === 'ko' ? '한' : 'EN';
        }
        
        languageToggle.addEventListener('click', () => {
            this.currentLanguage = this.currentLanguage === 'ko' ? 'en' : 'ko';
            languageText.textContent = this.currentLanguage === 'ko' ? '한' : 'EN';
            localStorage.setItem('pptx-surgeon-language', this.currentLanguage);
            this.updateLanguage();
        });
    }

    loadLanguage() {
        const savedLanguage = localStorage.getItem('pptx-surgeon-language');
        if (savedLanguage) {
            this.currentLanguage = savedLanguage;
            document.getElementById('languageText').textContent = savedLanguage === 'ko' ? '한' : 'EN';
        }
        this.updateLanguage();
    }

    updateLanguage() {
        const t = this.translations[this.currentLanguage];
        
        // 단계 제목 업데이트
        const stepTitles = document.querySelectorAll('.step-header h2');
        if (stepTitles[0]) stepTitles[0].textContent = t.step1Title;
        if (stepTitles[1]) stepTitles[1].textContent = t.step2Title;
        if (stepTitles[2]) stepTitles[2].textContent = t.step3Title;
        if (stepTitles[3]) stepTitles[3].textContent = t.step4Title;
        
        // 업로드 영역 텍스트 업데이트
        const uploadText = document.querySelector('.upload-area p');
        if (uploadText) uploadText.textContent = t.uploadText;
        
        const selectFileBtn = document.querySelector('.upload-area .btn');
        if (selectFileBtn) selectFileBtn.textContent = t.selectFile;
        
        // 분석 버튼 업데이트
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn && !analyzeBtn.disabled) {
            analyzeBtn.innerHTML = `<i class="fas fa-search"></i> ${t.analyzeStart}`;
        }
        
        // 수술 버튼 업데이트
        const processBtn = document.getElementById('processBtn');
        if (processBtn && !processBtn.disabled) {
            processBtn.innerHTML = `<i class="fas fa-play"></i> ${t.surgeryStart}`;
        }
        
        // 옵션 레이블 업데이트
        const optionLabels = document.querySelectorAll('.checkbox-label');
        if (optionLabels[0]) {
            optionLabels[0].querySelector('span:not(.checkmark)').textContent = t.removeEmbed;
            optionLabels[0].querySelector('small').textContent = t.removeEmbedDesc;
        }
        if (optionLabels[1]) {
            optionLabels[1].querySelector('span:not(.checkmark)').textContent = t.fontMapping;
            optionLabels[1].querySelector('small').textContent = t.fontMappingDesc;
        }
        if (optionLabels[2]) {
            optionLabels[2].querySelector('span:not(.checkmark)').textContent = t.fontCleanup;
            optionLabels[2].querySelector('small').textContent = t.fontCleanupDesc;
        }
        if (optionLabels[3]) {
            optionLabels[3].querySelector('span:not(.checkmark)').textContent = t.verboseLog;
        }
        
        // 성공 메시지 업데이트
        const successTitle = document.querySelector('.success-message h3');
        const successDesc = document.querySelector('.success-message p');
        const downloadBtn = document.getElementById('downloadBtn');
        
        if (successTitle) successTitle.textContent = t.surgeryComplete;
        if (successDesc) successDesc.textContent = t.surgeryCompleteDesc;
        if (downloadBtn) {
            downloadBtn.innerHTML = `<i class="fas fa-download"></i> ${t.downloadResult}`;
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    'info-circle';
        
        toast.innerHTML = `
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 5000);
    }
}

// Global functions for HTML onclick handlers
function addMappingItem() {
    window.surgeonUI.addMappingItem();
}

function removeMappingItem(button) {
    window.surgeonUI.removeMappingItem(button);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.surgeonUI = new PPTXSurgeonUI();
});