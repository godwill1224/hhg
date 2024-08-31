document.addEventListener("DOMContentLoaded", () => {
  const data = [
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "matugga", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "soybeans", location: "kampala to bombo road" },
    { branchname: "matugga", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    { branchname: "maganjo", location: "kampala to bombo road" },
    // Add more data as needed
  ];

  let rowsPerPage = parseInt(document.getElementById("entriesPerPage").value);
  let currentPage = 1;
  const tableBody = document.querySelector("#dataTable tbody");
  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("searchInput");
  const entriesPerPageSelect = document.getElementById("entriesPerPage");
  const noResultsMessage = document.getElementById("noResultsMessage");

  function renderTable(data, page = 1) {
    tableBody.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (paginatedData.length > 0) {
      paginatedData.forEach((item) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                    <td>${item.branchname}</td>
                    <td>${item.location}</td>
                    <td>${item.location}</td>
                    <td><button class="action-btn view-btn"><i class="bi bi-eye"></i> View</button>
                    <button class="action-btn edit-btn"><i class="bi bi-pen"></i> Edit</button>
                    <button class="action-btn del-btn"><i class="bi bi-trash"></i> Delete</button></td>
                `;
        tableBody.appendChild(row);
      });
      noResultsMessage.style.display = "none";
    } else {
      noResultsMessage.style.display = "block";
    }

    renderPagination(data.length, page);
  }

  function renderPagination(totalItems, currentPage) {
    pagination.innerHTML = "";
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("span");
      btn.className = `pagination-btn ${i === currentPage ? "active" : ""}`;
      btn.innerText = i;
      btn.addEventListener("click", () => {
        currentPage = i;
        renderTable(data, currentPage);
      });
      pagination.appendChild(btn);
    }
  }

  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredData = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.country.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredData, 1);
  });

  entriesPerPageSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(entriesPerPageSelect.value);
    renderTable(data, 1);
  });

  renderTable(data);
});
