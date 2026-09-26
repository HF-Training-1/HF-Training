// ==========================================
// HF TRAINING — VRQ LEVEL 2 E-PORTFOLIO
// MASTER: shane@hairforce-1.co.uk
// PASS:   Hairforce1.
// UNITS: 202, 203, 204, 210, 211
// ==========================================

const MASTER = {
    id: 'hf-master-001',
    name: 'Shane',
    email: 'shane@hairforce-1.co.uk',
    password: 'Hairforce1.',
    role: 'admin'
};

// ==========================================
// 5 OFFICIAL VRQ LEVEL 2 UNITS — City & Guilds
// ==========================================
const VRQ_UNITS = [
    {
        id: 'vrq-202',
        ref: 'Unit 202',
        title: 'Shampoo, Condition & Treat the Hair and Scalp',
        aim: 'Develop skills to shampoo, condition and treat hair and scalp safely and effectively.',
        criteria: [
            'Prepare self, client and work area safely',
            'Consult with client to confirm service requirements',
            'Select suitable products, tools and equipment',
            'Shampoo hair using correct massage techniques',
            'Apply conditioners and treatments appropriately',
            'Provide aftercare advice and recommendations'
        ]
    },
    {
        id: 'vrq-203',
        ref: 'Unit 203',
        title: 'Client Consultation for Hair Services',
        aim: 'Develop consultation skills to agree services and manage client expectations.',
        criteria: [
            'Establish client requirements and expectations',
            'Assess hair characteristics, skin type and suitability',
            'Agree realistic service outcomes and timescales',
            'Explain potential risks and limitations',
            'Record client information accurately',
            'Provide clear aftercare advice'
        ]
    },
    {
        id: 'vrq-204',
        ref: 'Unit 204',
        title: 'Cut Men’s Hair Using Basic Techniques',
        aim: 'Create a range of men’s hairstyles using basic cutting methods.',
        criteria: [
            'Prepare hair and client for cutting service',
            'Follow design plan and guide lines accurately',
            'Use scissor-over-comb and club cutting techniques',
            'Create uniform lengths and graduated shapes',
            'Check balance, shape and finish throughout',
            'Provide styling and maintenance advice'
        ]
    },
    {
        id: 'vrq-210',
        ref: 'Unit 210',
        title: 'Style and Finish Men’s Hair',
        aim: 'Style, dress and finish men’s hair to achieve desired looks.',
        criteria: [
            'Select appropriate styling products and tools',
            'Apply products correctly for hair type and desired result',
            'Use blow-drying and finishing techniques',
            'Create volume, direction and shape',
            'Check finish against agreed style',
            'Provide home-care advice'
        ]
    },
    {
        id: 'vrq-211',
        ref: 'Unit 211',
        title: 'Cut Facial Hair to Shape',
        aim: 'Shape and trim facial hair to enhance client features.',
        criteria: [
            'Consult client on desired facial hair shape',
            'Assess facial features and hair growth patterns',
            'Select tools and equipment appropriate to the task',
            'Define outline and shape accurately',
            'Remove bulk and create balance',
            'Finish and advise on maintenance'
        ]
    }
];

// ==========================================
// SYSTEM
// ==========================================
let currentUser = null;
let viewingAs = null;
let allUsers = [];
let activeUnitId = null;

// Storage
function saveUsers() { localStorage.setItem('hfUsers', JSON.stringify({ users: allUsers })); }
function loadUsers() {
    const d = localStorage.getItem('hfUsers');
    allUsers = d ? JSON.parse(d).users : [];
    ensureMaster();
}
function ensureMaster() {
    if (!allUsers.some(u => u.email === MASTER.email)) {
        allUsers.unshift({ ...MASTER });
        saveUsers();
    }
}
function getUserData(id) { return JSON.parse(localStorage.getItem(`user_${id}`) || '{}'); }
function setUserData(id, data) { localStorage.setItem(`user_${id}`, JSON.stringify(data)); }
function activeUser() { return viewingAs || currentUser; }
function activeData() { return getUserData(activeUser().id); }
function findUser(email) {
    return allUsers.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
}

