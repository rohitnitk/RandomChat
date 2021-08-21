const cookieParser = require("cookie");
const { createMessage } = require("./createMessage");
const { WAIT } = require("./constants");
const { getRandomRecipient } = require("./getRandomRecipient");
const { User } = require("./User");
function handleNewChatRequest(userId, req, client, clientsPool, availableClients) {
  if (availableClients.length >= 2) {
    let recipientUserId = getRandomRecipient(userId, clientsPool, availableClients);
    if (recipientUserId === null) {
      return false;
    }
    let recipient = clientsPool.get(recipientUserId);
    if (recipient != undefined) {
      //update opponent (or recipient) cookie in sender object
      let user = clientsPool.get(userId);
      user = new User(user.name, user.userId, user.client, recipient.userId);
      clientsPool.set(userId, user);

      //update opponent (or recipient) cookie in recipient object
      recipient = clientsPool.get(clientsPool.get(userId).recipientUserId);
      user = new User(recipient.name, recipient.userId, recipient.client, userId);
      clientsPool.set(recipient.userId, user);
      let name = cookieParser.parse(req.headers.cookie).name;
      recipient.client.send(`${createMessage("CONNECTED", name)}`);
      client.send(`${createMessage("CONNECTED", recipient.name)}`);
    }

    console.log("getRandomRecipient() run...");
    return true;
  }
  return false;
}

module.exports = { handleNewChatRequest };
