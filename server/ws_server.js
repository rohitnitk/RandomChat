// const apps = require("express")();
//const httpServer = require("http").createServer(apps);
const cookieParser = require("cookie");

const WebSocket = require("ws");
const { server } = require("./server");
const { EMPTY_STRING, DEFAULT_NAME } = require("./utils/constants");
const { getRandomRecipient } = require("./utils/getRandomRecipient");
const { handleOnClose } = require("./utils/handleOnClose");
const { User } = require("./utils/User");

// app.listen(port || 8081, () => console.log("app http listeinin at port " + port));
const wsServer = new WebSocket.Server({ server: server });

const clientsPool = new Map();
const availableClients = [];

wsServer.on("connection", (client, req) => {
  let userId = cookieParser.parse(req.headers.cookie).userId;
  if (clientsPool.has(userId)) {
    handleOnClose(userId, clientsPool, availableClients);
  }
  let user = new User(DEFAULT_NAME, userId, client, EMPTY_STRING);
  clientsPool.set(userId, user);
  availableClients.push(userId);
  console.log("Client Connected!");
  console.log(userId);

  if (availableClients.length >= 2) {
    console.log("user id when 2: " + userId);
    let recipient = clientsPool.get(getRandomRecipient(userId, clientsPool, availableClients));

    if (recipient != undefined) {
      //update opponent (or recipient) cookie in sender object
      user = new User(user.name, user.userId, user.client, recipient.userId);
      clientsPool.set(userId, user);

      //update opponent (or recipient) cookie in recipient object
      recipient = clientsPool.get(clientsPool.get(userId).recipientUserId);
      user = new User(recipient.name, recipient.userId, recipient.client, userId);
      clientsPool.set(recipient.userId, user);
      recipient.client.send(`${recipient.userId + "  " + userId}`);
    }

    console.log("getRado run...");
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
    console.log(cookieParser.parse(req.headers.cookie));
    userId = cookieParser.parse(req.headers.cookie).userId;
    // console.log(clientsPool.get(userId));
    console.log(clientsPool.get(userId) + "left...");
    handleOnClose(userId, clientsPool, availableClients);
  });
});