// Progress Calculation
function getProgress(uid) {
    const d = getUserData(uid);
    const done = VRQ_UNITS.filter(u => (d.units || {})[u.id]?.status === 'assessed').length;
    const sub = VRQ_UNITS.filter(u => (d.units || {})[u.id]?.status === 'submitted').length;
    return { done, sub, total: VRQ_UNITS.length, pct: Math.round(((done + sub * 0.5) / VRQ_UNITS.length) * 100) };
}

// Login
function login() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const pass = document.getElementById('password').value;
    const err = document.getElementById('loginError');
    err.classList.add('hidden');

    if (email === MASTER.email && pass === MASTER.password) {
        currentUser = { ...MASTER };
        localStorage.setItem('activeSession', MASTER.id);
        showApp();
        return;
    }

    const user = findUser(email);
    if (!user) return showErr('❌ Account not found');
    if (user.password !== pass) return showErr('❌ Incorrect password');
    
    currentUser = user;
    localStorage.setItem('activeSession', user.id);
    showApp();
}
function showErr(msg) {
    const el = document.getElementById('loginError');
    el.textContent = msg;
    el.classList.remove('hidden');
}
function logout() {
    currentUser = null; viewingAs = null;
    localStorage.removeItem('activeSession');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}
function resetMasterLogin() {
    if (!confirm('⚠️ Reset ALL data?')) return;
    localStorage.clear();
    allUsers = [{ ...MASTER }];
    saveUsers();
    alert('✅ Restored!\nEmail: shane@hairforce-1.co.uk\nPass: Hairforce1.');
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    document.getElementById('assessorLink').classList.toggle('hidden', !['admin','assessor','tutor'].includes(currentUser.role));
    document.getElementById('iqaLink').classList.toggle('hidden', !['admin','iqa'].includes(currentUser.role));
    document.getElementById('adminLink').classList.toggle('hidden', currentUser.role !== 'admin');

    setupNav();
    renderDashboard();
    renderUnitsList();
    if (currentUser.role === 'admin') renderUserTable();
}

function setupNav() {
    document.querySelectorAll('[data-page]').forEach(link => {
        link.onclick = e => {
            e.preventDefault();
            const page = link.dataset.page;
            document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
            document.querySelectorAll('[data-page]').forEach(l => l.classList.remove('active'));
            document.getElementById(`page-${page}`).classList.remove('hidden');
            link.classList.add('active');
            
            if (page === 'assessor') renderAssessorList();
            if (page === 'iqa') renderIQAList();
        };
    });
}

function exitView() {
    viewingAs = null;
    renderDashboard();
    renderUnitsList();
    closeUnitModal();
}

// DASHBOARD
function renderDashboard() {
    const u = activeUser();
    const d = activeData();
    const prog = getProgress(u.id);

    document.getElementById('userName').textContent = u.name;
    document.getElementById('roleBadge').textContent = u.role.toUpperCase();
    document.getElementById('roleBadge').className = `role-badge role-${u.role}`;

    if (viewingAs) {
        document.getElementById('viewingBadge').classList.remove('hidden');
        document.getElementById('viewingName').textContent = u.name;
    } else {
        document.getElementById('viewingBadge').classList.add('hidden');
    }

    document.getElementById('totalProgress').style.width = prog.pct + '%';
    document.getElementById('totalProgress').textContent = prog.pct + '%';
    document.getElementById('progressText').textContent = `${prog.done} of ${prog.total} units completed`;
    document.getElementById('statDone').textContent = prog.done;
    document.getElementById('statSub').textContent = prog.sub;
    document.getElementById('statIqa').textContent = Object.values(d.units || {}).filter(x => x.iqaSigned).length;

    document.getElementById('unitSummary').innerHTML = VRQ_UNITS.map(unit => {
        const status = (d.units || {})[unit.id]?.status || 'draft';
        return `
        <div class="unit-card ${status === 'submitted' ? 'submitted' : ''} ${status === 'assessed' ? 'completed' : ''}"
             onclick="openUnit('${unit.id}')">
            <div class="unit-header">
                <strong>${unit.ref}: ${unit.title}</strong>
                <span class="unit-status status-${status}">
                    ${status === 'draft' ? '📝 Draft' : ''}
                    ${status === 'submitted' ? '⏳ Submitted' : ''}
                    ${status === 'assessed' ? '✅ Completed' : ''}
                </span>
            </div>
        </div>`;
    }).join('');
}

