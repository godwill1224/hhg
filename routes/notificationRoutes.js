// In routes/api.js
const express = require('express');
const router = express.Router();

let notifications = [];

// Route to get notifications
router.get('/notifications', (req, res) => {
  res.json(notifications);
});

// Route to add notifications
router.post('/notifications', (req, res) => {
  const { title, message, notificationType } = req.body;
  const notification = { title, message, notificationType };

  notifications.push(notification);
  res.status(201).json(notification);
});

// Route to clear notifications
router.delete('/notifications', (req, res) => {
  notifications = [];
  res.status(204).send();
});

module.exports = router;
