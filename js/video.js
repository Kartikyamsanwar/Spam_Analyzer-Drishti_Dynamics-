document.addEventListener("DOMContentLoaded", () => {

const videoInput = document.getElementById("imageInput");
const uploadBox = document.getElementById("imageUploadBox");
const analyzeBtn = document.getElementById("imageAnalyzeBtn");
const btnText = document.getElementById("btnText");
const progressBox = document.getElementById("imageProgressBox");
const resultCard = document.getElementById("resultCardimage");
const fileName = document.getElementById("imageFileName");

const resTitle = document.getElementById("resultTitle");
const resTag = document.getElementById("resultTag");
const resConf = document.getElementById("confidenceScore");
const resExp = document.getElementById("aiExplanation");
const spamBar = document.getElementById("SpamBar");
const phishBar = document.getElementById("PhishBar");
const spamPercent = document.getElementById("spamPercent");
const phishPercent = document.getElementById("phishPercent");

uploadBox.onclick = () => videoInput.click();

videoInput.onchange = () => {
  if(videoInput.files.length){
    fileName.innerText = videoInput.files[0].name;
    resultCard.classList.add("d-none");
  }
};

analyzeBtn.onclick = async () => {
  if(!videoInput.files[0]) return alert("Upload video first!");

  progressBox.classList.remove("d-none");
  resultCard.classList.add("d-none");
  btnText.innerText = "SCANNING...";

  const video = document.createElement("video");
  video.src = URL.createObjectURL(videoInput.files[0]);
  video.muted = true;

  video.onloadedmetadata = async () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth/2;
    canvas.height = video.videoHeight/2;

    let text = "";

    for(let i=1;i<=4;i++){
      video.currentTime = (video.duration/5)*i;
      await new Promise(r=>video.onseeked=r);
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      const ocr = await Tesseract.recognize(canvas.toDataURL(),"eng");
      text += ocr.data.text.toLowerCase();
    }

    runAI(text);
  };
};

function runAI(text){
  let spam=15, phish=10;
  let reasons=[];

  ["win","free","cash","gift","prize","offer"].forEach(w=>{if(text.includes(w)){spam+=25;reasons.push(w);}});
  ["bank","otp","login","kyc","password","verify"].forEach(w=>{if(text.includes(w)){phish+=30;reasons.push(w);}});

  const finalScore = Math.min(Math.max(spam,phish),98);
  const threat = finalScore>40;

  setTimeout(()=>{
    progressBox.classList.add("d-none");
    btnText.innerText = "START NEURAL SCAN";
    resultCard.classList.remove("d-none");

    resTitle.innerText = threat?"THREAT DETECTED":"VIDEO IS SAFE";
    resTag.innerText = threat?"DANGER":"CLEAN";
    resTag.className = threat?"badge bg-danger":"badge bg-success";

    resConf.innerText = finalScore+"%";
    resExp.innerText = threat?"Suspicious words: "+reasons.join(", "):"No scam patterns found";

    spamBar.style.width = Math.min(spam,100)+"%";
    phishBar.style.width = Math.min(phish,100)+"%";
    spamPercent.innerText = Math.min(spam,100)+"%";
    phishPercent.innerText = Math.min(phish,100)+"%";
  },800);
}

});
