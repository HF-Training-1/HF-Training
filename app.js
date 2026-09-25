// ==========================================
// HF TRAINING — FRESH START v6.0
// MASTER ADMIN: shane@hairforce-1.co.uk
// PASSWORD:     Hairforce1.
// ==========================================

// 🔒 MASTER ADMIN — PERMANENT
const MASTER = {
    id: 'hf-master-001',
    name: 'Shane',
    email: 'shane@hairforce-1.co.uk',
    password: 'Hairforce1.',
    role: 'admin',
    course: null,
    shop: 'hq'
};

// ==========================================
// COURSES & UNITS — EDIT/ADD HERE LATER
// ==========================================
const COURSES = {
    vrq: {
        name: "VRQ Level 2 Diploma in Barbering",
        shortName: "VRQ L2",
        requiredHours: 0,
        units: [
            {
                id: "vrq-u1",
                title: "Health & Safety in the Salon",
                questions: [
                    "Identify THREE potential hazards in a barbershop and explain how to reduce risks.",
                    "What is the correct procedure for dealing with a fire emergency in the salon?",
                    "Explain the purpose of COSHH regulations and how to store hazardous products safely.",
                    "Describe how to maintain personal hygiene and professional appearance in the workplace."
                ]
            },
            {
                id: "vrq-u2",
                title: "Client Consultation & Advice",
                questions: [
                    "What are the key stages of an effective client consultation?",
                    "How do you assess hair type, face shape, and suitability for a proposed style?",
                    "Why is aftercare advice important? Give THREE examples of what you would cover.",
                    "How would you handle a client who is unhappy with their service?"
                ]
            }
            // ✅ ADD MORE UNITS HERE — copy the block above
        ]
    },
    nvq: {
        name: "NVQ Level 2 Diploma in Barbering",
        shortName: "NVQ L2",
        requiredHours: 372,
        units: [
            {
                id: "nvq-u1",
                title: "Health & Safety Legislation",
                questions: [
                    "Explain your legal responsibilities for health and safety in the workplace.",
                    "How do you carry out a risk assessment in the salon?",
                    "What records should be kept for health and safety compliance?",
                    "How do you report and record accidents or incidents?"
                ]
            }
            // ✅ ADD MORE NVQ UNITS HERE
        ]
    },
    vtct: {
        name: "VTCT Level 2 Diploma in Barbering",
        shortName: "VTCT L2",
        requiredHours: 372,
        units: [
            {
                id: "vtct-u1",
                title: "Working in the Hair Industry",
                questions: [
                    "Describe the different career pathways available in barbering.",
                    "What qualities and professional behaviours are expected of a barber?",
                    "How do you keep up to date with industry trends and new techniques?",
                    "Explain the importance of continuous professional development."
                ]
            }
            // ✅ ADD MORE VTCT UNITS HERE
        ]
    }
    // ✅ ADD WHOLE NEW COURSES HERE
};

// SHOPS / BRANCHES — ADD MORE HERE
const SHOPS = {
    hq: "HF Training — Main Academy",
    shop1: "Partner Shop — Central London",
    shop2: "Partner Shop — Essex",
    shop3: "Partner Shop — Kent",
    other: "Other Branch"
};

// ==========================================
// SYSTEM — DON'T EDIT BELOW UNLESS ADDING FEATURES
// ==========================================
let currentUser = null;
let viewingAs = null;
let allUsers = [];
let pendingAttFile = null;

// Data Storage
function saveAllUsers() { localStorage.setItem('hfUsers', JSON.stringify({ users: allUsers })); }
function loadAllUsers() {
    const d = localStorage.getItem('hfUsers');
    allUsers = d ? JSON.parse(d).users : [];
    ensureMaster();
}
function ensureMaster() {
    if (!allUsers.some(u => u.email === MASTER.email)) {
        allUsers.unshift({ ...MASTER });
        saveAllUsers();
    }
}
function getUserData(id) {
    return JSON.parse(localStorage.getItem(`user_${id}`) || '{}');
}
function setUserData(id, data) {
    localStorage.setItem(`user_${id}`, JSON.stringify(data));
}
function activeUser() { return viewingAs || currentUser; }
function activeData() { return getUserData(activeUser().id); }
function findUser(email) {
    return allUsers.find(u => u.email.toLowerCase().trim() === email.toLowerCase().trim());
}

