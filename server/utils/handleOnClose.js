const { EMPTY_STRING } = require("./constants");
const { User } = require("./User");

function handleOnClose(userId, clientsPool, availableClients) {
  let index = availableClients.indexOf(userId);
  if (index > -1) {
    availableClients.splice(index, 1);
  }
  let recipientUserId = clientsPool.get(userId).recipientUserId;
  if (recipientUserId !== EMPTY_STRING) {
    let recipient = clientsPool.get(recipientUserId);
    recipient.client.send(`${"The user you were talking to left..."}`);
    recipient = new User(recipient.name, recipient.userId, recipient.client, EMPTY_STRING);
    clientsPool.set(recipientUserId, recipient);
    availableClients.push(recipientUserId);
  }

  clientsPool.delete(userId);
}

module.exports = { handleOnClose };