// UNITS LIST
function renderUnitsList() {
    const d = activeData();
    document.getElementById('unitsContainer').innerHTML = VRQ_UNITS.map(unit => {
        const status = (d.units || {})[unit.id]?.status || 'draft';
        return `
        <div class="unit-card ${status === 'submitted' ? 'submitted' : ''} ${status === 'assessed' ? 'completed' : ''}"
             onclick="openUnit('${unit.id}')">
            <div class="unit-header">
                <div>
                    <strong>${unit.ref}: ${unit.title}</strong><br>
                    <small style="opacity:0.7">${unit.aim.substring(0,60)}...</small>
                </div>
                <span class="unit-status status-${status}">
                    ${status === 'draft' ? '📝 Draft' : ''}
                    ${status === 'submitted' ? '⏳ Submitted' : ''}
                    ${status === 'assessed' ? '✅ Completed' : ''}
                </span>
            </div>
        </div>`;
    }).join('');
}

// OPEN UNIT — FULL FORM: Consultation → Reflection → Upload → Assessor → IQA
function openUnit(uid) {
    activeUnitId = uid;
    const unit = VRQ_UNITS.find(u => u.id === uid);
    const d = activeData();
    const unitData = (d.units || {})[uid] || {};
    const isViewing = !!viewingAs;

    document.getElementById('modalUnitTitle').textContent = `${unit.ref}: ${unit.title}`;
    document.getElementById('modalUnitRef').textContent = unit.aim;

    document.getElementById('modalUnitContent').innerHTML = `
        <!-- CONSULTATION SHEET -->
        <div class="form-section">
            <h4>📋 Consultation & Service Details</h4>
            <label>Client Name / Service Date:</label>
            <input type="text" id="con_client" ${isViewing ? 'readonly' : ''} 
                   value="${unitData.client || ''}" placeholder="Name — Date">
            
            <label>Service Objectives — What was agreed with the client?</label>
            <textarea id="con_objectives" ${isViewing ? 'readonly' : ''}
                      >${unitData.objectives || ''}</textarea>
            
            <label>Hair & Skin Analysis — Type, condition, factors noted:</label>
            <textarea id="con_analysis" ${isViewing ? 'readonly' : ''}
                      >${unitData.analysis || ''}</textarea>
            
            <label>Products, Tools & Techniques Used:</label>
            <textarea id="con_tools" ${isViewing ? 'readonly' : ''}
                      >${unitData.tools || ''}</textarea>
        </div>

        <!-- STUDENT SELF-REFLECTION -->
        <div class="form-section">
            <h4>✍️ Student Feedback & Reflection</h4>
            <label>What went well during this service?</label>
            <textarea id="self_good" ${isViewing ? 'readonly' : ''}
                      >${unitData.selfGood || ''}</textarea>
            
            <label>What would you do differently next time?</label>
            <textarea id="self_improve" ${isViewing ? 'readonly' : ''}
                      >${unitData.selfImprove || ''}</textarea>
            
            <label>Aftercare advice given to client:</label>
            <textarea id="self_aftercare" ${isViewing ? 'readonly' : ''}
                      >${unitData.selfAftercare || ''}</textarea>
        </div>

        <!-- EVIDENCE UPLOAD -->
        <div class="form-section">
            <h4>📎 Upload Evidence (Photos / Worksheets)</h4>
            ${!isViewing ? `
            <div class="upload-area" onclick="document.getElementById('file_${uid}').click()">
                📁 Click to upload files<br><small>Photos of work, completed sheets, witness statements</small>
            </div>
            <input type="file" id="file_${uid}" style="display:none" onchange="handleUpload('${uid}', this.files[0])">
            ` : ''}
            <div class="file-list" id="files_${uid}">
                ${(unitData.files || []).map(f => `<div class="file-item">✅ ${f.name}</div>`).join('')}
            </div>
        </div>

        <!-- ASSESSMENT CRITERIA CHECKLIST -->
        <div class="form-section">
            <h4>✅ Assessment Criteria Checklist</h4>
            <p style="opacity:0.7;margin-bottom:1rem;">Tick each item when completed / observed</p>
            ${unit.criteria.map((c, i) => `
            <label style="display:flex;align-items:flex-start;gap:0.5rem;margin:0.5rem 0;">
                <input type="checkbox" id="crit_${uid}_${i}" ${unitData.critDone?.includes(i) ? 'checked' : ''} 
                       ${isViewing ? 'disabled' : ''} style="margin:0;">
                <span>${c}</span>
            </label>`).join('')}
        </div>

        ${!isViewing ? `
        <!-- STUDENT ACTIONS -->
        <div style="display:flex;gap:0.8rem;flex-wrap:wrap;margin-top:1rem;">
            <button class="btn-primary btn-small" onclick="saveUnit('${uid}')">💾 Save Progress</button>
            <button class="btn-warning btn-small" onclick="submitUnit('${uid}')"
                    ${unitData.status === 'submitted' ? 'disabled' : ''}>
                ${unitData.status === 'submitted' ? '⏳ Submitted' : '➡️ Submit to Assessor'}
            </button>
        </div>
        ` : ''}

        <!-- ASSESSOR FEEDBACK -->
        ${isViewing && ['admin','assessor','tutor'].includes(currentUser.role) ? `
        <div class="form-section" style="border-color:var(--success);margin-top:2rem;">
            <h4>🔍 Assessor Feedback & Decision</h4>
            <label>Outcome:</label>
            <select id="ass_decision">
                <option value="pass" ${unitData.status === 'assessed' ? 'selected' : ''}>✅ Pass — All Criteria Met</option>
                <option value="refer" ${unitData.status === 'submitted' && unitData.assessorDecision === 'refer' ? 'selected' : ''}>↩️ Refer — More Evidence Needed</option>
            </select>
            <label>Assessor Comments / Feedback:</label>
            <textarea id="ass_feedback">${unitData.assessorFeedback || ''}</textarea>
            <label>Assessor Name & Date:</label>
            <input type="text" id="ass_sign" value="${unitData.assessorSignedBy || ''}" placeholder="Name — Date">
            <button class="btn-success btn-small" onclick="assessUnit('${activeUser().id}', '${uid}')">✓ Record Assessment</button>
        </div>
        ` : ''}

        ${unitData.assessorFeedback ? `
        <div class="feedback-box ${unitData.status === 'assessed' ? 'assessor-approved' : ''}">
            <strong>Assessor Feedback:</strong><br>
            ${unitData.assessorFeedback}<br>
            <small>— ${unitData.assessorSignedBy || 'Assessor'} · ${unitData.assessorDate || ''}</small>
        </div>
        ` : ''}

        <!-- IQA VERIFICATION -->
        ${isViewing && ['admin','iqa'].includes(currentUser.role) ? `
        <div class="form-section iqa" style="border-color:var(--light-blue);margin-top:1rem;">
            <h4>✅ IQA Verification</h4>
            <label>Sampling Outcome:</label>
            <select id="iqa_decision">
                <option value="verified" ${unitData.iqaSigned ? 'selected' : ''}>✅ Verified — Standards Met</option>
                <option value="escalate">⚠️ Further Review Required</option>
            </select>
            <label>IQA Comments / Sampling Notes:</label>
            <textarea id="iqa_note">${unitData.iqaNote || ''}</textarea>
            <label>IQA Verifier Name & Date:</label>
            <input type="text" id="iqa_sign" value="${unitData.iqaSignedBy || ''}" placeholder="Name — Date">
            <button class="btn-small" style="background:var(--light-blue);color:white" 
                    onclick="iqaVerify('${activeUser().id}', '${uid}')">✓ Record IQA Check</button>
        </div>
        ` : ''}

        ${unitData.iqaSigned ? `
        <div class="feedback-box iqa">
            <strong>IQA Verified:</strong><br>
            ${unitData.iqaNote || 'Sampled and verified'}<br>
            <small>— ${unitData.iqaSignedBy} · ${unitData.iqaDate}</small>
        </div>
        ` : ''}
    `;

    document.getElementById('unitModal').classList.remove('hidden');
}

