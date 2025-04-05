// Simple in-memory storage (replace with real server in production)
const sharedFiles = new Map();
let uniqueId = Date.now();

function generateUniqueLink() {
    return `${window.location.origin}/download/${uniqueId++}`;
}

function uploadFiles() {
    const fileInput = document.getElementById('fileInput');
    const files = fileInput.files;
    const fileList = document.getElementById('files');
    const status = document.getElementById('status');

    if (files.length === 0) {
        status.textContent = 'Please select files to upload';
        return;
    }

    status.textContent = 'Uploading...';
    
    // Simulate upload process
    setTimeout(() => {
        Array.from(files).forEach(file => {
            const link = generateUniqueLink();
            sharedFiles.set(link, file);
            
            const li = document.createElement('li');
            li.innerHTML = `
                ${file.name} (${(file.size / 1024).toFixed(2)} KB)
                <a href="${link}" download="${file.name}">Download</a>
            `;
            fileList.appendChild(li);
        });

        status.textContent = 'Files uploaded successfully!';
        generateQRCode();
    }, 1000);
}

function generateQRCode() {
    const qrDiv = document.getElementById('qrcode');
    qrDiv.innerHTML = ''; // Clear previous QR code
    
    const qrUrl = `${window.location.origin}/mobile`;
    new QRCode(qrDiv, {
        text: qrUrl,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Handle download (simplified - in production, use proper server)
window.addEventListener('load', () => {
    const path = window.location.pathname;
    if (path.startsWith('/download/')) {
        const link = window.location.href;
        const file = sharedFiles.get(link);
        if (file) {
            const url = URL.createObjectURL(file);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    } else {
        generateQRCode();
    }
});