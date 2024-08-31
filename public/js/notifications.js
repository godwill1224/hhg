// public/javascripts/notifications.js

// Connect to the server via Socket.IO
const socket = io();

// socket.on("connect", () => {
//   console.log("Connected to the server via Socket.IO");
// });

// socket.on("disconnect", () => {
//   console.log("Disconnected from the server");
// });

// // Function to request notification permission
// function requestNotificationPermission() {
//   if ("Notification" in window && Notification.permission !== "granted") {
//     Notification.requestPermission().then((permission) => {
//       if (permission === "granted") {
//         console.log("Notification permission granted.");
//       } else {
//         console.log("Notification permission denied.");
//       }
//     });
//   }
// }

// Function to display foreground notifications
function showForegroundNotification(title, options) {
  const notificationContainer = document.getElementById(
    "notification-container"
  );

  if (!notificationContainer) {
    console.error("Notification container not found");
    return;
  }

  const notificationElement = document.createElement("div");
  notificationElement.className = "notification";
  notificationElement.innerHTML = `
    ${
      options.icon
        ? `<img src="${options.icon}" alt="Notification Icon" />`
        : ""
    }
    <div>
      <h6>${title}</h6>
      <p>${options.body}</p>
    </div>
  `;

  notificationContainer.appendChild(notificationElement);

  // Remove the notification after 5 seconds
  setTimeout(() => {
    notificationElement.remove();
  }, 5000);
}


// Listen for the 'notification' event from the server
socket.on("notification", (notification) => {
  const { title, body, icon } = notification;

  console.log(notification);

  // Display the notification
  showForegroundNotification(title, {
    body: body,
    icon: icon,
  });
});


