const cookieParser = require("cookie");

const WebSocket = require("ws");
const { server } = require("./server");
const { EMPTY_STRING, DEFAULT_NAME } = require("./utils/constants");
const { getRandomRecipient } = require("./utils/getRandomRecipient");
const { handleOnClose } = require("./utils/handleOnClose");
const { User } = require("./utils/User");

const wsServer = new WebSocket.Server({ server: server });

const clientsPool = new Map();
const availableClients = [];

wsServer.on("connection", (client, req) => {
  console.log("Client Connected!");
  let userId = cookieParser.parse(req.headers.cookie).userId;
  if (clientsPool.has(userId)) {
    handleOnClose(userId, clientsPool, availableClients);
  }
  let user = new User(DEFAULT_NAME, userId, client, EMPTY_STRING);
  clientsPool.set(userId, user);
  availableClients.push(userId);

  if (availableClients.length >= 2) {
    let recipient = clientsPool.get(getRandomRecipient(userId, clientsPool, availableClients));

    if (recipient != undefined) {
      //update opponent (or recipient) cookie in sender object
      user = new User(user.name, user.userId, user.client, recipient.userId);
      clientsPool.set(userId, user);

      //update opponent (or recipient) cookie in recipient object
      recipient = clientsPool.get(clientsPool.get(userId).recipientUserId);
      user = new User(recipient.name, recipient.userId, recipient.client, userId);
      clientsPool.set(recipient.userId, user);
      recipient.client.send(`${recipient.userId}`);
    }

    console.log("getRandomRecipient() run...");
  } else {
    client.send(`${"Nobody is available to chat..."}`);
  }

  client.on("message", function incoming(msg) {
    console.log("received: %s", msg);
    let recipientUserId = clientsPool.get(cookieParser.parse(req.headers.cookie).userId).recipientUserId;
    if (recipientUserId !== EMPTY_STRING) {
      let recipient = clientsPool.get(recipientUserId);
      recipient.client.send(`${msg}`);
    } else {
      client.send(`${"Nobody is available to chat...Or The User you were talking to left..."}`);
    }
  });

  client.on("close", function () {
    userId = cookieParser.parse(req.headers.cookie).userId;

    if (clientsPool.has(userId)) {
      handleOnClose(userId, clientsPool, availableClients);
    }
  });
});
