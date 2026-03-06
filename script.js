const API_BASE = "https://phi-lab-server.vercel.app/api/v1/lab/issues";

let allIssues = [];

// Fetch all issues from API
async function fetchIssues() {
    document.getElementById("loadingSpinner").classList.remove("hidden");
    const res = await fetch(API_BASE);
    const data = await res.json();
    allIssues = data.data;
    document.getElementById("loadingSpinner").classList.add("hidden");
    return allIssues;
}

// Render issues into container
function renderIssues(issues, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    issues.forEach(issue => {
        const card = document.createElement("div");

        // Top border color based on status
        const borderColor = issue.status.toLowerCase() === "open" ? "border-t-4 border-green-500" : "border-t-4 border-purple-500";

        // Priority badge color
        let priorityBg = "bg-green-200";
        let priorityText = "text-green-700";
        if (issue.priority.toLowerCase() === "high") {
            priorityBg = "bg-pink-200";
            priorityText = "text-pink-700";
        } else if (issue.priority.toLowerCase() === "medium") {
            priorityBg = "bg-yellow-200";
            priorityText = "text-yellow-700";
        }

        // Labels badges
        let labelsHtml = "";
        if (issue.label) {
            labelsHtml = issue.label.split(",").map(label => {
                label = label.trim();
                let color = "bg-gray-100 text-gray-500";
                let emoji = "";
                if (label.toLowerCase().includes("bug")) { color = "bg-red-100 text-red-500"; emoji = "🐞 "; }
                if (label.toLowerCase().includes("help")) { color = "bg-orange-100 text-orange-500"; emoji = "🛟 "; }
                return `<span class="text-xs px-3 py-1 rounded-full ${color}">${emoji}${label.toUpperCase()}</span>`;
            }).join(" ");
        }

        card.className = `bg-white w-[360px] p-6 rounded-xl shadow-md cursor-pointer ${borderColor}`;
        card.innerHTML = `
            <!-- top section -->
            <div class="flex justify-between items-center mb-3">
                <div class="w-8 h-8 rounded-full bg-green-200 flex items-center justify-center">
                    <span class="text-green-700 text-sm">⟳</span>
                </div>
                <span class="text-l font-semibold px-3 py-1 rounded-full ${priorityBg} ${priorityText}">
                    ${issue.priority.toUpperCase()}
                </span>
            </div>

            <!-- title -->
            <h2 class="text-lg font-bold mb-2 text-blue-600" onclick="showIssueModal(${issue.id})">
                ${issue.title}
            </h2>

            <!-- description -->
            <p class="text-gray-500 text-sm mb-4">
                ${issue.description.length > 80 ? issue.description.slice(0, 80) + "..." : issue.description}
            </p>

            <!-- tags -->
            <div class="flex gap-2 mb-4">
                ${labelsHtml}
            </div>
             <span class="bg-red-100 border border-red-300 text-red-500 text-xs px-3 py-1 rounded-full">
            🐞 BUG
        </span>

        <span class="bg-orange-100 border border-orange-300 text-orange-500 text- px-3 py-s1 rounded-full">
            🛟 HELP WANTED
        </span>
            <!-- footer -->
            <div class="text-gray-400 text-sm">
                #${issue.id} by ${issue.author} <br>
                ${new Date(issue.createdAt).toLocaleDateString()}
            </div>
        `;
        container.appendChild(card);
    });
}

// Update count
function updateCount(issues) {
    document.getElementById("issueCount").innerText = `${issues.length} Issues`;
}

// Load issues by status
async function loadIssues(status = "all") {
    if (!allIssues.length) await fetchIssues();

    // Hide all containers first
    ["allContainer", "openContainer", "closedContainer"].forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });

    let filtered = allIssues;
    let containerId = "allContainer";

    if (status === "open") {
        filtered = allIssues.filter(i => i.status.toLowerCase() === "open");
        containerId = "openContainer";
    } else if (status === "closed") {
        filtered = allIssues.filter(i => i.status.toLowerCase() === "closed");
        containerId = "closedContainer";
    }

    renderIssues(filtered, containerId);
    updateCount(filtered);

    // Show the container
    document.getElementById(containerId).classList.remove("hidden");
}

// Handle tab button click
function loadTab(buttonId) {
    // Remove active style from all buttons
    document.querySelectorAll(".allBtn").forEach(btn => {
        btn.classList.remove("bg-[#4A00FF]", "text-white");
        btn.classList.add("bg-white", "text-black");
    });

    const clicked = document.getElementById(buttonId);
    clicked.classList.add("bg-[#4A00FF]", "text-white");
    clicked.classList.remove("bg-white", "text-black");

    const status = clicked.getAttribute("data-tab");
    loadIssues(status);
}

// Show modal
async function showIssueModal(id) {
    const res = await fetch(`https://phi-lab-server.vercel.app/api/v1/lab/issue/${id}`);
    const issue = await res.json();

    document.getElementById('cartTitle').innerText = issue.title;
    document.getElementById('cartDescription').innerText = issue.description;
    document.getElementById('cartStatus').innerText = `Status: ${issue.status}`;
    document.getElementById('cartCategory').innerText = `Category: ${issue.category}`;
    document.getElementById('cartAuthor').innerText = `Author: ${issue.author}`;
    document.getElementById('cartPriority').innerText = `Priority: ${issue.priority}`;
    document.getElementById('cartLabel').innerText = `Label: ${issue.label}`;
    document.getElementById('cartCreated').innerText = `Created At: ${issue.createdAt}`;

    document.getElementById('issueCart').classList.remove('hidden');
}

// Close modal
function closeCart() {
    document.getElementById('issueCart').classList.add('hidden');
}

// Search functionality
document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim().toLowerCase();
    if (!allIssues.length) await fetchIssues();
    const filtered = allIssues.filter(issue => issue.title.toLowerCase().includes(query) || issue.description.toLowerCase().includes(query));
    renderIssues(filtered, "allContainer");
    updateCount(filtered);
    document.getElementById("allContainer").classList.remove("hidden");
    document.getElementById("openContainer").classList.add("hidden");
    document.getElementById("closedContainer").classList.add("hidden");
});

// On page load
window.onload = () => {
    loadTab("allBtn"); // Default: All tab active
};