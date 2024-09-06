document.addEventListener("DOMContentLoaded", async () => {
  const notificationQueue = [];
  let isNotificationVisible = false;

  // Function to display foreground notifications
  function showForegroundNotification(title, message, notificationType) {
    const notificationContainer = document.getElementById("notification-container");

    if (!notificationContainer) {
      console.error("Notification container not found");
      return;
    }

    const notificationElement = document.createElement("div");
    notificationElement.className = "notification";
    notificationElement.innerHTML = `
      ${
        notificationType === "success"
          ? `<div>
              <h6>${title}</h6>
              <p>${message}</p>
            </div>
            <img src="/img/notification-success.png" alt="Notification Icon" />`
          : `<div class="error-notification">
              <h6>${title}</h6>
              <p>${message}</p>
            </div>
            <img src="/img/notification-error.png" alt="Notification Icon" />`
      }
    `;
    
    // Append the notification to the container
    notificationContainer.appendChild(notificationElement);

    isNotificationVisible = true;

    // Automatically remove the notification after 5 seconds with an exit animation
    setTimeout(() => {
      notificationElement.classList.add("notification-exit");
      setTimeout(() => {
        notificationElement.remove();
        isNotificationVisible = false;
        // Show the next notification in the queue
        if (notificationQueue.length > 0) {
          const nextNotification = notificationQueue.shift();
          showForegroundNotification(nextNotification.title, nextNotification.message, nextNotification.notificationType);
        }
      }, 500); // Matches the duration of the slide-out animation
    }, 5000);
  }

  // Function to add a notification to the queue
  function queueNotification(title, message, notificationType) {
    if (isNotificationVisible) {
      notificationQueue.push({ title, message, notificationType });
    } else {
      showForegroundNotification(title, message, notificationType);
    }
  }

  try {
    // Fetch notifications from the server
    const response = await fetch("/notifications");
    const notifications = await response.json();

    // Queue each notification to display them sequentially
    notifications.forEach((notification) => {
      queueNotification(notification.title, notification.message, notification.notificationType);
    });

    // Clear notifications from the server after they are displayed
    await fetch("/notifications", { method: "DELETE" });
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
});
