document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const produceNameInput = document.getElementById("produceName");
  const produceTypeInput = document.getElementById("produceType");
  const tonnageInput = document.getElementById("tonnage");
  const produceCostInput = document.getElementById("produceCost");
  const sellingPriceInput = document.getElementById("sellingPrice");
  const dealerNameInput = document.getElementById("dealerName");
  const dealerEmailInput = document.getElementById("dealerEmail");
  const dealerPhoneInput = document.getElementById("dealerPhone");
  const dateAddedInput = document.getElementById("dateAdded");
  const invalidationMessage = document.querySelector(".invalidation-message");

  form.addEventListener("submit", function (event) {
    let isValid = true;
    let errorMessage = "Failed to add new Produce!!!\n";

    // Clear previous messages
    invalidationMessage.textContent = "";

    if (!produceNameInput.value.trim()) {
      isValid = false;
      errorMessage += "Produce Name is required.\n";
      produceNameInput.style = "border: 1px #ef1515 solid";
    }

    if (!produceTypeInput.value.trim()) {
      isValid = false;
      errorMessage += "Produce Type is required.\n";
      produceTypeInput.style = "border: 1px #ef1515 solid";
    }

    if (!tonnageInput.value.trim() || tonnageInput.value.trim().length < 3 ) {
      isValid = false;
      errorMessage += "Tonnage should be 3 or more characters and is required.\n";
      tonnageInput.style = "border: 1px #ef1515 solid";
    }

    if (!produceCostInput.value.trim() || produceCostInput.value.trim().length < 5 ) {
      isValid = false;
      errorMessage += "Produce Cost should be 5 or more characters and is required.\n";
      produceCostInput.style = "border: 1px #ef1515 solid";
    }

    if (!sellingPriceInput.value.trim()) {
      isValid = false;
      errorMessage += "Selling Price is required.\n";
      sellingPriceInput.style = "border: 1px #ef1515 solid";
    }

    if (!dealerNameInput.value.trim() || dealerNameInput.value.trim() < 2) {
      isValid = false;
      errorMessage += "Dealer's Name should be 2 or more characters and is required.\n";
      dealerNameInput.style = "border: 1px #ef1515 solid";
    }

    const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!dealerEmailInput.value.trim() || !dealerEmailInput.value.trim().match(emailPattern)) {
      isValid = false;
      errorMessage += "Dealer's Email is invalid.\n";
      dealerEmailInput.style = "border: 1px #ef1515 solid";
    }

    const phonePattern = /^\d{10}$/;
    if (!dealerPhoneInput.value.trim() || !phonePattern.test(dealerPhoneInput.value.trim())) {
      isValid = false;
      errorMessage += "Dealer's Phone number is invalid.\n";
      dealerPhoneInput.style = "border: 1px #ef1515 solid";
    }

    if (!dateAddedInput.value.trim()) {
      isValid = false;
      errorMessage += "Date is required.\n";
      dateAddedInput.style = "border: 1px #ef1515 solid";
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
