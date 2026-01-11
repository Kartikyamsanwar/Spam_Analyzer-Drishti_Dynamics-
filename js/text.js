const input = document.getElementById("textInput");
const analyzeBtn = document.getElementById("textAnalyzeBtn");
const resultCard = document.getElementById("resultCardText");
const scanOverlay = document.getElementById("scanOverlay");

analyzeBtn.addEventListener("click", () => {
    const text = input.value.trim();
    
    if (text.length < 5) {
        alert("Please enter a bit more text for accurate analysis.");
        return;
    }

    // Start UI Animation
    scanOverlay.classList.remove("d-none");
    resultCard.classList.add("d-none");

    setTimeout(() => {
        const result = analyzeText(text);
        renderResult(result);
        
        scanOverlay.classList.add("d-none");
        resultCard.classList.remove("d-none");
    }, 1800); // 1.8 seconds delay for realistic feel
});

function analyzeText(text) {
    const t = text.toLowerCase();
    let spam = 0;
    let phish = 0;
    let reasons = [];

    // Detection Arrays
    const urgency = ["urgent", "immediately", "act now", "limited time", "expire", "blocked", "suspended"];
    const money = ["win", "prize", "cash", "lottery", "reward", "free", "bonus", "claim"];
    const sensitive = ["otp", "password", "pin", "cvv", "bank", "kyc", "verify", "login"];

    urgency.forEach(w => { if(t.includes(w)){ spam += 20; reasons.push("Psychological Pressure (Urgency)"); }});
    money.forEach(w => { if(t.includes(w)){ spam += 25; reasons.push("Financial Baiting"); }});
    sensitive.forEach(w => { if(t.includes(w)){ phish += 30; reasons.push("Credential Harvesting Intent"); }});

    if (/https?:\/\/|bit\.ly|tinyurl/.test(t)) {
        phish += 35;
        reasons.push("Suspicious Link detected");
    }

    if (/\d{10,}/.test(t)) {
        phish += 20;
        reasons.push("Unsolicited Contact/Account Number");
    }

    // Caps lock detection (Common in spam)
    if (text === text.toUpperCase() && text.length > 20) {
        spam += 15;
        reasons.push("Excessive Capitalization");
    }

    spam = Math.min(spam, 100);
    phish = Math.min(phish, 100);

    let verdict = "SAFE";
    let color = "#00ff88"; // Green

    if (spam > 60 || phish > 60) {
        verdict = "MALICIOUS / SCAM";
        color = "#ff4d4d"; // Red
    } else if (spam > 30 || phish > 30) {
        verdict = "SUSPICIOUS";
        color = "#ffaa00"; // Orange
    }

    return { spam, phish, verdict, color, reasons: [...new Set(reasons)] };
}

function renderResult(r) {
    resultCard.innerHTML = `
        <div class="text-center mb-4">
            <h2 style="color: ${r.color}; font-weight: 800; text-shadow: 0 0 15px ${r.color}55;">${r.verdict}</h2>
            <p class="text-white-50 small">Drishti Neural Analysis Engine Result</p>
        </div>

        <div class="mb-4">
            <div class="d-flex justify-content-between text-white mb-1">
                <span>Spam Probability</span>
                <span>${r.spam}%</span>
            </div>
            <div class="progress">
                <div class="progress-bar" style="width: ${r.spam}%; background-color: ${r.color};"></div>
            </div>
        </div>

        <div class="mb-4">
            <div class="d-flex justify-content-between text-white mb-1">
                <span>Phishing Risk</span>
                <span>${r.phish}%</span>
            </div>
            <div class="progress">
                <div class="progress-bar" style="width: ${r.phish}%; background-color: ${r.color === '#00ff88' ? '#00d4ff' : r.color};"></div>
            </div>
        </div>

        <div class="reasons-box mt-3">
            <h6 class="text-white border-bottom border-secondary pb-2">Key Indicators:</h6>
            <ul class="list-unstyled mt-2">
                ${r.reasons.length > 0 
                    ? r.reasons.map(msg => `<li class="text-white-50 mb-1"><i class="fas fa-exclamation-triangle text-magenta me-2" style="font-size: 12px;"></i> ${msg}</li>`).join('')
                    : '<li class="text-success small">No high-risk patterns detected in this text.</li>'
                }
            </ul>
        </div>
    `;
}