// Reset Master Login
function resetMasterLogin() {
    if (!confirm('⚠️ This resets ALL user data? Only proceed if needed!')) return;
    localStorage.clear();
    allUsers = [{ ...MASTER }];
    saveAllUsers();
    alert('✅ Master Restored!\nEmail: shane@hairforce-1.co.uk\nPass: Hairforce1.');
}

// Login System
function login() {
    const email = document.getElementById('email').value.trim().toLowerCase();
    const pass = document.getElementById('password').value;
    const err = document.getElementById('loginError');
    err.classList.add('hidden');

    // Direct Master Check
    if (email === MASTER.email && pass === MASTER.password) {
        currentUser = { ...MASTER };
        localStorage.setItem('activeSession', MASTER.id);
        showApp();
        return;
    }

    // Other Users
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
    currentUser = null; viewingAs = null; pendingAttFile = null;
    localStorage.removeItem('activeSession');
    document.getElementById('loginScreen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
}

function showApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Show/Hide Navigation by Role
    document.getElementById('assessorLink').classList.toggle('hidden', !['admin','assessor','tutor'].includes(currentUser.role));
    document.getElementById('iqaLink').classList.toggle('hidden', !['admin','iqa'].includes(currentUser.role));
    document.getElementById('tutorLink').classList.toggle('hidden', !['admin','tutor','assessor','iqa'].includes(currentUser.role));
    document.getElementById('adminLink').classList.toggle('hidden', currentUser.role !== 'admin');

    setupNav();
    renderDashboard();
    renderPortfolio();
    renderAttendance();
    if (currentUser.role === 'admin') renderAdminTable();
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
            if (page === 'tutor') renderTutorList();
        };
    });
}

function exitStudentView() {
    viewingAs = null; pendingAttFile = null;
    renderDashboard();
    renderPortfolio();
    renderAttendance();
}

// DASHBOARD
function renderDashboard() {
    const u = activeUser();
    const d = activeData();

    document.getElementById('userName').textContent = u.name;
    document.getElementById('userRoleBadge').textContent = u.role.toUpperCase();
    document.getElementById('userRoleBadge').className = `role-badge role-${u.role}`;

    if (viewingAs) {
        document.getElementById('viewingAsBadge').classList.remove('hidden');
        document.getElementById('viewingName').textContent = u.name;
    } else {
        document.getElementById('viewingAsBadge').classList.add('hidden');
    }

    if (!u.course) {
        document.getElementById('courseName').textContent = 'Full System Access';
        document.getElementById('overallProgress').style.width = '100%';
        document.getElementById('overallProgress').textContent = 'ADMIN';
        document.getElementById('unitsDone').textContent = '—';
        document.getElementById('hoursLogged').textContent = '—';
        document.getElementById('pendingCount').textContent = '—';
        return;
    }

    const c = COURSES[u.course];
    const done = d.completedUnits || [];
    const subs = Object.values(d.submissions || {}).filter(s => s.status === 'submitted');
    const pct = Math.round((done.length / c.units.length) * 100);
    const hrs = (d.hours || []).reduce((sum, h) => sum + parseFloat(h.hours || 0), 0);

    document.getElementById('courseName').textContent = c.name;
    document.getElementById('overallProgress').style.width = pct + '%';
    document.getElementById('overallProgress').textContent = pct + '%';
    document.getElementById('unitsDone').textContent = `${done.length}/${c.units.length}`;
    document.getElementById('hoursLogged').textContent = `${hrs.toFixed(1)}/${c.requiredHours}`;
    document.getElementById('pendingCount').textContent = subs.length;
}

