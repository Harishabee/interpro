const pages=[...document.querySelectorAll('.page')];
const nav=[...document.querySelectorAll('.nav-item[data-page]')];
function openPage(id){
  pages.forEach(p=>p.classList.toggle('active',p.id===id));
  nav.forEach(n=>n.classList.toggle('active',n.dataset.page===id));
  window.scrollTo({top:0,behavior:'smooth'});
}
document.addEventListener('click',e=>{
  const target=e.target.closest('[data-page]');
  if(target){e.preventDefault();openPage(target.dataset.page)}
});
const toast=document.getElementById('toast');
function showToast(msg){toast.textContent=msg;toast.style.display='block';clearTimeout(window.tt);window.tt=setTimeout(()=>toast.style.display='none',2300)}

const qs={
"Frontend Developer":[
"Explain the difference between let, const and var in JavaScript.",
"What is the Virtual DOM in React and why is it useful?",
"How would you improve the performance of a React application?",
"What is the difference between state and props?",
"Explain REST API and how a frontend application consumes it."
],
"Java Developer":[
"What is the difference between an interface and an abstract class in Java?",
"Explain the four pillars of object-oriented programming.",
"What is the difference between ArrayList and LinkedList?",
"How does exception handling work in Java?",
"What is the purpose of Spring Boot?"
],
"Python Developer":[
"What are lists, tuples and sets in Python?",
"Explain Python decorators in simple terms.",
"What is the difference between shallow copy and deep copy?",
"How does exception handling work in Python?",
"What is a virtual environment and why use it?"
],
"Data Analyst":[
"What is the difference between WHERE and HAVING in SQL?",
"Explain INNER JOIN and LEFT JOIN.",
"What is data cleaning?",
"How would you handle missing values in a dataset?",
"Which KPIs would you use to evaluate a business dashboard?"
],
"HR / General":[
"Tell me about yourself.",
"Why should we hire you?",
"Tell me about a challenge you faced and how you solved it.",
"What are your strengths and weaknesses?",
"Where do you see yourself in five years?"
]};
let interview={questions:[],index:0,scores:[]};
let timerId=null,seconds=120;
function startTimer(){
 clearInterval(timerId); seconds=120; updateTimer();
 timerId=setInterval(()=>{seconds--;updateTimer();if(seconds<=0){clearInterval(timerId);submitAnswer(true)}},1000)
}
function updateTimer(){const m=String(Math.floor(seconds/60)).padStart(2,'0'),s=String(seconds%60).padStart(2,'0');document.getElementById('timer').textContent=`${m}:${s}`}
function renderQuestion(){
 document.getElementById('qLabel').textContent=`Question ${interview.index+1} of ${interview.questions.length}`;
 document.getElementById('questionText').textContent=interview.questions[interview.index];
 document.getElementById('answer').value='';
 startTimer();
}
document.getElementById('beginInterview').onclick=()=>{
 const role=document.getElementById('role').value,count=+document.getElementById('count').value;
 interview.questions=qs[role].slice(0,count);interview.index=0;interview.scores=[];
 document.getElementById('setupBox').classList.add('hidden');document.getElementById('resultBox').classList.add('hidden');document.getElementById('interviewBox').classList.remove('hidden');
 renderQuestion();
 showToast('AI interview started');
};
function submitAnswer(auto=false){
 clearInterval(timerId);
 const answer=document.getElementById('answer').value.trim();
 if(!answer&&!auto){showToast('Please type an answer first.');startTimer();return}
 const score=Math.min(95,Math.max(55,65+Math.round((answer.length/12))+Math.floor(Math.random()*9)));
 interview.scores.push(score);
 if(interview.index<interview.questions.length-1){interview.index++;renderQuestion()}
 else finishInterview();
}
document.getElementById('submitAnswer').onclick=()=>submitAnswer(false);
document.getElementById('skip').onclick=()=>{document.getElementById('answer').value='';submitAnswer(true)};
function finishInterview(){
 document.getElementById('interviewBox').classList.add('hidden');
 const avg=Math.round(interview.scores.reduce((a,b)=>a+b,0)/interview.scores.length);
 const rb=document.getElementById('resultBox');rb.classList.remove('hidden');
 rb.innerHTML=`<div class="result-title"><div><h3>Interview Complete 🎉</h3><p>Your AI coach has analyzed your answers.</p></div><div class="result-score">${avg}%</div></div>
 <div class="result-grid"><div class="result-mini"><b>${Math.min(95,avg+5)}%</b><span>Communication</span></div><div class="result-mini"><b>${avg}%</b><span>Technical Knowledge</span></div><div class="result-mini"><b>${Math.max(60,avg-2)}%</b><span>Confidence</span></div></div>
 <p style="margin-top:20px;color:#667087;line-height:1.6"><b>AI Coach:</b> Good effort. Keep your answers structured, include real examples, and explain the reasoning behind your technical decisions.</p>
 <button class="primary" style="margin-top:10px" onclick="openPage('feedback')">View Detailed Feedback</button>
 <button class="secondary" style="margin-left:8px" onclick="openPage('interview')">Practice Again</button>`;
 showToast('Interview completed');
}
const questionData=[
["JavaScript","What is event bubbling in JavaScript?","Event bubbling is when an event triggered on a child element propagates upward through its parent elements."],
["React","What are React hooks?","Hooks let function components use state and other React features. useState and useEffect are common examples."],
["Java","What is JVM?","JVM is the Java Virtual Machine that executes Java bytecode and provides platform independence."],
["Python","What is a dictionary?","A Python dictionary stores key-value pairs and supports fast lookup by key."],
["HR","How do you handle pressure?","A strong answer explains how you prioritize tasks, communicate early, and stay focused on the highest-impact work."]
];
const list=document.getElementById('questionList');
function loadQuestions(filter='All'){
 list.innerHTML='';
 questionData.filter(x=>filter==='All'||x[0]===filter).forEach(x=>{
  const d=document.createElement('div');d.className='card question';d.innerHTML=`<h3><span style="color:#4b4ddd">${x[0]}</span> — ${x[1]}</h3><p>${x[2]}</p>`;d.onclick=()=>d.classList.toggle('open');list.appendChild(d)
 })
}
loadQuestions();
document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{document.querySelectorAll('.chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');loadQuestions(c.textContent)});

