
const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

let allIssues = [];

// FETCH ALL ISSUES

async function fetchIssues() {
    const spinner = document.getElementById("loadingSpinner");
    spinner.classList.remove("hidden");

    try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        allIssues = data.data || data;
    } catch (err) {
        console.error("Failed to fetch issues:", err);
        alert("Failed to load issues from API!");
    } finally {
        spinner.classList.add("hidden");
    }
    return allIssues;
}

// GENERATE LABELS

function renderLabels(labels) {
    if (!labels || labels.length === 0) return "No Labels";

    return labels.map(label => {
        const upperLabel = label.toUpperCase();
        let colorClass = "bg-gray-200 text-gray-700";

        if (label.toLowerCase().includes("bug")) colorClass = "bg-red-100 text-red-600 font-bold";
        if (label.toLowerCase().includes("help")) colorClass = "bg-orange-100 font-bold text-orange-600";
        if (label.toLowerCase().includes("enhancement")) colorClass = "bg-blue-100 font-bold text-blue-600";
        if (label.toLowerCase().includes("good first issue")) colorClass = "font-bold bg-green-100 text-green-700";

        return `<span class="px-2 py-1 rounded text-sm mr-1 ${colorClass}">${upperLabel}</span>`;
    }).join("");
}

// GENERATE ISSUE CARD

function getIssueCard(issue) {
    let priorityBg = "bg-green-200 text-green-700";
    if (issue.priority?.toLowerCase() === "high") priorityBg = "bg-red-500 text-white";
    else if (issue.priority?.toLowerCase() === "medium") priorityBg = "bg-yellow-500 text-white";

    let statusImg = "";

    if (issue.status.toLowerCase() === "open") {
        statusImg = "assets/Open-Status.png";
    } else {
        statusImg = "assets/Closed-Status.png";
    }


    const borderColor = issue.status?.toLowerCase() === "open" ? "border-t-4 border-green-500" : "border-t-4 border-purple-500";

    return `
        <div class="bg-white w-full p-6 rounded-xl shadow-md cursor-pointer ${borderColor}">
            <!-- Top -->
            <div class="flex justify-between items-center mb-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                     <img src="${statusImg}" alt="status">
                </div>
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${priorityBg}">
                    ${issue.priority?.toUpperCase()}
                </span>
            </div>

            <!-- Title -->
            <h2 class="text-lg font-bold mb-2 text-blue-600 cursor-pointer" onclick="showIssueModal(${issue.id})">
                ${issue.title}
            </h2>

            <!-- Description -->
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">
                ${issue.description ? (issue.description.length > 80 ? issue.description.slice(0, 80) + "..." : issue.description) : ""}
            </p>

            <!-- Labels -->
            <div class="flex flex-wrap gap-2 mb-4">
                ${renderLabels(issue.labels)}
            </div>

            <!-- Footer -->
            <div class="text-gray-400 text-xs pt-3 border-t border-slate-100">
                #${issue.id} by ${issue.author || "Unknown"} <br>
                ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}
            </div>
        </div>
    `;
}

// RENDER ISSUE CARDS INTO CONTAINER

function renderIssues(issues, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    issues.forEach(issue => {
        const card = document.createElement("div");
        card.innerHTML = getIssueCard(issue);
        container.appendChild(card);
    });
}