function closeUnitModal() {
    document.getElementById('unitModal').classList.add('hidden');
    activeUnitId = null;
}

// SAVE UNIT
function saveUnit(uid) {
    const d = activeData();
    if (!d.units) d.units = {};
    if (!d.units[uid]) d.units[uid] = { status: 'draft', files: [], critDone: [] };

    d.units[uid].client = document.getElementById('con_client')?.value || '';
    d.units[uid].objectives = document.getElementById('con_objectives')?.value || '';
    d.units[uid].analysis = document.getElementById('con_analysis')?.value || '';
    d.units[uid].tools = document.getElementById('con_tools')?.value || '';
    d.units[uid].selfGood = document.getElementById('self_good')?.value || '';
    d.units[uid].selfImprove = document.getElementById('self_improve')?.value || '';
    d.units[uid].selfAftercare = document.getElementById('self_aftercare')?.value || '';

    // Save checklist ticks
    const unit = VRQ_UNITS.find(u => u.id === uid);
    d.units[uid].critDone = [];
    unit.criteria.forEach((_, i) => {
        if (document.getElementById(`crit_${uid}_${i}`)?.checked) d.units[uid].critDone.push(i);
    });

    setUserData(activeUser().id, d);
    alert('✅ Saved!');
    renderDashboard();
    renderUnitsList();
}

