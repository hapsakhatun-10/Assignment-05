const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

let allIssues = [];

// Fetch all issues from API
async function fetchIssues() {
    document.getElementById("loadingSpinner").classList.remove("hidden");
    try {
        const res = await fetch(API_BASE);
        const data = await res.json();
        allIssues = data.data || data;
    } catch (error) {
        console.error("Failed to fetch issues:", error);
    } finally {
        document.getElementById("loadingSpinner").classList.add("hidden");
    }
    return allIssues;
}



// Render issues into container
function renderIssues(issues, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    issues.forEach(issue => {
        const card = document.createElement("div");

        // Top border color based on status
        const borderColor = issue.status?.toLowerCase() === "open" ? "border-t-4 border-green-500" : "border-t-4 border-purple-500";

        // Priority badge color
        let priorityBg = "bg-green-200 text-green-700";
        if (issue.priority?.toLowerCase() === "high") {
            priorityBg = "bg-pink-200 text-pink-700";
        } else if (issue.priority?.toLowerCase() === "medium") {
            priorityBg = "bg-yellow-200 text-yellow-700";
        }

        // Labels badges (Dynamic)
        let labelsHtml = "";
        const issueLabels = issue.labels || issue.label;

        if (issueLabels) {

            if (Array.isArray(issueLabels)) {
                labelsHtml = issueLabels.join(", ");
            } else {
                labelsHtml = issueLabels;
            }
        }


        card.className = `bg-white w-[360px] p-6 rounded-xl shadow-md cursor-pointer ${borderColor}`;
        card.onclick = () => showIssueModal(issue.id);

        card.innerHTML = `
            <!-- top section -->
            <div class="flex justify-between items-center mb-3">
                <div class="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center shrink-0">
                    <span class="text-green-700 text-sm">⟳</span>
                </div>
                <span class="text-xs font-semibold px-3 py-1 rounded-full ${priorityBg}">
                    ${issue.priority?.toUpperCase()}
                </span>
            </div>

            <!-- title -->
           <h2 class="text-lg font-bold mb-2 text-blue-600" onclick="showIssueModal(${issue.id})">
    ${issue.title}
</h2>

            <!-- description -->
            <p class="text-gray-500 text-sm mb-4 line-clamp-2">
                ${issue.description ? (issue.description.length > 80 ? issue.description.slice(0, 80) + "..." : issue.description) : ""}
            </p>

            <!-- tags -->
           <div class="flex flex-wrap gap-2 mb-4">
        ${renderLabels(issue.labels)}
    </div>
            

            <!-- footer -->
            <div class="text-gray-400 text-xs pt-3 border-t border-slate-100">
                #${issue.id} by ${issue.author || "Unknown"} <br>
                ${issue.createdAt ? new Date(issue.createdAt).toLocaleDateString() : ""}
            </div>
        `;
        container.appendChild(card);
    });
}

// Update count
function updateCount(issues) {
    const el = document.getElementById("issueCount");
    if (el) el.innerText = `${issues.length} Issues`;
}

// Load issues by status
async function loadIssues(status = "all") {
    if (!allIssues.length) await fetchIssues();

    ["allContainer", "openContainer", "closedContainer"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add("hidden");
    });

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

    const target = document.getElementById(containerId);
    if (target) target.classList.remove("hidden");
}

// Handle tab button click
function loadTab(buttonId) {
    document.querySelectorAll(".allBtn").forEach(btn => {
        btn.classList.remove("bg-[#4A00FF]", "text-white");
        btn.classList.add("bg-white", "text-black");
    });

    const clicked = document.getElementById(buttonId);
    if (clicked) {
        clicked.classList.add("bg-[#4A00FF]", "text-white");
        clicked.classList.remove("bg-white", "text-black");
        const status = clicked.getAttribute("data-tab");
        loadIssues(status);
    }
}
function renderLabels(labels) {
    if (!labels || labels.length === 0) return "No Labels";

    return labels.map(label => {
        const upperLabel = label.toUpperCase();
        let colorClass = "bg-gray-200 text-gray-700"; // 

        if (label.toLowerCase().includes("bug")) colorClass = "bg-red-100 text-red-600";
        if (label.toLowerCase().includes("help")) colorClass = "bg-orange-100 text-orange-600";
        if (label.toLowerCase().includes("enhancement")) colorClass = "bg-blue-100 text-blue-600";
        if (label.toLowerCase().includes("good first issue")) colorClass = "bg-green-100 text-green-700";

        return `<span class="px-2 py-1 rounded text-sm mr-1 ${colorClass}">${upperLabel}</span>`;
    }).join("");
}


async function showIssueModal(id) {
    try {
        const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
        const data = await res.json();
        const issue = data.data;

        // Fill modal with info
        document.getElementById('cartTitle').innerText = issue.title;
        document.getElementById('cartDescription').innerText = issue.description;
        document.getElementById('cartStatus').innerText = `Status: ${issue.status}`;
        document.getElementById('cartCategory').innerText = `Category: ${issue.category}`;
        document.getElementById('cartAuthor').innerText = `Author: ${issue.author}`;
        document.getElementById('cartPriority').innerText = `Priority: ${issue.priority}`;
        document.getElementById('cartCreated').innerText = `Created At: ${issue.createdAt}`;

        // ✅ Dynamic labels
        document.getElementById('cartLabel').innerHTML = renderLabels(issue.labels);

        // Show modal/cart
        document.getElementById('issueCart').classList.remove('hidden');
    } catch (err) {
        console.error(err);
        alert("Cant Load Data");
    }
}

// Close modal/cart
function closeCart() {
    document.getElementById('issueCart').classList.add('hidden');
}

// Close modal
function closeCart() {
    const modal = document.getElementById('issueCart');
    if (modal) modal.classList.add('hidden');
}

// Search functionality
const searchBtn = document.getElementById("searchBtn");
if (searchBtn) {
    searchBtn.addEventListener("click", async () => {
        const input = document.getElementById("searchInput");
        if (!input) return;

        const query = input.value.trim().toLowerCase();
        if (!allIssues.length) await fetchIssues();

        const filtered = allIssues.filter(issue =>
            (issue.title && issue.title.toLowerCase().includes(query)) ||
            (issue.description && issue.description.toLowerCase().includes(query))
        );


        ["openContainer", "closedContainer"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add("hidden");
        });

        renderIssues(filtered, "allContainer");
        updateCount(filtered);
        document.getElementById("allContainer")?.classList.remove("hidden");
    });
}

// On page load
window.onload = () => {
    loadTab("allBtn");
};


