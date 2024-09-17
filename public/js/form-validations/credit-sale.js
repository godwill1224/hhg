document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const produceNameInput = document.getElementById("produceName");
  const produceTypeInput = document.getElementById("produceType");
  const tonnageDispatchedInput = document.getElementById("tonnageDispatched");
  const amountDueInput = document.getElementById("amountDue");
  const buyerNameInput = document.getElementById("buyerName");
  const buyerEmailInput = document.getElementById("buyerEmail");
  const buyerPhoneInput = document.getElementById("buyerPhone");
  const buyerNINInput = document.getElementById("buyerNIN");
  const buyerLocationInput = document.getElementById("buyerLocation");
  const dueDateInput = document.getElementById("dueDate");
  const dispatchDateInput = document.getElementById("dispatchDate");
  const invalidationMessage = document.querySelector(".invalidation-message");

  form.addEventListener("submit", function (event) {
    let isValid = true;

    // Clear previous styles
    produceNameInput.style = "border: 1px #087001 solid";
    produceTypeInput.style = "border: 1px #087001 solid";
    tonnageDispatchedInput.style = "border: 1px #087001 solid";
    amountDueInput.style = "border: 1px #087001 solid";
    buyerNameInput.style = "border: 1px #087001 solid";
    buyerEmailInput.style = "border: 1px #087001 solid";
    buyerPhoneInput.style = "border: 1px #087001 solid";
    buyerNINInput.style = "border: 1px #087001 solid";
    buyerLocationInput.style = "border: 1px #087001 solid";
    dueDateInput.style = "border: 1px #087001 solid";
    dispatchDateInput.style = "border: 1px #087001 solid";

    let errorMessage = "Failed to submit!\n";

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

    if (!tonnageDispatchedInput.value.trim()) {
      isValid = false;
      errorMessage += "Tonnage Dispatched is required.\n";
      tonnageDispatchedInput.style = "border: 1px #ef1515 solid";
    }

    if (!amountDueInput.value.trim() || amountDueInput.value.trim().length < 4) {
      isValid = false;
      errorMessage += "Amount Due should be 4 or more characters and is required.\n";
      amountDueInput.style = "border: 1px #ef1515 solid";
    }

    if (!buyerNameInput.value.trim() || buyerNameInput.value.trim().length < 2) {
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

    const ninPattern = /^[A-Z0-9]{14}$/i;
    if (!buyerNINInput.value.trim() || !ninPattern.test(buyerNINInput.value.trim())) {
      isValid = false;
      errorMessage += "Buyer / Customer NIN is invalid.\n";
      buyerNINInput.style = "border: 1px #ef1515 solid";
    }

    if (!buyerLocationInput.value.trim() || buyerLocationInput.value.trim().length < 2) {
      isValid = false;
      errorMessage += "Buyer / Customer Location should be 2 or more characters and is required.\n";
      buyerLocationInput.style = "border: 1px #ef1515 solid";
    }

    if (!dispatchDateInput.value.trim()) {
      isValid = false;
      errorMessage += "Dispatch date is required.\n";
      dispatchDateInput.style = "border: 1px #ef1515 solid";
    }

    if (!dueDateInput.value.trim()) {
      isValid = false;
      errorMessage += "Due date is required.\n";
      dueDateInput.style = "border: 1px #ef1515 solid";
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
