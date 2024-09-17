document.addEventListener("DOMContentLoaded", () => {
  const data = allCreditSales;

  let rowsPerPage = parseInt(document.getElementById("entriesPerPage").value);
  let currentPage = 1;
  const tableBody = document.querySelector("#dataTable tbody");
  const pagination = document.getElementById("pagination");
  const searchInput = document.getElementById("searchInput");
  const entriesPerPageSelect = document.getElementById("entriesPerPage");
  const noResultsMessage = document.getElementById("noResultsMessage");

  let deleteForm; // To store the form to be submitted

  // Modal elements
  const deleteModal = document.getElementById("deleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");

  function renderTable(data, page = 1) {
    tableBody.innerHTML = "";
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = data.slice(start, end);

    if (paginatedData.length > 0) {
      paginatedData.forEach((item) => {
        let totalAmountDue = item.tonnageDispatched*item.amountDue
      
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.produceName}</td>
          <td>${item.tonnageDispatched}</td>
          <td>${item.amountDue}</td>
          <td>${totalAmountDue}</td>
          <td>${item.formattedDispatchDate}</td>
          <td>${item.formattedDueDate}</td>
          <td>${item.dispatchedBy}</td>
          <td>
            <div class="table-actions">
              <a class="action-btn view-btn" href="/view-credit-sale/${item._id}"><i class="bi bi-eye"></i></a>
              <a class="action-btn edit-btn" href="/update-credit-sale/${item._id}"><i class="bi bi-pen"></i></a>
              <form method="POST" action="/delete-credit-sale">
                <input type="hidden" name="id" value=${item._id}>
                <button class="action-btn del-btn" type="button"><i class="bi bi-trash"></i></button>
              </form>
            </div>
          </td>
        `;

        // Add event listener for delete button
        const delBtn = row.querySelector(".del-btn");
        const form = row.querySelector("form");

        delBtn.addEventListener("click", (e) => {
          e.preventDefault();
          deleteForm = form; // Store the form for submission after confirmation
          openDeleteModal(); // Open the confirmation modal
        });

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
        item.dispatchBranch.toLowerCase().includes(searchTerm) ||
        item.dispatchedBy.toLowerCase().includes(searchTerm)
    );
    renderTable(filteredData, 1);
  });

  entriesPerPageSelect.addEventListener("change", () => {
    rowsPerPage = parseInt(entriesPerPageSelect.value);
    renderTable(data, 1);
  });

  renderTable(data);

  // Modal functionality
  function openDeleteModal() {
    deleteModal.style.display = "block"; // Show modal
  }

  function closeDeleteModal() {
    deleteModal.style.display = "none"; // Hide modal
  }

  // Confirm delete action
  confirmDeleteBtn.addEventListener("click", () => {
    if (deleteForm) {
      deleteForm.submit(); // Submit the form if confirmed
    }
    closeDeleteModal();
  });

  // Cancel delete action
  cancelDeleteBtn.addEventListener("click", closeDeleteModal);

  // Close modal if clicked outside of it
  window.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      closeDeleteModal();
    }
  });
});