// SUBMIT FOR ASSESSMENT
function submitUnit(uid) {
    if (!confirm('Submit this unit to your Assessor? You can still add more evidence after submission.')) return;
    const d = activeData();
    if (!d.units) d.units = {};
    if (!d.units[uid]) d.units[uid] = { files: [], critDone: [] };
    d.units[uid].status = 'submitted';
    d.units[uid].submittedAt = new Date().toISOString();
    setUserData(activeUser().id, d);
    alert('✅ Submitted to Assessor!');
    closeUnitModal();
    renderDashboard();
    renderUnitsList();
}

// FILE UPLOAD
function handleUpload(uid, file) {
    if (!file) return;
    const d = activeData();
    if (!d.units) d.units = {};
    if (!d.units[uid]) d.units[uid] = { files: [], critDone: [] };
    if (!d.units[uid].files) d.units[uid].files = [];
    d.units[uid].files.push({ name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() });
    setUserData(activeUser().id, d);
    openUnit(uid);
}

// ASSESSOR MARKS
function assessUnit(sid, uid) {
    const decision = document.getElementById('ass_decision').value;
    const feedback = document.getElementById('ass_feedback').value.trim();
    const signed = document.getElementById('ass_sign').value.trim() || `${currentUser.name} — ${new Date().toLocaleDateString()}`;
    
    if (!feedback) return alert('⚠️ Please add feedback before recording');

    const d = getUserData(sid);
    if (!d.units) d.units = {};
    if (!d.units[uid]) d.units[uid] = { files: [], critDone: [] };
    
    d.units[uid].assessorDecision = decision;
    d.units[uid].assessorFeedback = feedback;
    d.units[uid].assessorSignedBy = signed;
    d.units[uid].assessorDate = new Date().toLocaleDateString();
    d.units[uid].status = decision === 'pass' ? 'assessed' : 'submitted';
    
    setUserData(sid, d);
    alert('✅ Assessment recorded!');
    openUnit(uid);
    renderDashboard();
}

