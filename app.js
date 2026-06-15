// Default Data (Fallback if LocalStorage is empty)
const defaultMembers = [
    { id: "JSK-001", name: "Almir Macedo Costa", belt: "10º Dan", dob: "1960-05-15", rgcpf: "123.456.789-00", anuidade: "Sim", seminarios: "Seminário Nacional 2025; Seminário Internacional Coreia 2023", estado: "SP", email: "almir@jsk.com.br", telefone: "(11) 99999-0001" },
    { id: "JSK-002", name: "Maria Silva", belt: "3º Gub", dob: "1990-08-10", rgcpf: "987.654.321-00", anuidade: "Sim", seminarios: "Seminário Regional SP 2025", estado: "SP", email: "maria.silva@email.com", telefone: "(11) 98888-0002" },
    { id: "JSK-003", name: "João Santos", belt: "1º Dan", dob: "1985-12-22", rgcpf: "456.789.123-00", anuidade: "Não", seminarios: "Seminário de Instrutores 2024", estado: "RJ", email: "joao.santos@email.com", telefone: "(21) 97777-0003" }
];

// State Management
let members = [];

function init() {
    const stored = localStorage.getItem('jsk_members');
    if (stored) {
        members = JSON.parse(stored);
    } else {
        members = [...defaultMembers];
        saveToStorage();
    }
    updateDashboard();
    renderMembers();
    setupRouting();
}

function saveToStorage() {
    localStorage.setItem('jsk_members', JSON.stringify(members));
    updateDashboard();
}

// Dashboard Metrics
function updateDashboard() {
    document.getElementById('total-members').textContent = members.length;
    const activeCount = members.filter(m => m.anuidade === 'Sim').length;
    document.getElementById('active-members').textContent = activeCount;
}

// Routing
function setupRouting() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
            document.getElementById(btn.dataset.target).classList.add('active');
        });
    });
}

// Member CRUD
function renderMembers() {
    const tbody = document.getElementById('members-tbody');
    tbody.innerHTML = '';
    
    const search = document.getElementById('search-input').value.toLowerCase();
    const beltFilter = document.getElementById('belt-filter').value;

    const filtered = members.filter(m => {
        const matchesSearch = m.name.toLowerCase().includes(search) || m.id.toLowerCase().includes(search);
        const matchesBelt = beltFilter === '' || m.belt === beltFilter;
        return matchesSearch && matchesBelt;
    });

    filtered.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.id}</td>
            <td>${m.name}</td>
            <td><span class="belt-badge">${m.belt}</span></td>
            <td style="color: ${m.anuidade === 'Sim' ? 'var(--brazil-green)' : 'var(--korea-red)'}; font-weight: 600;">${m.anuidade}</td>
            <td>${m.estado}</td>
            <td>
                <button class="btn btn-secondary" onclick="editMember('${m.id}')">Editar</button>
                <button class="btn btn-secondary" onclick="deleteMember('${m.id}')" style="color: var(--korea-red); border-color: var(--korea-red);">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openMemberModal(member = null) {
    const modal = document.getElementById('member-modal');
    const title = document.getElementById('modal-title');
    
    if (member) {
        title.textContent = 'Editar Membro';
        document.getElementById('member-id').value = member.id;
        document.getElementById('member-name').value = member.name;
        document.getElementById('member-belt').value = member.belt;
        document.getElementById('member-dob').value = member.dob;
        document.getElementById('member-rgcpf').value = member.rgcpf;
        document.getElementById('member-anuidade').value = member.anuidade;
        document.getElementById('member-seminarios').value = member.seminarios;
        document.getElementById('member-estado').value = member.estado;
        document.getElementById('member-email').value = member.email;
    } else {
        title.textContent = 'Adicionar Membro';
        document.getElementById('member-form').reset();
        document.getElementById('member-id').value = '';
    }
    
    modal.classList.remove('hidden');
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.add('hidden');
}

function saveMember(e) {
    e.preventDefault();
    const id = document.getElementById('member-id').value;
    const newMember = {
        id: id || 'JSK-' + String(members.length + 1).padStart(3, '0'),
        name: document.getElementById('member-name').value,
        belt: document.getElementById('member-belt').value,
        dob: document.getElementById('member-dob').value,
        rgcpf: document.getElementById('member-rgcpf').value,
        anuidade: document.getElementById('member-anuidade').value,
        seminarios: document.getElementById('member-seminarios').value,
        estado: document.getElementById('member-estado').value,
        email: document.getElementById('member-email').value,
        telefone: ''
    };

    if (id) {
        const index = members.findIndex(m => m.id === id);
        members[index] = { ...members[index], ...newMember };
        showToast('Membro atualizado com sucesso!');
    } else {
        members.push(newMember);
        showToast('Membro adicionado com sucesso!');
    }

    saveToStorage();
    renderMembers();
    closeMemberModal();
}

function editMember(id) {
    const member = members.find(m => m.id === id);
    if (member) openMemberModal(member);
}

function deleteMember(id) {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
        members = members.filter(m => m.id !== id);
        saveToStorage();
        renderMembers();
        showToast('Membro excluído.');
    }
}

// CSV Export
function exportCSV() {
    const headers = ['ID', 'Nome', 'Faixa', 'Data_Nascimento', 'RG_CPF', 'Anuidade_Em_Dia', 'Historico_Seminarios', 'Estado', 'Email', 'Telefone'];
    const rows = members.map(m => [
        m.id, m.name, m.belt, m.dob, m.rgcpf, m.anuidade, `"${m.seminarios}"`, m.estado, m.email, m.telefone
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Base_Dados_JSK.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV exportado com sucesso!');
}

// CSV Import
function importCSV(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const headers = lines[0].split(',');
        
        const newMembers = [];
        for (let i = 1; i < lines.length; i++) {
            // Simple CSV parser (handles basic quoted fields)
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
            const cleanRow = row.map(cell => cell.replace(/^"|"$/g, '').trim());
            
            if (cleanRow.length >= 8) {
                newMembers.push({
                    id: cleanRow[0],
                    name: cleanRow[1],
                    belt: cleanRow[2],
                    dob: cleanRow[3],
                    rgcpf: cleanRow[4],
                    anuidade: cleanRow[5],
                    seminarios: cleanRow[6],
                    estado: cleanRow[7],
                    email: cleanRow[8] || '',
                    telefone: cleanRow[9] || ''
                });
            }
        }
        
        members = newMembers;
        saveToStorage();
        renderMembers();
        showToast(`${newMembers.length} membros importados com sucesso!`);
        input.value = ''; // Reset input
    };
    reader.readAsText(file);
}

// Certificate Verifier
function verifyCertificate() {
    const id = document.getElementById('cert-search').value.trim();
    const member = members.find(m => m.id.toLowerCase() === id.toLowerCase());
    const display = document.getElementById('certificate-display');

    if (member) {
        document.getElementById('cert-id').textContent = member.id;
        document.getElementById('cert-name').textContent = member.name;
        document.getElementById('cert-belt').textContent = member.belt;
        
        const statusEl = document.getElementById('cert-status');
        if (member.anuidade === 'Sim') {
            statusEl.textContent = 'VÁLIDO - Anuidade em Dia';
            statusEl.className = 'status-valid';
        } else {
            statusEl.textContent = 'PENDENTE - Anuidade em Atraso';
            statusEl.style.color = 'var(--korea-red)';
        }
        
        display.classList.remove('hidden');
    } else {
        showToast('Membro não encontrado. Verifique o ID.');
        display.classList.add('hidden');
    }
}

// Toast Notification
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Initialize App
document.addEventListener('DOMContentLoaded', init);
