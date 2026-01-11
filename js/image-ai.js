// js/image-ai.js
let net;

// 1. AI Model Load karna (Real Image Recognition ke liye)
async function loadAI() {
    console.log('AI Model loading...');
    net = await mobilenet.load();
    console.log('AI Model Loaded Successfully!');
}
loadAI();

document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById("imageInput");
    const uploadBox = document.getElementById("imageUploadBox");
    const analyzeBtn = document.getElementById("imageAnalyzeBtn");
    const progressBox = document.getElementById("imageProgressBox");
    const resultCard = document.getElementById("resultCardimage");
    const fileNameDisplay = document.getElementById("imageFileName");

    // Click to upload
    uploadBox.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            fileNameDisplay.innerText = "File Selected: " + e.target.files[0].name;
            resultCard.classList.add('d-none');
        }
    });

    analyzeBtn.addEventListener("click", async () => {
        if (!imageInput.files[0]) return alert("Bhai, image toh daal pehle!");
        if (!net) return alert("AI Model load ho raha hai, 2 second ruko...");

        // UI Reset
        progressBox.style.display = "block";
        resultCard.classList.add('d-none');

        // Image Processing
        const file = imageInput.files[0];
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            // --- REAL AI SCANNING START ---
            const result = await net.classify(img);
            console.log("AI Predictions:", result);

            let spamProb = 15; 
            let phishProb = 10;
            let findings = [];

            // AI Predictions ke base par logic
            result.forEach(prediction => {
                const label = prediction.className.toLowerCase();
                
                // Agar QR code ya digital screen detect hui
                if (label.includes('barcode') || label.includes('screen') || label.includes('monitor')) {
                    phishProb += 65;
                    findings.push("Digital phishing pattern (QR/Screen) detected");
                }
                // Agar documents ya packets detect hue
                if (label.includes('envelope') || label.includes('packet') || label.includes('paper')) {
                    spamProb += 50;
                    findings.push("Suspicious document/mail format");
                }
            });

            // Final Result Display
            setTimeout(() => {
                progressBox.style.display = "none";
                resultCard.classList.remove('d-none');

                const isThreat = (spamProb > 45 || phishProb > 45);
                const title = document.getElementById("resultTitle");
                const tag = document.getElementById("resultTag");

                title.innerText = isThreat ? "THREAT DETECTED" : "IMAGE IS SAFE";
                title.style.color = isThreat ? "#ff4d4d" : "#00ff88";
                
                tag.innerText = isThreat ? "DANGER" : "CLEAN";
                tag.className = isThreat ? "badge bg-danger" : "badge bg-success";

                document.getElementById("confidenceScore").innerText = (result[0].probability * 100).toFixed(1) + "%";
                document.getElementById("aiExplanation").innerText = "AI Vision identifies: " + result[0].className + ". " + (findings[0] || "No malicious visual triggers found.");

                // Progress Bars update
                const sBar = document.getElementById("SpamBar");
                const pBar = document.getElementById("PhishBar");
                
                sBar.style.width = Math.min(spamProb, 100) + "%";
                sBar.style.backgroundColor = spamProb > 45 ? "#ff4d4d" : "#00ff88";
                
                pBar.style.width = Math.min(phishProb, 100) + "%";
                pBar.style.backgroundColor = phishProb > 45 ? "#ff4d4d" : "#00ff88";

            }, 1000);
        };
    });
});