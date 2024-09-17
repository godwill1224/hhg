// notificationService.js
const axios = require("axios");

/**
 * Sends a notification
 * @param {string} title - The title of the notification
 * @param {string} message - The message body of the notification
 * @param {string} notificationType - Type of notification ('success' or 'error')
 */
const sendNotification = async (title, message, notificationType) => {
  try {
    await axios.post("http://localhost:4500/notifications", {
      title,
      message,
      notificationType,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendNotification };
