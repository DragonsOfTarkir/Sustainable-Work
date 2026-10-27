// Paste your new Google Apps Script Web App Deployment URL here
const API_URL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL"; 

let rawRepositoryData = [];

document.addEventListener("DOMContentLoaded", () => {
    fetchRepositoryData();
    setupFilters();
});

function setupFilters() {
    document.getElementById("searchBox").addEventListener("input", applyFilters);
    document.getElementById("typeFilter").addEventListener("change", applyFilters);
}

// Fetch database records
function fetchRepositoryData() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            rawRepositoryData = data;
            renderTable(data);
        })
        .catch(err => {
            document.getElementById("repoBody").innerHTML = `<tr><td style="color:red;">Failed to retrieve sheet data. Verify API URL configuration.</td></tr>`;
        });
}

function renderTable(data) {
    if (data.length === 0) {
        document.getElementById("repoBody").innerHTML = `<tr><td colspan="100%">No matching repository elements found.</td></tr>`;
        return;
    }
    
    // Isolate active dataset keys mapping columns
    const keys = Object.keys(data[0]).filter(k => k !== 'sheet_row_index');
    
    // Inject headers + Actions column
    const headerRow = document.getElementById("tableHeaders");
    headerRow.innerHTML = keys.map(k => `<th>${k.toUpperCase().replace(/_/g, ' ')}</th>`).join('') + '<th>ACTIONS</th>';

    const tbody = document.getElementById("repoBody");
    tbody.innerHTML = "";

    data.forEach(row => {
        const tr = document.createElement("tr");
        
        keys.forEach(key => {
            const td = document.createElement("td");
            let cellValue = row[key] || "";
            
            // Format clickable hyperlink elements seamlessly
            if (typeof cellValue === "string" && (cellValue.startsWith("http://") || cellValue.startsWith("https://"))) {
                td.innerHTML = `<a href="${cellValue}" target="_blank" class="repo-link">View Link</a>`;
            } else {
                td.textContent = cellValue;
            }

            // Grant immediate, native browser text-editing privileges to the table cell
            td.contentEditable = "true";
            td.classList.add("editable-cell");
            td.dataset.key = key;
            
            tr.appendChild(td);
        });

        // Add action button directly to the row
        const actionTd = document.createElement("td");
        actionTd.innerHTML = `<button class="save-btn">Save Row</button>`;
        actionTd.querySelector(".save-btn").addEventListener("click", (e) => saveRowChanges(e, row.sheet_row_index, tr));
        tr.appendChild(actionTd);

        tbody.appendChild(tr);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById("searchBox").value.toLowerCase();
    const typeTerm = document.getElementById("typeFilter").value.toLowerCase();

    const filtered = rawRepositoryData.filter(row => {
        const matchesSearch = Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm));
        const matchesType = typeTerm === "" || (row.category && String(row.category).toLowerCase() === typeTerm);
        return matchesSearch && matchesType;
    });

    renderTable(filtered);
}

// Dispatches updated rows back to the master sheet array
function saveRowChanges(event, sheetRowIndex, rowElement) {
    const btn = event.target;
    btn.textContent = "Saving...";
    btn.disabled = true;

    const updatedData = {};
    const cells = rowElement.querySelectorAll(".editable-cell");
    
    cells.forEach(cell => {
        const key = cell.dataset.key;
        
        // If the cell contains our hyperlink template, parse the original href value
        const linkElement = cell.querySelector("a");
        if (linkElement) {
            updatedData[key] = linkElement.href;
        } else {
            updatedData[key] = cell.textContent.trim();
        }
    });

    const payload = {
        sheet_row_index: sheetRowIndex,
        updated_data: updatedData
    };

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(() => {
        btn.textContent = "Saved!";
        btn.style.background = "#28a745";
        
        setTimeout(() => {
            btn.textContent = "Save Row";
            btn.style.background = "#007bff";
            btn.disabled = false;
            
            // Re-render to convert plaintext links back into clickable elements if updated
            fetchRepositoryData(); 
        }, 1500);
    })
    .catch(err => {
        alert("Error saving data changes directly.");
        btn.textContent = "Save Row";
        btn.disabled = false;
    });
}
