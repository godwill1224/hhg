document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const branchNameInput = document.getElementById("branchName");
  const branchLocationInput = document.getElementById("branchLocation");
  const dateCreatedInput = document.getElementById("dateCreated");
  const commentInput = document.getElementById("comment");
  const invalidationMessage = document.querySelector(".invalidation-message");

  form.addEventListener("submit", function (event) {
    let isValid = true;
    let errorMessage = "Failed to update branch!!!\n";

    // Clear previous messages
    invalidationMessage.textContent = "";

    // Validate Branch Name
    if (!branchNameInput.value.trim()) {
      isValid = false;
      errorMessage += "Branch Name is required.\n";
      branchNameInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Branch Location Number
    if (!branchLocationInput.value.trim()) {
      isValid = false;
      errorMessage += "Branch Location is required.\n";
      branchLocationInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Role Selection
    if (dateCreatedInput.value.trim() === "") {
      isValid = false;
      errorMessage += "Please add a date.\n";
      dateCreatedInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Branch Selection
    if (commentInput.value.trim() === "") {
      isValid = false;
      errorMessage += "Please add a comment.\n";
      commentInput.style = "border: 1px #ef1515 solid";
    }

    // If validation fails, prevent form submission and show the error message
    if (!isValid) {
      event.preventDefault();
      invalidationMessage.textContent = errorMessage;
      invalidationMessage.style =
        "border: 1px #ef1515 solid;  background-color: #ffeeee;  padding: 8px;";
    }
  });
});
