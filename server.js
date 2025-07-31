const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('error', (err) => {
    if (err.code !== 'EADDRINUSE') {
        console.error('WebSocket Server Error:', err);
    }
});

// 업로드 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname).toLowerCase() === '.pptx') {
            cb(null, true);
        } else {
            cb(new Error('Only .pptx files are allowed!'), false);
        }
    }
});

app.use(express.static('public'));
app.use(express.json());

// WebSocket 연결 관리
const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected');

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
});

// 모든 클라이언트에게 메시지 브로드캐스트
function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
        }
    });
}

// 파일 업로드 엔드포인트
app.post('/upload', upload.single('pptxFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    res.json({
        success: true,
        filename: req.file.filename,
        originalName: req.file.originalname
    });
});

// 폰트 정보 분석 엔드포인트
app.post('/analyze', (req, res) => {
    const { filename } = req.body;
    const filePath = path.join('uploads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    broadcast({ type: 'progress', message: 'Analyzing font information...', progress: 20 });

    const child = spawn('node', ['pptx-surgeon.js', '-d', filePath]);
    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
        output += data.toString();
    });

    child.stderr.on('data', (data) => {
        error += data.toString();
    });

    child.on('close', (code) => {
        if (code === 0) {
            broadcast({ type: 'progress', message: 'Analysis complete!', progress: 100 });
            res.json({ success: true, analysis: output });
        } else {
            broadcast({ type: 'error', message: 'Analysis failed' });
            res.status(500).json({ error: error || 'Analysis failed' });
        }
    });
});

// 폰트 수술 실행 엔드포인트
app.post('/process', (req, res) => {
    const { filename, originalName, options } = req.body;
    console.log('Processing file:', { filename, originalName });
    
    const filePath = path.join('uploads', filename);
    const outputFileName = 'nice_' + (originalName || filename);
    const outputPath = path.join('uploads', outputFileName);
    
    console.log('Output will be:', outputFileName);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    // pptx-surgeon 명령어 구성
    const args = ['pptx-surgeon.js'];

    if (options.verbose) {
        args.push('-v', '2');
    }

    if (options.removeEmbed) {
        args.push('-r');
        broadcast({ type: 'progress', message: 'Removing font embeddings...', progress: 30 });
    }

    if (options.fontMappings && options.fontMappings.length > 0) {
        options.fontMappings.forEach(mapping => {
            if (mapping.from && mapping.to) {
                args.push('-m', `${mapping.from}=${mapping.to}`);
            }
        });
        broadcast({ type: 'progress', message: 'Applying font mappings...', progress: 50 });
    }

    if (options.fontCleanup) {
        args.push('-c', options.fontCleanup);
        broadcast({ type: 'progress', message: 'Cleaning up fonts...', progress: 60 });
    }

    args.push('-o', outputPath, filePath);

    broadcast({ type: 'progress', message: 'Starting font surgery...', progress: 10 });

    const child = spawn('node', args);
    let output = '';
    let error = '';

    child.stdout.on('data', (data) => {
        const dataStr = data.toString();
        output += dataStr;
        
        // verbose 모드일 때 실시간 로그 전송
        if (options.verbose) {
            broadcast({ 
                type: 'verbose', 
                message: dataStr.trim(),
                progress: 70 
            });
        } else {
            broadcast({ type: 'progress', message: 'Processing...', progress: 70 });
        }
    });

    child.stderr.on('data', (data) => {
        const dataStr = data.toString();
        error += dataStr;
        
        // verbose 모드일 때 에러도 실시간으로 전송
        if (options.verbose) {
            broadcast({ 
                type: 'verbose', 
                message: `ERROR: ${dataStr.trim()}`,
                progress: 70 
            });
        }
    });

    child.on('close', (code) => {
        if (code === 0) {
            broadcast({ type: 'progress', message: 'Surgery complete!', progress: 100 });
            res.json({
                success: true,
                outputFile: outputFileName,
                message: 'Font surgery completed successfully!'
            });
        } else {
            broadcast({ type: 'error', message: 'Surgery failed: ' + error });
            res.status(500).json({ error: error || 'Processing failed' });
        }
    });
});

// 파일 다운로드 엔드포인트
app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('uploads', filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath, filename);
});

const PORT = process.env.PORT || 3000;

const startServer = (port) => {
    server.listen(port, () => {
        console.log(`🚀 PPTX Surgeon Web Interface running on http://localhost:${port}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`❌ Port ${port} is busy, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer(PORT);