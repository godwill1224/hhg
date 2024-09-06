document.addEventListener("DOMContentLoaded", () => {
  let deleteForm; // Store the form that will be submitted upon confirmation
  const deleteModal = document.getElementById("deleteModal");
  const confirmDeleteBtn = document.getElementById("confirmDelete");
  const cancelDeleteBtn = document.getElementById("cancelDelete");

  // Find all delete buttons
  const delBtn = document.querySelector(".del-btn");

  // Open the modal when delete button is clicked
  delBtn.addEventListener("click", (e) => {
    e.preventDefault();
    deleteForm = delBtn.closest("form"); // Store the form
    deleteModal.style.display = "block"; // Show the modal
  });

  // Confirm delete action
  confirmDeleteBtn.addEventListener("click", () => {
    if (deleteForm) {
      deleteForm.submit(); // Submit the form if confirmed
    }
    deleteModal.style.display = "none"; // Hide the modal
  });

  // Cancel delete action
  cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.style.display = "none"; // Close the modal
  });

  // Close modal if clicked outside
  window.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
      deleteModal.style.display = "none"; // Hide modal if clicked outside
    }
  });
});
