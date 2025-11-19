const API = "/api";
const tokenKey = "taskapp_token";

function gs(id){return document.getElementById(id);}
function authHeaders(){
    const t = localStorage.getItem(tokenKey);
    return t ? {"Authorization":"Bearer "+t} : {};
}

async function loadTasks(){
    const taskList = gs("taskList");
    taskList.innerHTML = "<p>Loading...</p>";

    const params = new URLSearchParams();

    const s = gs("searchInput").value.trim();
    if(s) params.set("search", s);

    const p = gs("priorityFilter").value;
    if(p) params.set("priority", p);

    const c = gs("statusFilter").value;
    if(c) params.set("completed", c);

    const sort = gs("sortFilter").value;
    if(sort) params.set("sortBy", sort);

    const res = await fetch("/api/tasks?" + params.toString(), {
        headers: authHeaders()
    });

    if(res.status === 401){
        alert("Please login first.");
        return window.location = "/";
    }

    const tasks = await res.json();
    renderTasks(tasks);
}

function renderTasks(tasks){
    const list = gs("taskList");
    if(tasks.length === 0){
        list.innerHTML = "<p>No tasks found</p>";
        return;
    }

    list.innerHTML = "";
    tasks.forEach(t => {
        const div = document.createElement("div");
        div.className = "task-card" + (t.completed ? " completed" : "");

        div.innerHTML = `
      <div>
        <h3>${t.title}</h3>
        <p>${t.description || ""}</p>
        <small>Priority: ${t.priority} • Due: ${t.due_date || "—"}</small>
      </div>

      <div class="actions">
        <button class="done">${t.completed ? "Undo" : "Done"}</button>
        <button class="edit">Edit</button>
        <button class="delete">Delete</button>
      </div>
    `;

        const btnDone = div.querySelector(".done");
        btnDone.onclick = async () => {
            await fetch(`/api/tasks/${t.id}`, {
                method:"PUT",
                headers:{ "Content-Type":"application/json", ...authHeaders() },
                body:JSON.stringify({ completed: !t.completed })
            });
            loadTasks();
        };

        const btnDelete = div.querySelector(".delete");
        btnDelete.onclick = async () => {
            if(!confirm("Delete?")) return;
            await fetch(`/api/tasks/${t.id}`, {
                method:"DELETE",
                headers: authHeaders()
            });
            loadTasks();
        };

        list.appendChild(div);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    gs("reloadBtn").onclick = loadTasks;
    gs("searchInput").oninput = loadTasks;
    gs("priorityFilter").onchange = loadTasks;
    gs("statusFilter").onchange = loadTasks;
    gs("sortFilter").onchange = loadTasks;

    loadTasks();
});