// PORTFOLIO — UNITS, Q&A, UPLOADS, ASSESSMENT
function renderPortfolio() {
    const u = activeUser();
    if (!u.course) {
        document.getElementById('currentCourseName').textContent = 'Select a student from Assessor/Tutor panel';
        document.getElementById('unitsList').innerHTML = '';
        return;
    }

    const c = COURSES[u.course];
    const d = activeData();
    const done = d.completedUnits || [];
    const answers = d.answers || {};
    const files = d.uploads || {};
    const subs = d.submissions || {};

    document.getElementById('currentCourseName').textContent = c.name;
    const list = document.getElementById('unitsList');
    list.innerHTML = '';

    c.units.forEach((unit, idx) => {
        const isDone = done.includes(unit.id);
        const sub = subs[unit.id] || {};
        const status = sub.status || 'draft';

        list.innerHTML += `
        <div class="unit-block ${status === 'submitted' ? 'submitted' : ''} ${status === 'assessed' ? 'assessed' : ''}">
            <h4>
                Unit ${idx + 1}: ${unit.title}
                <span>
                    <span class="status-${status}">
                        ${status === 'draft' ? '📝 Draft' : ''}
                        ${status === 'submitted' ? '⏳ Pending Assessment' : ''}
                        ${status === 'assessed' ? '✅ Assessed' : ''}
                    </span>
                    ${isDone ? ' ✅ Completed' : ''}
                </span>
            </h4>

            ${unit.questions.map((q, qi) => `
            <div class="question-block">
                <label>${qi + 1}. ${q}</label>
                <textarea id="q-${unit.id}-${qi}" ${viewingAs ? 'readonly' : ''}
                    placeholder="Type your answer here...">${(answers[unit.id] || {})[`q${qi}`] || ''}</textarea>
            </div>
            `).join('')}

            <div class="question-block">
                <label>📎 Upload Evidence / Paperwork</label>
                ${!viewingAs ? `
                <div class="upload-area" onclick="document.getElementById('up-${unit.id}').click()">
                    Click to upload files<br><small>Photos, scanned papers, PDF documents</small>
                </div>
                <input type="file" id="up-${unit.id}" style="display:none" 
                    onchange="handleUnitUpload('${unit.id}', this.files[0])">
                ` : ''}
                <div class="file-list">
                    ${(files[unit.id] || []).map(f => `<div class="file-item">✅ ${f.name}</div>`).join('')}
                </div>
            </div>

            ${sub.feedback ? `
            <div class="feedback-box ${status === 'assessed' ? 'approved' : ''}">
                <strong>Assessor Feedback:</strong><br>${sub.feedback}
                ${sub.iqaNote ? `<div class="feedback-box iqa" style="margin-top:0.5rem"><strong>IQA Note:</strong><br>${sub.iqaNote}</div>` : ''}
            </div>` : ''}

            ${!viewingAs ? `
            <button class="btn-primary btn-small" onclick="saveUnit('${unit.id}')">Save</button>
            <button class="btn-warning btn-small" onclick="submitUnit('${unit.id}')"
                ${status === 'submitted' ? 'disabled' : ''}>
                ${status === 'submitted' ? 'Submitted' : 'Submit to Assessor'}
            </button>
            ` : ''}

            ${viewingAs && ['admin','assessor','tutor'].includes(currentUser.role) ? `
            <button class="btn-success btn-small" onclick="markUnit('${u.id}', '${unit.id}', 'pass')">✅ Pass</button>
            <button class="btn-warning btn-small" onclick="markUnit('${u.id}', '${unit.id}', 'refer')">↩️ Refer</button>
            ${currentUser.role === 'iqa' || currentUser.role === 'admin' ? `
            <button class="btn-small" style="background:var(--light-blue);color:white" onclick="addIQANote('${u.id}', '${unit.id}')">📝 Add IQA Note</button>
            ` : ''}
            ` : ''}
        </div>`;
    });
}

function handleUnitUpload(uid, file) {
    if (!file) return;
    const d = activeData();
    if (!d.uploads) d.uploads = {};
    if (!d.uploads[uid]) d.uploads[uid] = [];
    d.uploads[uid].push({ name: file.name, size: file.size, type: file.type, uploadedAt: new Date().toISOString() });
    setUserData(activeUser().id, d);
    renderPortfolio();
    alert('✅ Uploaded: ' + file.name);
}

function saveUnit(uid) {
    const d = activeData();
    if (!d.answers) d.answers = {};
    if (!d.answers[uid]) d.answers[uid] = {};

    const c = COURSES[activeUser().course];
    c.units.find(u => u.id === uid).questions.forEach((_, i) => {
        const el = document.getElementById(`q-${uid}-${i}`);
        if (el) d.answers[uid][`q${i}`] = el.value;
    });

    setUserData(activeUser().id, d);
    alert('✅ Saved!');
}

function submitUnit(uid) {
    if (!confirm('Submit this unit? You will not be able to edit it after submission.')) return;
    const d = activeData();
    if (!d.submissions) d.submissions = {};
    d.submissions[uid] = { status: 'submitted', submittedAt: new Date().toISOString() };
    setUserData(activeUser().id, d);
    renderPortfolio();
    renderDashboard();
}

