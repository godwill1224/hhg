document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const userNameInput = document.getElementById("userName");
  const emailInput = document.getElementById("email");
  const phoneNumberInput = document.getElementById("phoneNumber");
  const roleSelect = document.getElementById("role");
  const branchSelect = document.getElementById("branch");
  const dateAddedInput = document.getElementById("dateAdded");
  const profileImageInput = document.getElementById("profileImage");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const invalidationMessage = document.querySelector(".invalidation-message");
  const profileImagePreview = document.getElementById("profileImagePreview");

  form.addEventListener("submit", function (event) {
    let isValid = true;
    let errorMessage = "Failed to add new user!!!\n";

    // Clear previous messages
    invalidationMessage.textContent = "";

    // Validate Full Name
    if (!userNameInput.value.trim()) {
      isValid = false;
      errorMessage += "Full Name is required.\n";
      userNameInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Email
    const emailPattern =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (
      !emailInput.value.trim() ||
      !emailInput.value.trim().match(emailPattern)
    ) {
      isValid = false;
      errorMessage += "A valid Email Address is invalid.\n";
      emailInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Date Added
    if (!dateAddedInput.value.trim()) {
      isValid = false;
      errorMessage += "A date is required.\n";
      dateAddedInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Role Selection
    if (roleSelect.value.trim() === "") {
      isValid = false;
      errorMessage += "Please select a User Role.\n";
      roleSelect.style = "border: 1px #ef1515 solid";
    }

    // Validate Branch Selection
    if (branchSelect.value.trim() === "") {
      isValid = false;
      errorMessage += "Please select a User Branch.\n";
      branchSelect.style = "border: 1px #ef1515 solid";
    }

    // Validate Phone Number    
    const phonePattern = /^\d{10}$/;
    if (!phoneNumberInput.value.trim() || !phonePattern.test(phoneNumberInput.value.trim())) {
      isValid = false;
      errorMessage += "Phone Number is invalid.\n";
      phoneNumberInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Password
    if (!passwordInput.value.trim()) {
      isValid = false;
      errorMessage += "Password is required.\n";
    } else if (passwordInput.value.length < 6) {
      isValid = false;
      errorMessage += "Password must be at least 6 characters long.\n";
      passwordInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Confirm Password
    if (!confirmPasswordInput.value.trim()) {
      isValid = false;
      errorMessage += "Confirm Password is required.\n";
      confirmPasswordInput.style = "border: 1px #ef1515 solid";
    } else if (passwordInput.value !== confirmPasswordInput.value) {
      isValid = false;
      errorMessage += "Passwords do not match.\n";
      confirmPasswordInput.style = "border: 1px #ef1515 solid";
    }

    // Validate Profile Image file size (if uploaded)
    if (profileImageInput.files.length > 0) {
      const file = profileImageInput.files[0];
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (file.size > maxSize) {
        isValid = false;
        errorMessage += "Profile Image size must be less than 2MB.\n";
        profileImageInput.style = "border: 1px #ef1515 solid";
      }
    }

    // If validation fails, prevent form submission and show the error message
    if (!isValid) {
      event.preventDefault();
      invalidationMessage.textContent = errorMessage;
      invalidationMessage.style =
        "border: 1px #ef1515 solid;  background-color: #ffeeee; padding: 8px;";
    }
  });

  // Preview selected profile image
  profileImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        profileImagePreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      profileImagePreview.src = "/img/profile-img.png"; // Default profile image
    }
  });
});
