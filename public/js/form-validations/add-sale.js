document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const produceNameInput = document.getElementById("produceName");
  const produceTypeInput = document.getElementById("produceType");
  const tonnageSoldInput = document.getElementById("tonnageSold");
  const amountPaidInput = document.getElementById("amountPaid");
  const buyerNameInput = document.getElementById("buyerName");
  const buyerEmailInput = document.getElementById("buyerEmail");
  const buyerPhoneInput = document.getElementById("buyerPhone");
  const dateSoldInput = document.getElementById("dateSold");
  const invalidationMessage = document.querySelector(".invalidation-message");

  form.addEventListener("submit", function (event) {
    let isValid = true;
    let errorMessage = "Failed to make new Sale!!!\n";

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

    if (!tonnageSoldInput.value.trim()) {
      isValid = false;
      errorMessage += "Tonnage Sold is required.\n";
      tonnageSoldInput.style = "border: 1px #ef1515 solid";
    }

    if (!amountPaidInput.value.trim()) {
      isValid = false;
      errorMessage += "Amount Paid is required.\n";
      amountPaidInput.style = "border: 1px #ef1515 solid";
    }

    if (!buyerNameInput.value.trim() || buyerNameInput.value.trim() < 2) {
      isValid = false;
      errorMessage += "Buyer / Customer Name should be 2 or more characters and is required.\n";
      buyerNameInput.style = "border: 1px #ef1515 solid";
    }

    const emailPattern =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if (!buyerEmailInput.value.trim() || !buyerEmailInput.value.trim().match(emailPattern)) {
      isValid = false;
      errorMessage += "Buyer / Customer Email is invalid.\n";
      buyerEmailInput.style = "border: 1px #ef1515 solid";
    }

    const phonePattern = /^\d{10}$/;
    if (!buyerPhoneInput.value.trim() || !phonePattern.test(buyerPhoneInput.value.trim())) {
      isValid = false;
      errorMessage += "Buyer / Customer Phone number is invalid.\n";
      buyerPhoneInput.style = "border: 1px #ef1515 solid";
    }

    if (!dateSoldInput.value.trim()) {
      isValid = false;
      errorMessage += "Date Sold is required.\n";
      dateSoldInput.style = "border: 1px #ef1515 solid";
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