function markUnit(studentId, unitId, result) {
    const fb = prompt(result === 'pass' ? 'Enter feedback for the student:' : 'Tell them what needs improving:');
    if (!fb) return;

    const d = getUserData(studentId);
    if (!d.submissions) d.submissions = {};
    d.submissions[unitId] = {
        status: result === 'pass' ? 'assessed' : 'draft',
        feedback: fb,
        assessedBy: currentUser.email,
        assessedAt: new Date().toISOString()
    };

    if (result === 'pass') {
        if (!d.completedUnits) d.completedUnits = [];
        if (!d.completedUnits.includes(unitId)) d.completedUnits.push(unitId);
    }

    setUserData(studentId, d);
    alert('✅ Assessment recorded!');
    if (viewingAs) { renderPortfolio(); renderDashboard(); }
}

function addIQANote(studentId, unitId) {
    const note = prompt('Enter IQA note:');
    if (!note) return;
    const d = getUserData(studentId);
    if (!d.submissions) d.submissions = {};
    if (!d.submissions[unitId]) d.submissions[unitId] = {};
    d.submissions[unitId].iqaNote = note;
    setUserData(studentId, d);
    alert('✅ IQA note added!');
    if (viewingAs) renderPortfolio();
}

// ATTENDANCE & HOURS WITH FILE UPLOAD
function storeAttFile(file) {
    pendingAttFile = file ? { name: file.name, size: file.size, type: file.type } : null;
    document.getElementById('attFileList').innerHTML = pendingAttFile
        ? `<div class="file-item">✅ ${file.name}</div>` : '';
}

function renderAttendance() {
    const u = activeUser();
    const d = activeData();
    const c = u.course ? COURSES[u.course] : null;
    const hrs = d.hours || [];
    const total = hrs.reduce((sum, h) => sum + parseFloat(h.hours || 0), 0);

    document.getElementById('attendanceForm').style.display = viewingAs ? 'none' : 'block';
    pendingAttFile = null;
    document.getElementById('attFileList').innerHTML = '';

    if (!c) {
        document.getElementById('otjProgress').style.width = '0%';
        document.getElementById('otjText').textContent = 'Select a course first';
    } else {
        const pct = c.requiredHours ? Math.round((total / c.requiredHours) * 100) : 0;
        document.getElementById('otjProgress').style.width = Math.min(pct, 100) + '%';
        document.getElementById('otjProgress').textContent = pct + '%';
        document.getElementById('otjText').textContent = `${total.toFixed(1)} of ${c.requiredHours} hours required`;
    }

    document.getElementById('hoursList').innerHTML = hrs.length
        ? hrs.slice().reverse().map(h => `
            <div style="padding:0.75rem 0; border-bottom:1px solid rgba(255,255,255,0.1);">
                <strong>${h.date || 'No date'}</strong> — ${h.hours} hrs<br>
                <small>${h.note || 'No details'}</small>
                ${h.file ? `<br><small>📎 ${h.file.name}</small>` : ''}
            </div>`).join('')
        : '<p style="opacity:0.7;">No entries yet. Log your first hours above.</p>';
}

function saveHoursEntry() {
    const date = document.getElementById('logDate').value;
    const hours = document.getElementById('logHours').value;
    const note = document.getElementById('logNote').value;

    if (!date || !hours) return alert('⚠️ Fill in date and hours');

    const d = activeData();
    if (!d.hours) d.hours = [];
    d.hours.push({
        date,
        hours,
        note,
        file: pendingAttFile
    });
    setUserData(activeUser().id, d);

    document.getElementById('logDate').value = '';
    document.getElementById('logHours').value = '';
    document.getElementById('logNote').value = '';
    pendingAttFile = null;

    renderAttendance();
    alert('✅ Saved!');
}

// ADMIN — Create Users, Manage Shops & Courses
function toggleCourseDropdown() {
    const isStudent = document.getElementById('newRole').value === 'student';
    document.getElementById('courseLabel').classList.toggle('hidden', !isStudent);
    document.getElementById('newCourse').classList.toggle('hidden', !isStudent);
}

