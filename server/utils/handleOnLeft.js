const { EMPTY_STRING } = require("./constants");
const { User } = require("./User");

function handleOnLeft(userId, clientsPool, availableClients) {
  let user = clientsPool.get(userId);
  let recipientUserId = user.recipientUserId;
  user = new User(user.name, user.userId, user.client, EMPTY_STRING);
  clientsPool.set(userId, user);
  let recipient = clientsPool.get(recipientUserId);
  recipient = new User(recipient.name, recipient.userId, recipient.client, EMPTY_STRING);
  clientsPool.set(recipient.userId, recipient);
}

module.exports = { handleOnLeft };
