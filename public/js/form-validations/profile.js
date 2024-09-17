document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const userNameInput = document.getElementById("userName");
  const phoneNumberInput = document.getElementById("phoneNumber");
  const profileImageInput = document.getElementById("profileImage");
  const invalidationMessage = document.querySelector(".invalidation-message");
  const profileImagePreview = document.getElementById("profileImagePreview");

  form.addEventListener("submit", function (event) {
    let isValid = true;

    // Clear previous styles
    userNameInput.style = "border: 1px #087001 solid";
    phoneNumberInput.style = "border: 1px #087001 solid";
    profileImageInput.style = "border: 1px #087001 solid";

    let errorMessage = "Failed to submit!\n";

    // Clear previous messages
    invalidationMessage.textContent = "";

    if (!userNameInput.value.trim()) {
      isValid = false;
      errorMessage += "Full Name is required.\n";
      userNameInput.style = "border: 1px #ef1515 solid";
    }

    if (!phoneNumberInput.value.trim()) {
      isValid = false;
      errorMessage += "Phone Number is required.\n";
      phoneNumberInput.style = "border: 1px #ef1515 solid";
    }

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
        "border: 1px #ef1515 solid;  background-color: #ffeeee;  padding: 8px;";
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