// GENERATE MODAL CONTENT
function getIssueModal(issue) {

    let priorityBg = "bg-green-200 text-green-700";

    if (issue.priority?.toLowerCase() === "high") {
        priorityBg = "bg-red-500 text-white";
    }

    if (issue.priority?.toLowerCase() === "medium") {
        priorityBg = "bg-yellow-500 text-white";
    }

    return `

 <h2 class="text-2xl font-bold mb-2">
${issue.title}
</h2>

<div class="flex items-center gap-3 text-sm mb-4">

<span class="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
${issue.status?.toUpperCase()}
</span>

<span class="text-gray-500">
Opened by 
<span class="font-medium text-gray-700">
${issue.author || "Unknown"}
</span>
• ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}
</span>

</div>

<div class="flex gap-2 mb-4 flex-wrap">
${renderLabels(issue.labels)}
</div>


<p class="text-gray-600 mb-6">
${issue.description || ""}
</p>

<div class="flex justify-between items-center mb-6">

<div>
<p class="text-gray-400 text-sm">Assignee:</p>
<p class="font-semibold text-gray-700">
${issue.assignee || "Unassigned"}
</p>
</div>

<div class="text-right">
<p class="text-gray-400 text-sm">Priority:</p>
<span class="px-3 py-1 rounded-full text-sm font-semibold ${priorityBg}">
${issue.priority?.toUpperCase()}
</span>
</div>

</div>

<div class="flex justify-end">
<button onclick="closeCart()" class="bg-[#4A00FF]  text-white px-5 py-2 hover:bg-blue-400 hover:text-black rounded-lg">
Close
</button>
</div>
`;
}
// SHOW MODAL
async function showIssueModal(id) {
    try {
        const res = await fetch(`${API_BASE.slice(0, -1)}/${id}`); // /issue/:id
        const data = await res.json();
        const issue = data.data;

        document.getElementById("popover-card").innerHTML = getIssueModal(issue);
        document.getElementById("issueCart").classList.remove("hidden");
    } catch (err) {
        console.error(err);
        alert("Can't Load Issue!");
    }
}

// CLOSE MODAL
function closeCart() {
    const modal = document.getElementById('issueCart');
    if (modal) modal.classList.add('hidden');
}

// LOAD ISSUES BASED ON TAB
async function loadIssues(status = "all") {
    if (!allIssues.length) await fetchIssues();

    const containers = ["allContainer", "openContainer", "closedContainer"];
    containers.forEach(id => document.getElementById(id)?.classList.add("hidden"));

    let filtered = allIssues;
    let containerId = "allContainer";

    if (status === "open") {
        filtered = allIssues.filter(i => i.status?.toLowerCase() === "open");
        containerId = "openContainer";
    } else if (status === "closed") {
        filtered = allIssues.filter(i => i.status?.toLowerCase() === "closed");
        containerId = "closedContainer";
    }

    renderIssues(filtered, containerId);
    updateCount(filtered);
    document.getElementById(containerId)?.classList.remove("hidden");
}

// TAB BUTTON HANDLER
function loadTab(buttonId) {
    document.querySelectorAll(".allBtn").forEach(btn => {
        btn.classList.remove("bg-[#4A00FF]", "text-white");
        btn.classList.add("bg-white", "text-black",);
    });

    const clicked = document.getElementById(buttonId);
    if (clicked) {
        clicked.classList.add("bg-[#4A00FF]", "text-white");
        clicked.classList.remove("bg-white", "text-black");
        loadIssues(clicked.getAttribute("data-tab"));
    }
}

// UPDATE ISSUE COUNT
function updateCount(issues) {
    const el = document.getElementById("issueCount");
    if (el) el.innerText = `${issues.length} Issues`;
}

// SEARCH FUNCTIONALITY
document.getElementById("searchBtn")?.addEventListener("click", async () => {
    const input = document.getElementById("searchInput");
    if (!input) return;

    const query = input.value.trim().toLowerCase();
    if (!allIssues.length) await fetchIssues();

    const filtered = allIssues.filter(issue =>
        (issue.title && issue.title.toLowerCase().includes(query)) ||
        (issue.description && issue.description.toLowerCase().includes(query))
    );

    ["allContainer", "openContainer", "closedContainer"].forEach(id => {
        document.getElementById(id)?.classList.add("hidden");
    });

    renderIssues(filtered, "allContainer");
    updateCount(filtered);
    document.getElementById("allContainer")?.classList.remove("hidden");
});

// INIT
window.onload = () => loadTab("allBtn");