function createNewUser() {
    const name = document.getElementById('newName').value.trim();
    const email = document.getElementById('newEmail').value.trim().toLowerCase();
    const pass = document.getElementById('newPass').value;
    const role = document.getElementById('newRole').value;
    const course = document.getElementById('newCourse').value || null;
    const shop = document.getElementById('newShop').value;

    if (!name || !email || !pass) return alert('⚠️ Fill in all required fields');
    if (findUser(email)) return alert('❌ Email already exists');
    if (role === 'student' && !course) return alert('⚠️ Select a course for this student');

    allUsers.push({
        id: 'user-' + Date.now(),
        name,
        email,
        password: pass,
        role,
        course,
        shop
    });
    saveAllUsers();

    // Clear form
    document.getElementById('newName').value = '';
    document.getElementById('newEmail').value = '';
    document.getElementById('newPass').value = '';

    renderAdminTable();
    alert('✅ Account created for ' + name);
}

function renderAdminTable(search = '') {
    const q = search.toLowerCase();
    document.getElementById('usersTableBody').innerHTML = allUsers
        .filter(u => u.name.toLowerCase().includes(q) || (SHOPS[u.shop] || '').toLowerCase().includes(q))
        .map(u => `
            <tr>
                <td>${u.name}</td>
                <td>${u.email}</td>
                <td><span class="role-badge role-${u.role}">${u.role}</span></td>
                <td>${u.course ? COURSES[u.course]?.shortName || u.course : '—'}</td>
                <td>${SHOPS[u.shop] || u.shop}</td>
                <td>
                    <button class="btn-small" onclick="openStudent('${u.id}')">View</button>
                    ${u.id !== MASTER.id ? `<button class="btn-small btn-danger" onclick="removeUser('${u.id}')">Remove</button>` : ''}
                </td>
            </tr>`).join('');
}
function renderAdminTable() { renderAdminTable(document.getElementById('adminSearch')?.value || ''); }

function openStudent(id) {
    viewingAs = allUsers.find(u => u.id === id);
    if (!viewingAs) return;
    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    document.getElementById('page-dashboard').classList.remove('hidden');
    document.querySelector('[data-page="dashboard"]').classList.add('active');
    renderDashboard();
    renderPortfolio();
    renderAttendance();
}

function removeUser(id) {
    if (!confirm('Remove this user? This cannot be undone.')) return;
    allUsers = allUsers.filter(u => u.id !== id);
    saveAllUsers();
    renderAdminTable();
}

// ASSESSOR LIST
function renderAssessorList(filter = '') {
    const students = allUsers.filter(u => u.role === 'student');
    document.getElementById('assessorStudentList').innerHTML = students
        .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
        .map(u => `
            <div class="student-row" onclick="openStudent('${u.id}')">
                <div>
                    <strong>${u.name}</strong><br>
                    <small>${COURSES[u.course]?.name || u.course} — ${SHOPS[u.shop] || 'Unassigned'}</small>
                </div>
                <span class="role-badge role-student">Student</span>
            </div>`).join('') || '<p style="opacity:0.7;">No students found</p>';
}
function filterAssessorList() { renderAssessorList(document.getElementById('assessorSearch').value); }

// IQA LIST
function renderIQAList() {
    const courseFilter = document.getElementById('iqaCourseFilter').value;
    let students = allUsers.filter(u => u.role === 'student');
    if (courseFilter !== 'all') students = students.filter(u => u.course === courseFilter);

    document.getElementById('iqaStudentList').innerHTML = students
        .map(u => `
            <div class="student-row" onclick="openStudent('${u.id}')">
                <div>
                    <strong>${u.name}</strong><br>
                    <small>${COURSES[u.course]?.name || u.course} — ${SHOPS[u.shop] || 'Unassigned'}</small>
                </div>
            </div>`).join('') || '<p style="opacity:0.7;">No students found</p>';
}

// TUTOR LIST
function renderTutorList(filter = '') {
    const students = allUsers.filter(u => u.role === 'student');
    document.getElementById('tutorStudentList').innerHTML = students
        .filter(u => u.name.toLowerCase().includes(filter.toLowerCase()))
        .map(u => `
            <div class="student-row" onclick="openStudent('${u.id}')">
                <div>
                    <strong>${u.name}</strong><br>
                    <small>${COURSES[u.course]?.name || u.course}</small>
                </div>
            </div>`).join('') || '<p style="opacity:0.7;">No students found</p>';
}
function filterTutorList() { renderTutorList(document.getElementById('tutorSearch').value); }

// INITIALISE
loadAllUsers();
const savedSession = localStorage.getItem('activeSession');
if (savedSession) {
    const u = allUsers.find(x => x.id === savedSession);
    if (u) { currentUser = u; showApp(); }
}