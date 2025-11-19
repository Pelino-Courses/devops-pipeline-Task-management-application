const API = '/api';
const tokenKey = 'taskapp_token';
let currentUser = null;

function el(q){return document.querySelector(q);}
function x(id){return document.getElementById(id);}
function authHeaders(){
    const t = localStorage.getItem(tokenKey);
    return t ? { 'Authorization':'Bearer ' + t } : {};
}

/* UPDATE UI BASED ON LOGIN */
function updateUI(){
    const token = localStorage.getItem(tokenKey);

    if(token){
        el("#auth-panel").style.display = "none";
        el("#quick-add").style.display = "block";

        el("#nav-right").innerHTML = `
      <span>Logged in</span>
      <button id="btnLogout">Logout</button>
    `;

        x("btnLogout").onclick = () => {
            localStorage.removeItem(tokenKey);
            location.reload();
        };

    } else {
        el("#auth-panel").style.display = "block";
        el("#quick-add").style.display = "none";
        el("#nav-right").innerHTML = `<span>Guest</span>`;
    }
}

/* REGISTER */
x("btnRegister").onclick = async () => {
    const username = x("reg_username").value.trim();
    const display_name = x("reg_display").value.trim();
    const password = x("reg_password").value;

    if(!username || !password) return alert("Missing fields");

    const res = await fetch(API + "/auth/register", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ username, password, display_name })
    });

    const data = await res.json();
    if(!res.ok) return alert(data.error);

    localStorage.setItem(tokenKey, data.token);
    updateUI();
};

/* LOGIN */
x("btnLogin").onclick = async () => {
    const username = x("login_username").value.trim();
    const password = x("login_password").value;

    const res = await fetch(API + "/auth/login", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ username, password })
    });

    const data = await res.json();
    if(!res.ok) return alert(data.error);

    localStorage.setItem(tokenKey, data.token);
    updateUI();
};

/* CREATE TASK */
x("create").onclick = async () => {
    const title = x("title").value.trim();
    const description = x("description").value.trim();
    const priority = x("priority").value;
    const due_date = x("due_date").value || null;

    if(!title) return alert("Title required");

    const res = await fetch(API + "/tasks", {
        method:"POST",
        headers:Object.assign({"Content-Type":"application/json"}, authHeaders()),
        body:JSON.stringify({ title, description, priority, due_date })
    });

    if(!res.ok){
        const err = await res.json();
        return alert(err.error);
    }

    alert("Task Added! Go to Dashboard to view.");
};

/* INIT */
document.addEventListener("DOMContentLoaded", updateUI);
