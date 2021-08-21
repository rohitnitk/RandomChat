const { EMPTY_STRING, LEFT } = require("./constants");
const { User } = require("./User");
const { createMessage } = require("./createMessage");

function handleOnClose(userId, clientsPool, availableClients) {
  let index = availableClients.indexOf(userId);
  if (index > -1) {
    availableClients.splice(index, 1);
  }
  let recipientUserId = clientsPool.get(userId).recipientUserId;
  if (recipientUserId !== EMPTY_STRING) {
    let recipient = clientsPool.get(recipientUserId);
    recipient.client.send(`${createMessage(LEFT, "The user you were talking to left...")}`);
    recipient = new User(recipient.name, recipient.userId, recipient.client, EMPTY_STRING);
    clientsPool.set(recipientUserId, recipient);
  }

  clientsPool.delete(userId);
}

module.exports = { handleOnClose };
