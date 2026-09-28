/* ExamFace full frontend prototype. Production services should replace the local extraction stub. */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const app = $('#app');
const toast = $('#toast');
const sampleExam = {
  title:'RRB Assistant Practice — Demo Paper',
  duration:45,
  positive:1,
  negative:0.25,
  pauseAllowed:true,
  sections:[
    {id:'sec1',name:'Reasoning',questions:[
      {id:'q1',text:'Alia has to unpack her things in her new room. She had packed her things in six boxes which have been stacked one over another. Jewellery has been kept immediately above clothes. The box containing bedspreads is immediately below the box that has shoes.',options:['Jewellery','Clothes','Pillows','Shoes'],answer:3,image:null},
      {id:'q2',text:'If NORTH is coded as 12345 and SOUTH is coded as 67845, what is the code for THORN?',options:['45321','54321','45312','54123'],answer:0},
      {id:'q3',text:'Find the next number in the series: 3, 7, 15, 31, ?',options:['47','55','63','71'],answer:2},
      {id:'q4',text:'Statements: Some books are papers. All papers are files. Which conclusion follows?',options:['Some books are files','All books are files','No book is a file','All files are books'],answer:0}
    ]},
    {id:'sec2',name:'Numerical Ability',questions:[
      {id:'q5',text:'A train travels 240 km in 4 hours. What is its average speed?',options:['50 km/h','55 km/h','60 km/h','65 km/h'],answer:2},
      {id:'q6',text:'What is 18% of 250?',options:['35','40','45','50'],answer:2},
      {id:'q7',text:'The ratio of boys to girls is 3:5. If there are 64 students, how many are boys?',options:['18','24','30','40'],answer:1}
    ]},
    {id:'sec3',name:'English Language',questions:[
      {id:'q8',text:'Choose the word closest in meaning to “abundant”.',options:['Rare','Plentiful','Empty','Brief'],answer:1},
      {id:'q9',text:'Select the correctly spelled word.',options:['Accomodation','Accommodation','Acommodation','Accommadation'],answer:1},
      {id:'q10',text:'Choose the correct form: “Neither of the answers ___ correct.”',options:['are','were','is','have'],answer:2}
    ]},
    {id:'sec4',name:'General Awareness',questions:[
      {id:'q11',text:'Which planet is known for its prominent ring system?',options:['Mars','Venus','Saturn','Mercury'],answer:2},
      {id:'q12',text:'The headquarters of the Reserve Bank of India is in:',options:['New Delhi','Mumbai','Kolkata','Chennai'],answer:1}
    ]}
  ]
};
const state = {route:'home',exam:clone(sampleExam),section:0,qIndex:0,answers:{},marked:{},visited:{},divider:50,timeLeft:2700,paused:false,started:false,result:null,reviewIndex:0,extractionProgress:0,sourceName:'',answerKeyMode:'embedded'};
function clone(x){return JSON.parse(JSON.stringify(x))}
function allQuestions(){return state.exam.sections.flatMap((s,si)=>s.questions.map((q,qi)=>({...q,si,qi,sectionName:s.name}))) }
function currentQuestion(){return state.exam.sections[state.section]?.questions[state.qIndex]}
function currentFlatIndex(){let n=0;for(let i=0;i<state.section;i++)n+=state.exam.sections[i].questions.length;return n+state.qIndex}
function persist(){localStorage.setItem('examface-state',JSON.stringify({exam:state.exam,answers:state.answers,marked:state.marked,visited:state.visited,divider:state.divider,timeLeft:state.timeLeft,result:state.result}))}
function loadPersist(){try{const x=JSON.parse(localStorage.getItem('examface-state'));if(x){Object.assign(state,x)}}catch(e){}}
function toastMsg(msg){toast.textContent=msg;toast.classList.add('show');clearTimeout(window.__toast);window.__toast=setTimeout(()=>toast.classList.remove('show'),2400)}
function btn(label,cls='btn',action=''){return `<button class="${cls}" data-action="${action}">${label}</button>`}
function layout(content){return `<div class="app-shell"><header class="topbar"><div class="brand" data-action="home">Exam<span>Face</span></div><nav class="topnav">${btn('How it works','', 'how')} ${btn('Builder','', 'builder')} ${btn('Demo exam','', 'exam')} ${btn('Architecture','', 'architecture')}</nav></header>${content}</div>`}
function home(){return layout(`<main class="main"><section class="hero"><div><span class="eyebrow">FREE • NO SIGNUP • GLOBAL</span><h1>Turn your question paper into an exam.</h1><p>Upload an existing PDF, review the extracted questions, configure the test, and publish a clean browser-based exam. ExamFace keeps your original question wording and supports bilingual papers, images, sections, answer keys and exam-style navigation.</p><div class="actions">${btn('Upload question paper','btn primary','builder')} ${btn('Try exam interface','btn secondary','exam')}</div><div class="notice success" style="margin-top:18px">Local-first workflow: your prototype session stays in this browser. Production architecture separates PDF/OCR from the exam engine.</div></div><div class="hero-card"><div class="mock-window"><div class="mock-head"><span>ExamFace Practice Test</span><span>44:57</span></div><div class="mock-body"><div class="mock-main"><div class="mock-panel"><b>Question No 1</b><p>Directions: Alia has to unpack her things in her new room...</p><p>Jewellery has been kept immediately above clothes.</p></div><div class="mock-panel"><b>Question</b><p>What is in the box?</p><p>◯ Jewellery<br>◯ Clothes<br>◯ Pillows<br>◯ Shoes</p></div></div><div class="mock-side"><b>Question Palette</b><div class="mock-grid">${Array.from({length:20},(_,i)=>`<i>${i+1}</i>`).join('')}</div></div></div></div></div></section><section class="section"><h2>Built around the actual exam workflow</h2><p class="section-intro">The website is designed as a complete creator-to-candidate flow rather than a static PDF viewer.</p><div class="feature-grid"><div class="feature"><strong>PDF → structured questions</strong><p>Layout-aware extraction, repeated-header filtering, OCR fallback, image preservation and confidence scoring belong in an isolated PDF engine.</p></div><div class="feature"><strong>Review before publishing</strong><p>Edit question text, options, section names and answer keys before an exam is generated.</p></div><div class="feature"><strong>Exam-grade navigation</strong><p>Dynamic sections, palette states, timer, pause/resume, draggable question panels, Save & Next and Mark for Review & Next.</p></div><div class="feature"><strong>Anonymous by default</strong><p>No account is required for creators or candidates. Production storage can use expiring share links and automatic cleanup.</p></div><div class="feature"><strong>Configurable scoring</strong><p>Positive marks, negative marks, duration and answer-key behavior can be configured per exam.</p></div><div class="feature"><strong>Independent services</strong><p>PDF/OCR maintenance can be deployed separately from the candidate exam application.</p></div></div></section><section class="section"><h2>What is included in this build</h2><p class="section-intro">This frontend prototype is intentionally functional: the main workflow is clickable end-to-end without a backend.</p><div class="actions">${btn('Open builder','btn primary','builder')} ${btn('Open candidate exam','btn','exam')} ${btn('View architecture','btn','architecture')}</div></section><footer class="footer">ExamFace • Free exam creation concept • No mandatory signup</footer></main>`)}
function builder(){return layout(`<main class="main"><div class="page-title"><div><h1>Create an exam</h1><p>Upload a question paper and move through extraction, review, configuration and publishing.</p></div>${btn('Open demo exam','btn secondary','exam')}</div><div class="steps"><span class="step active">1. Upload</span><span class="step">2. Extract</span><span class="step">3. Review</span><span class="step">4. Configure</span><span class="step">5. Publish</span></div><div class="panel pad"><div class="upload" id="dropzone"><div class="drop-icon">⇧</div><h2>Drop your PDF here</h2><p>or choose a PDF from your device. No account required.</p><input id="pdfInput" type="file" accept="application/pdf,.pdf"><div class="actions" style="justify-content:center">${btn('Choose PDF','btn primary','choose-pdf')} ${btn('Use sample paper','btn','sample')}</div><div id="uploadStatus" class="notice" style="margin-top:18px">Supported production inputs: text PDFs, scanned PDFs, bilingual papers, diagrams, tables and multi-column layouts.</div></div></div></main>`)}
function extraction(){return layout(`<main class="main"><div class="page-title"><div><h1>Analyzing paper</h1><p>${state.sourceName||'Sample paper'} • PDF/OCR pipeline simulation</p></div></div><div class="panel pad"><div class="notice">The browser prototype first attempts text extraction. Production deployment sends difficult files to <b>pdf.examface.com</b>, returning stable normalized Exam JSON.</div><div style="margin:22px 0"><div class="progress"><i id="extractBar"></i></div></div><div id="extractStage" class="feature-grid"><div class="feature"><strong>1. Inspect layout</strong><p>Detect columns, repeated headers, page furniture and question blocks.</p></div><div class="feature"><strong>2. Extract text</strong><p>Preserve reading order and option boundaries.</p></div><div class="feature"><strong>3. OCR fallback</strong><p>Use OCR only for image-only pages or low-confidence regions.</p></div></div></div></main>`)}
function review(){const qs=allQuestions();const q=qs[state.reviewIndex]||qs[0];return layout(`<main class="main"><div class="page-title"><div><h1>Review extraction</h1><p>Check every question before the exam is published. ${qs.length} questions detected in ${state.exam.sections.length} sections.</p></div><div class="actions">${btn('Back to upload','btn','builder')} ${btn('Configure exam','btn primary','config')}</div></div><div class="notice warning" style="margin-bottom:16px">Extraction is editable. Normal questions are not rewritten. Noise such as repeated headers, ads and page numbers should be filtered by the production layout parser.</div><div class="review-grid"><div class="panel question-list">${qs.map((x,i)=>`<div class="q-row ${i===state.reviewIndex?'active':''}" data-review="${i}"><strong>Q${i+1} · ${x.sectionName}</strong><p>${escapeHtml(x.text)}</p></div>`).join('')}</div><div class="panel pad editor"><div class="field"><label>Section</label><select id="editSection">${state.exam.sections.map((s,i)=>`<option value="${i}" ${i===q.si?'selected':''}>${escapeHtml(s.name)}</option>`).join('')}</select></div><div class="field"><label>Question text</label><textarea id="editText">${escapeHtml(q.text)}</textarea></div><div class="field"><label>Options</label><div class="options">${q.options.map((o,i)=>`<div class="option-row"><b>${String.fromCharCode(65+i)}</b><input type="text" data-opt="${i}" value="${escapeAttr(o)}"><span>${i===q.answer?'<span class="answer-tag">Correct answer</span>':btn('Set answer','btn small','set-answer-'+i)}</span></div>`).join('')}</div></div><div class="actions">${btn('Save question','btn primary','save-question')} ${btn('Add question','btn','add-question')} ${btn('Delete question','btn danger','delete-question')}</div></div></div></main>`)}
function config(){return layout(`<main class="main"><div class="page-title"><div><h1>Configure exam</h1><p>Set the candidate experience and scoring rules.</p></div><div>${btn('Back to review','btn','review')}</div></div><div class="config-grid"><div class="config-card"><h3>Exam details</h3><div class="field"><label>Exam title</label><input id="cfgTitle" value="${escapeAttr(state.exam.title)}"></div><div class="two-col"><div class="field"><label>Duration (minutes)</label><input id="cfgDuration" type="number" min="1" value="${state.exam.duration}"></div><div class="field"><label>Positive marks</label><input id="cfgPositive" type="number" step="0.25" value="${state.exam.positive}"></div></div><div class="field"><label>Negative marks per wrong answer</label><input id="cfgNegative" type="number" step="0.05" min="0" value="${state.exam.negative}"></div><label class="switch"><input id="cfgPause" type="checkbox" ${state.exam.pauseAllowed?'checked':''}> Allow pause/resume</label><label class="switch"><input id="cfgAuto" type="checkbox" checked> Auto-submit when time reaches zero</label></div><div class="config-card"><h3>Answer key</h3><div class="notice success">This demo has an embedded answer key. Production can accept a separate PDF, pasted key or manual answers.</div><label class="switch"><input type="radio" name="ak" value="embedded" checked> Use detected/manual answer key</label><label class="switch"><input type="radio" name="ak" value="manual"> Enter key manually</label><div class="field"><label>Answer key preview</label><textarea readonly>${allQuestions().map((q,i)=>`Q${i+1}: ${String.fromCharCode(65+q.answer)}`).join('\n')}</textarea></div></div><div class="config-card"><h3>Dynamic sections</h3><p style="color:var(--muted);font-size:13px">Section count is driven by the imported paper. Rename sections here without hard-coding subjects.</p>${state.exam.sections.map((s,i)=>`<div class="field"><label>Section ${i+1}</label><input data-section-name="${i}" value="${escapeAttr(s.name)}"></div>`).join('')}</div><div class="config-card"><h3>Candidate behavior</h3><label class="switch"><input type="checkbox" checked> Show question palette</label><label class="switch"><input type="checkbox" checked> Show question paper dialog</label><label class="switch"><input type="checkbox" checked> Show instructions dialog</label><label class="switch"><input type="checkbox" checked> Preserve divider position in session</label><div class="notice" style="margin-top:14px">Required controls are locked into the exam UI: Save & Next, Mark for Review & Next, Previous, Clear Response, Submit, Instructions, Question Paper and Pause Test/Resume Test.</div></div></div><div class="actions" style="justify-content:flex-end;margin-top:18px">${btn('Publish exam','btn primary','publish')}</div></main>`)}
function publish(){const id='exam-'+Math.random().toString(36).slice(2,8);return layout(`<main class="main"><div class="panel publish-box"><div class="eyebrow">EXAM READY</div><h1>${escapeHtml(state.exam.title)}</h1><p>${allQuestions().length} questions • ${state.exam.sections.length} sections • ${state.exam.duration} minutes</p><div class="share-url">https://exam.examface.com/${id}</div><div class="actions" style="justify-content:center">${btn('Copy temporary link','btn secondary','copy-link')} ${btn('Open candidate exam','btn primary','exam')} ${btn('Back to builder','btn','builder')}</div><div class="notice success" style="margin-top:20px">Prototype link is illustrative. Production should issue an expiring anonymous exam token and store the normalized Exam JSON server-side.</div></div></main>`)}
function exam(){state.started=true;state.paused=false; if(!state.timeLeft)state.timeLeft=state.exam.duration*60;const q=currentQuestion();state.visited[q.id]=true;persist();return `<div class="exam-app"><header class="exam-header"><div class="exam-title">${escapeHtml(state.exam.title)}</div><div class="exam-meta"><span class="hide-mobile">${escapeHtml(state.exam.sections[state.section].name)}</span><span class="timer" id="timer">${fmtTime(state.timeLeft)}</span><span>${btn(state.exam.pauseAllowed?(state.paused?'Resume Test':'Pause Test'):'', 'btn small', state.exam.pauseAllowed?(state.paused?'resume':'pause'):'')}</span></div></header><div class="exam-sections">${state.exam.sections.map((s,i)=>`<button class="${i===state.section?'active':''}" data-section="${i}">${escapeHtml(s.name)}</button>`).join('')}</div><div class="exam-layout"><div class="exam-workspace" id="workspace"><div class="question-pane" id="leftPane"><div class="pane-title">Question No ${currentFlatIndex()+1} — Directions / Passage</div><div class="pane-content"><div class="direction">Read the question carefully.</div><p>${escapeHtml(q.text)}</p><p>Use the right panel to select one option. Your response is saved when you use the navigation controls.</p></div></div><div class="divider" id="divider" title="Drag to resize. Double-click to reset"></div><div class="question-pane" id="rightPane"><div class="pane-title">Question No ${currentFlatIndex()+1}</div><div class="pane-content"><p>${escapeHtml(q.text)}</p><div class="options">${q.options.map((o,i)=>`<label class="option ${state.answers[q.id]===i?'selected':''}"><input type="radio" name="answer" value="${i}" ${state.answers[q.id]===i?'checked':''}> <span><b>${String.fromCharCode(65+i)})</b> ${escapeHtml(o)}</span></label>`).join('')}</div></div></div></div><aside class="exam-sidebar"><div class="candidate"><div><b>Candidate</b><div style="font-size:11px;color:#60717e">Anonymous session</div></div><div class="avatar">EF</div></div><div class="legend"><b>Legend</b><div class="legend-row"><span class="state-dot"><i class="dot answered">✓</i> Answered</span><span class="state-dot"><i class="dot na">!</i> Not Answered</span><span class="state-dot"><i class="dot marked">★</i> Marked</span></div></div><div style="font-size:12px;margin:10px 0">You are viewing <b>${escapeHtml(state.exam.sections[state.section].name)}</b><br>Question Palette:</div><div class="palette">${allQuestions().map((x,i)=>`<button class="pal ${paletteClass(x,i)}" data-qindex="${i}">${i+1}</button>`).join('')}</div><div class="sidebar-actions">${btn('Question Paper','', 'question-paper')} ${btn('Instructions','', 'instructions')} ${btn('Submit','', 'submit')}</div></aside></div><div class="exam-footer">${btn('Previous','btn small','previous')} ${btn('Mark for Review & Next','btn secondary small','review-next')} ${btn('Clear Response','btn small','clear')}<span class="spacer"></span>${btn('Save & Next','btn primary small','save-next')}</div><div id="dialog" class="dialog-backdrop"></div></div>`}
function paletteClass(q,i){if(i===currentFlatIndex())return 'current '+(state.marked[q.id]?(state.answers[q.id]!==undefined?'am':'marked'):'');if(state.marked[q.id])return state.answers[q.id]!==undefined?'am':'marked';if(state.answers[q.id]!==undefined)return 'answered';if(state.visited[q.id])return 'na';return 'visited'}
function result(){const qs=allQuestions();let correct=0,wrong=0,unanswered=0,score=0;qs.forEach(q=>{const a=state.answers[q.id];if(a===undefined){unanswered++;return}if(a===q.answer){correct++;score+=Number(state.exam.positive)}else{wrong++;score-=Number(state.exam.negative)}});const max=qs.length*Number(state.exam.positive);const pct=max?Math.max(0,score/max*100):0;return layout(`<main class="main"><div class="page-title"><div><h1>Result</h1><p>${escapeHtml(state.exam.title)}</p></div>${btn('Retake exam','btn secondary','exam')}</div><div class="result-hero"><div><div class="eyebrow">COMPLETED</div><div class="score">${score.toFixed(2)} / ${max.toFixed(2)}</div><div style="color:var(--muted)">${pct.toFixed(1)}% based on configured marking</div></div><div style="width:240px"><div class="bar"><i style="width:${pct}%"></i></div><p style="font-size:12px;color:var(--muted)">Correctness and scoring are calculated from the answer key included with the normalized exam.</p></div></div><div class="stats"><div class="stat"><b>${correct}</b><span>Correct</span></div><div class="stat"><b>${wrong}</b><span>Wrong</span></div><div class="stat"><b>${unanswered}</b><span>Unanswered</span></div><div class="stat"><b>${qs.length}</b><span>Total</span></div></div><div class="panel pad"><h2>Question review</h2>${qs.map((q,i)=>{const a=state.answers[q.id];const ok=a===q.answer;return `<div style="padding:12px 0;border-bottom:1px solid #e8edf1"><b>Q${i+1} · ${escapeHtml(q.sectionName)}</b><div style="font-size:13px;margin:4px 0">${escapeHtml(q.text)}</div><div style="font-size:12px;color:${ok?'var(--green)':'var(--red)'}">Your answer: ${a===undefined?'Not answered':String.fromCharCode(65+a)} · Correct: ${String.fromCharCode(65+q.answer)}</div></div>`}).join('')}</div></main>`)}
function architecture(){return layout(`<main class="main"><div class="page-title"><div><h1>Architecture</h1><p>The production system is intentionally separated into independently deployable boundaries.</p></div></div><div class="panel pad"><pre style="white-space:pre-wrap;line-height:1.6;font-family:ui-monospace,monospace;color:#234">examface.com  → creator web app\n        ↓\napi.examface.com → exam/session API\n        ↓\n┌──────────────────────────────┐\n│ pdf.examface.com              │\n│ PDF parser → layout → OCR     │\n│ → noise filter → confidence   │\n│ → normalized Exam JSON        │\n└──────────────┬───────────────┘\n               ↓\n       PostgreSQL / object storage\n               ↓\nexam.examface.com → candidate engine\n               ↓\n        result / scoring service</pre><div class="two-col"><div class="feature"><strong>Stable contract</strong><p>Candidate UI consumes normalized Exam JSON. It does not know PDF internals.</p></div><div class="feature"><strong>Cost control</strong><p>Browser-first parsing where possible; OCR and AI fallback only when required.</p></div><div class="feature"><strong>Security</strong><p>Temporary file storage, MIME validation, size limits, sandboxed processing, rate limits and automatic cleanup.</p></div><div class="feature"><strong>Anonymous sessions</strong><p>No user table is mandatory initially. Share links can carry expiring signed exam/session tokens.</p></div></div><div class="actions" style="margin-top:18px">${btn('Open full blueprint','btn primary','blueprint-info')} ${btn('Back home','btn','home')}</div></div></main>`)}
function instructionsDialog(){openDialog(`<h2>Instructions</h2><ul><li>Select one answer for each question.</li><li>Save & Next saves the current answer and moves to the next question.</li><li>Mark for Review & Next saves an answer if present, marks the question, and moves to the next question.</li><li>Clear Response removes the selected answer while keeping the question visited.</li><li>Previous returns to the previous question.</li><li>The question palette shows current, answered, not answered, marked and not visited states.</li><li>The divider between the two main panels is draggable. Double-click it to reset the split.</li><li>Submit opens a confirmation before the exam is finalized.</li></ul>`)}
function questionPaperDialog(){openDialog(`<h2>Question Paper</h2><p>This is the normalized question set that powers the candidate engine.</p>${allQuestions().map((q,i)=>`<div style="padding:10px 0;border-bottom:1px solid #e6edf1"><b>Q${i+1}. ${escapeHtml(q.text)}</b><div style="font-size:13px;color:#61717e;margin-top:5px">${q.options.map((o,j)=>`${String.fromCharCode(65+j)}) ${escapeHtml(o)}`).join(' • ')}</div></div>`).join('')}`)}
function openDialog(html,actions=''){const d=$('#dialog');if(!d)return;d.innerHTML=`<div class="dialog">${html}<div class="dialog-actions">${actions||btn('Close','btn','close-dialog')}</div></div>`;d.classList.add('open')}
function closeDialog(){const d=$('#dialog');if(d)d.classList.remove('open')}
function submitConfirm(){openDialog('<h2>Submit exam?</h2><p>Your answers will be finalized and scored using the configured answer key.</p>',`${btn('Continue exam','btn','close-dialog')} ${btn('Submit now','btn primary','confirm-submit')}`)}
function navigateFlat(i){const qs=allQuestions();if(i<0||i>=qs.length)return;state.section=qs[i].si;state.qIndex=qs[i].qi;state.visited[qs[i].id]=true;persist();render()}
function startTimer(){clearInterval(window.__timer);window.__timer=setInterval(()=>{if(state.route!=='exam'||state.paused||!state.started)return;state.timeLeft--;if(state.timeLeft<=0){state.timeLeft=0;clearInterval(window.__timer);state.route='result';state.result=true;persist();render();toastMsg('Time is up. Exam submitted automatically.');}else{const el=$('#timer');if(el)el.textContent=fmtTime(state.timeLeft);persist()}},1000)}
function fmtTime(n){n=Math.max(0,n);return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function escapeAttr(s){return escapeHtml(s)}
function render(){if(state.route==='exam'){app.innerHTML=exam();applyDivider();startTimer();return}clearInterval(window.__timer);if(state.route==='home')app.innerHTML=home();if(state.route==='builder')app.innerHTML=builder();if(state.route==='extract')app.innerHTML=extraction();if(state.route==='review')app.innerHTML=review();if(state.route==='config')app.innerHTML=config();if(state.route==='publish')app.innerHTML=publish();if(state.route==='result')app.innerHTML=result();if(state.route==='architecture')app.innerHTML=architecture()}
function applyDivider(){const d=$('#divider'),w=$('#workspace');if(!d||!w)return;const pct=Math.max(25,Math.min(75,state.divider));w.style.gridTemplateColumns=`minmax(280px,${pct}fr) 7px minmax(280px,${100-pct}fr)`;let drag=false,startX=0,startPct=pct;const move=e=>{if(!drag)return;const rect=w.getBoundingClientRect();state.divider=Math.max(25,Math.min(75,startPct+(e.clientX-startX)/rect.width*100));applyDivider();persist()};const up=()=>{drag=false;document.body.style.cursor='';window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up)};d.onpointerdown=e=>{drag=true;startX=e.clientX;startPct=state.divider;document.body.style.cursor='col-resize';window.addEventListener('pointermove',move);window.addEventListener('pointerup',up)};d.ondblclick=()=>{state.divider=50;applyDivider();persist();toastMsg('Panel split reset to 50/50')};}
async function handleFile(file){
  if(!file)return;

  if(file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf')){
    toastMsg('Please select a PDF file.');
    return;
  }

  state.sourceName=file.name;
  state.route='extract';
  state.extractionProgress=10;
  render();

  const bar=$('#extractBar');
  const stage=$('#extractStage');

  try{
    if(stage)stage.innerHTML='<div class="feature"><strong>Uploading PDF</strong><p>Sending the document to the ExamFace PDF extraction engine.</p></div>';
    if(bar)bar.style.width='10%';

    const form=new FormData();
    form.append('file',file);

    if(bar)bar.style.width='25%';

    const response=await fetch('/api/extract',{
      method:'POST',
      body:form
    });

    if(bar)bar.style.width='70%';

    const result=await response.json();

    if(!response.ok){
      throw new Error(result.message||result.detail||result.error||'PDF extraction failed');
    }

    if(!Array.isArray(result.questions)){
      throw new Error('PDF engine returned no questions.');
    }

    const questions=result.questions.map((q,index)=>({
      id:'q'+(index+1),
      number:q.number||index+1,
      text:q.text||'',
      options:(q.options||[]).map((o,i)=>({
        id:o.id||String.fromCharCode(65+i),
        text:o.text||''
      })),
      answer:q.answer??null,
      explanation:q.explanation||'',
      section:q.section||'Imported Questions',
      pages:q.pages||[],
      extractionMethod:q.extractionMethod||'native'
    }));

    state.exam.sections=[{
      id:'imported',
      name:'Imported Questions',
      questions:questions
    }];

    state.extractionProgress=100;

    if(stage){
      stage.innerHTML='<div class="feature"><strong>PDF extraction complete</strong><p>'+
        (result.pageCount||0)+' pages processed.</p></div>'+
        '<div class="feature"><strong>'+questions.length+
        ' questions detected</strong><p>Questions are loaded into the review screen.</p></div>'+
        '<div class="feature"><strong>Confidence: '+
        (result.confidence||'unknown')+'</strong><p>Review the extracted questions before publishing.</p></div>';
    }

    if(bar)bar.style.width='100%';

    setTimeout(()=>{
      state.route='review';
      render();
    },700);

  }catch(error){
    console.error(error);

    if(stage){
      stage.innerHTML='<div class="feature"><strong>PDF extraction failed</strong><p>'+
        error.message+'</p></div>';
    }

    if(bar)bar.style.width='100%';

    toastMsg(error.message||'PDF extraction failed.');
  }
}
function setRoute(r){state.route=r; if(r==='exam'){state.started=true;if(!state.timeLeft)state.timeLeft=state.exam.duration*60}render();window.scrollTo({top:0,behavior:'smooth'})}
function handleAction(a){if(!a)return;if(a==='home')return setRoute('home');if(a==='builder')return setRoute('builder');if(a==='exam')return setRoute('exam');if(a==='architecture')return setRoute('architecture');if(a==='how'){openDialog('<h2>How it works</h2><p>1. Upload a PDF. 2. Extract questions using the isolated PDF/OCR engine. 3. Review and edit. 4. Configure scoring and timing. 5. Publish an anonymous exam link. 6. Candidates take the exam without creating an account.</p>');return}if(a==='choose-pdf')return $('#pdfInput')?.click();if(a==='sample'){state.sourceName='sample-question-paper.pdf';state.exam=clone(sampleExam);state.route='extract';render();setTimeout(()=>{const b=$('#extractBar');let p=0;const t=setInterval(()=>{p+=20;if(b)b.style.width=p+'%';if(p>=100){clearInterval(t);state.route='review';render()}},250)},100);return}if(a==='review')return setRoute('review');if(a==='config'){saveEditor(false);return setRoute('config')}if(a==='publish'){saveConfig();return setRoute('publish')}if(a==='copy-link'){navigator.clipboard?.writeText($('.share-url')?.textContent||'');toastMsg('Temporary link copied');return}if(a==='save-question'){saveEditor(true);return}if(a.startsWith('set-answer-')){const i=Number(a.split('-').pop());const qs=allQuestions();const q=qs[state.reviewIndex];q.answer=i;saveEditor(true);return}if(a==='add-question'){state.exam.sections[state.exam.sections.length-1].questions.push({id:'q'+Date.now(),text:'New question',options:['Option A','Option B','Option C','Option D'],answer:0});state.reviewIndex=allQuestions().length-1;render();return}if(a==='delete-question'){if(allQuestions().length<=1)return;const q=allQuestions()[state.reviewIndex];state.exam.sections[q.si].questions.splice(q.qi,1);state.reviewIndex=Math.max(0,state.reviewIndex-1);render();return}if(a==='pause'){state.paused=true;toastMsg('Test paused');render();return}if(a==='resume'){state.paused=false;toastMsg('Test resumed');render();return}if(a==='save-next'){saveAnswer();navigateFlat(currentFlatIndex()+1);return}if(a==='review-next'){saveAnswer();const q=currentQuestion();state.marked[q.id]=true;persist();navigateFlat(currentFlatIndex()+1);return}if(a==='previous'){navigateFlat(currentFlatIndex()-1);return}if(a==='clear'){delete state.answers[currentQuestion().id];persist();render();return}if(a==='submit')return submitConfirm();if(a==='confirm-submit'){closeDialog();state.route='result';state.result=true;persist();render();return}if(a==='instructions')return instructionsDialog();if(a==='question-paper')return questionPaperDialog();if(a==='close-dialog')return closeDialog();if(a==='blueprint-info'){openDialog('<h2>Blueprint</h2><p>The complete implementation specification is included as <b>EXAMFACE_COMPLETE_BLUEPRINT.md</b> in this project package. It covers domains, PDF/OCR service boundaries, parser stages, normalized Exam JSON, API design, security, testing, accessibility, deployment and the exact candidate state machine.</p>');return}}
function saveAnswer(){const q=currentQuestion();const checked=$('input[name="answer"]:checked');if(checked)state.answers[q.id]=Number(checked.value);state.visited[q.id]=true;persist()}
function saveEditor(showToast){const qs=allQuestions();const q=qs[state.reviewIndex];if(!q)return;const text=$('#editText');if(text)q.text=text.value;$$('[data-opt]').forEach(el=>{q.options[Number(el.dataset.opt)]=el.value});const si=Number($('#editSection')?.value||q.si);if(si!==q.si){state.exam.sections[q.si].questions.splice(q.qi,1);state.exam.sections[si].questions.push(q);q.si=si}persist();if(showToast)toastMsg('Question saved')}
function saveConfig(){state.exam.title=$('#cfgTitle')?.value||state.exam.title;state.exam.duration=Math.max(1,Number($('#cfgDuration')?.value||45));state.exam.positive=Number($('#cfgPositive')?.value||1);state.exam.negative=Number($('#cfgNegative')?.value||0.25);state.exam.pauseAllowed=$('#cfgPause')?.checked??true;$$('[data-section-name]').forEach(el=>state.exam.sections[Number(el.dataset.sectionName)].name=el.value);state.timeLeft=state.exam.duration*60;persist()}
document.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b){e.preventDefault();handleAction(b.dataset.action);return}const q=e.target.closest('[data-qindex]');if(q&&state.route==='exam'){navigateFlat(Number(q.dataset.qindex));return}const s=e.target.closest('[data-section]');if(s&&state.route==='exam'){saveAnswer();state.section=Number(s.dataset.section);state.qIndex=0;render();return}const r=e.target.closest('[data-review]');if(r&&state.route==='review'){state.reviewIndex=Number(r.dataset.review);render();return}});
document.addEventListener('change',e=>{if(e.target.id==='pdfInput')handleFile(e.target.files[0]);if(e.target.name==='answer'&&state.route==='exam'){state.answers[currentQuestion().id]=Number(e.target.value);state.visited[currentQuestion().id]=true;persist();render()}});
document.addEventListener('dragover',e=>{const z=$('#dropzone');if(z){e.preventDefault();z.classList.add('drag')}});document.addEventListener('dragleave',e=>{$('#dropzone')?.classList.remove('drag')});document.addEventListener('drop',e=>{const z=$('#dropzone');if(z){e.preventDefault();z.classList.remove('drag');handleFile(e.dataTransfer.files[0])}});
loadPersist();if(!state.exam||!state.exam.sections)state.exam=clone(sampleExam);render();