// IQA VERIFICATION
function iqaVerify(sid, uid) {
    const note = document.getElementById('iqa_note').value.trim() || 'Sampled and verified';
    const signed = document.getElementById('iqa_sign').value.trim() || `${currentUser.name} — ${new Date().toLocaleDateString()}`;
    
    const d = getUserData(sid);
    if (!d.units) d.units = {};
    if (!d.units[uid]) d.units[uid] = { files: [], critDone: [] };
    
    d.units[uid].iqaSigned = true;
    d.units[uid].iqaNote = note;
    d.units[uid].iqaSignedBy = signed;
    d.units[uid].iqaDate = new Date().toLocaleDateString();
    
    setUserData(sid, d);
    alert('✅ IQA check recorded!');
    openUnit(uid);
    renderDashboard();
}

// ASSESSOR & IQA LISTS
function renderAssessorList(filter = '') {
    document.getElementById('assStudentList').innerHTML = allUsers
        .filter(u => u.role === 'student' && u.name.toLowerCase().includes(filter.toLowerCase()))
        .map(u => {
            const p = getProgress(u.id);
            return `
            <div class="student-row" onclick="viewStudent('${u.id}')">
                <div>
                    <strong>${u.name}</strong><br>
                    <small>${p.done}/${p.total} units — ${p.pct}%</small>
                </div>
                <span class="unit-status status-assessed">${p.pct}%</span>
            </div>`;
        }).join('') || '<p style="opacity:0.7;">No students found</p>';
}
function renderAssessorList() { renderAssessorList(document.getElementById('assSearch')?.value || ''); }

function renderIQAList(filter = '') {
    document.getElementById('iqaStudentList').innerHTML = allUsers
        .filter(u => u.role === 'student' && u.name.toLowerCase().includes(filter.toLowerCase()))
        .map(u => {
            const p = getProgress(u.id);
            return `
            <div class="student-row" onclick="viewStudent('${u.id}')">
                <div>
                    <strong>${u.name}</strong><br>
                    <small>${p.done}/${p.total} units completed</small>
                </div>
            </div>`;
        }).join('') || '<p style="opacity:0.7;">No students found</p>';
}
function renderIQAList() { renderIQAList(document.getElementById('iqaSearch')?.value || ''); }

function viewStudent(id) {
    viewingAs = allUsers.find(u => u.id === id);
    if (!viewingAs) return;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-dashboard').classList.remove('hidden');
    document.querySelector('[data-page="dashboard"]').classList.add('active');
    renderDashboard();
    renderUnitsList();
}

// ADMIN — MANAGE USERS
function createUser() {
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim().toLowerCase();
    const pass = document.getElementById('newPass').value;
    const role = document.getElementById('newRole').value;
    
    if (!name || !email || !pass) return alert('⚠️ Fill all fields');
    if (findUser(email)) return alert('❌ Email already exists');
    
    allUsers.push({
        id: 'user-' + Date.now(),
        name, email, password: pass, role
    });
    saveUsers();
    
    document.getElementById('newName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newPass').value = '';
    
    renderUserTable();
    alert('✅ Created: ' + name);
}

function renderUserTable() {
    document.getElementById('userTableBody').innerHTML = allUsers.map(u => {
        const p = getProgress(u.id);
        return `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td><span class="role-badge role-${u.role}">${u.role}</span></td>
            <td>${p.pct}%</td>
            <td>
                <button class="btn-small" onclick="viewStudent('${u.id}')">View</button>
                ${u.id !== MASTER.id ? `<button class="btn-small btn-danger" onclick="delUser('${u.id}')">Remove</button>` : ''}
            </td>
        </tr>`;
    }).join('');
}

function delUser(id) {
    if (!confirm('Remove this user?')) return;
    allUsers = allUsers.filter(u => u.id !== id);
    saveUsers();
    renderUserTable();
}

// INIT
loadUsers();
const ses = localStorage.getItem('activeSession');
if (ses) {
    const u = allUsers.find(x => x.id === ses);
    if (u) { currentUser = u; showApp(); }
}