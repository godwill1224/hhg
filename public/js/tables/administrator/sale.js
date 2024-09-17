document.addEventListener("DOMContentLoaded", () => {
  const data = allSales;

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
        let totalAmountPaid = item.tonnageSold*item.amountPaid

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.produceName}</td>
          <td>${item.tonnageSold}</td>
          <td>${item.amountPaid}</td>
          <td>${totalAmountPaid}</td>
          <td>${item.formattedDate}</td>
          <td>${item.saleBranch}</td>
          <td>${item.soldBy}</td>
          <td>
            <div class="table-actions">
              <a class="action-btn view-btn" href="/view-sale/${item._id}"><i class="bi bi-eye"></i> View</a>
            </div>
          </td>
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
        item.produceName.toLowerCase().includes(searchTerm) ||
        item.saleBranch.toLowerCase().includes(searchTerm) ||
        item.soldBy.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredData, 1);
  });

  entriesPerPageSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(entriesPerPageSelect.value);
    renderTable(data, 1);
  });

  renderTable(data);
});