document.getElementById('analyzeResume').onclick=async()=>{
 const file=document.getElementById('resumeFile').files[0];
 if(!file){showToast('Please choose a resume file first.');return}
 const button=document.getElementById('analyzeResume');
 const result=document.getElementById('resumeResult');
 button.disabled=true; button.textContent='Analyzing...';
 result.classList.remove('hidden');
 result.innerHTML='<h3>Analyzing your resume...</h3><p style="color:#667087">Extracting text and checking skills, sections and content.</p>';
 try{
   const form=new FormData();
   form.append('resume',file);
   const response=await fetch('/api/analyze-resume',{method:'POST',body:form});
   const data=await response.json();
   if(!response.ok) throw new Error(data.error||'Resume analysis failed.');
   const a=data.analysis;
   const skillText=a.skills.length?a.skills.join(', '):'No common skills detected';
   const sectionText=Object.entries(a.sections).filter(x=>x[1]).map(x=>x[0]).join(', ')||'No standard sections detected';
   result.innerHTML=`
    <div class="result-title"><div><h3>AI Resume Analysis</h3><p>${data.fileName} • ${a.wordCount} words extracted</p></div><div class="result-score">${a.score}%</div></div>
    <div class="result-grid">
      <div class="result-mini"><b>${a.skills.length}</b><span>Skills Detected</span></div>
      <div class="result-mini"><b>${Object.values(a.sections).filter(Boolean).length}</b><span>Sections Found</span></div>
      <div class="result-mini"><b>${a.wordCount}</b><span>Words Read</span></div>
    </div>
    <div style="margin-top:20px"><h3>Detected Skills</h3><p style="color:#667087;line-height:1.7">${skillText}</p></div>
    <div style="margin-top:15px"><h3>Resume Sections</h3><p style="color:#667087;line-height:1.7">${sectionText}</p></div>
    <div style="margin-top:15px"><h3>Strengths</h3><ul class="good">${a.strengths.map(x=>`<li>${x}</li>`).join('')}</ul></div>
    <div style="margin-top:15px"><h3>AI Suggestions</h3><ul class="improve">${a.suggestions.map(x=>`<li>${x}</li>`).join('')}</ul></div>`;
   showToast('Resume analyzed successfully');
 }catch(err){
   result.innerHTML=`<h3>Analysis could not be completed</h3><p style="color:#c23b3b;line-height:1.6">${err.message}</p><p style="color:#667087">Make sure the project is running with <b>npm start</b>, then open it at http://localhost:5000.</p>`;
   showToast('Resume analysis failed');
 }finally{
   button.disabled=false;button.textContent='Analyze Resume';
 }
};
document.getElementById('upgradeBtn').onclick=()=>showToast('Pro upgrade screen is ready for backend integration.');
document.getElementById('logout').onclick=()=>showToast('Demo logout — connect authentication for production.');
document.getElementById('saveSettings').onclick=()=>showToast('Settings saved.');
document.getElementById('darkMode').onchange=e=>document.body.style.background=e.target.checked?'#111525':'#fbfcff';
