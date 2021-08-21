const cookieParser = require("cookie");

const WebSocket = require("ws");
const { server } = require("./server");
const { EMPTY_STRING, LEFT, WAIT, NEXT, CHAT, INFO } = require("./utils/constants");
const { handleNewChatRequest } = require("./utils/handleNewChatRequest");
const { handleOnClose } = require("./utils/handleOnClose");
const { User } = require("./utils/User");
const { createMessage } = require("./utils/createMessage");
const { handleOnLeft } = require("./utils/handleOnLeft");

const wsServer = new WebSocket.Server({ server: server });

const clientsPool = new Map();
const availableClients = [];

wsServer.on("connection", (client, req) => {
  console.log("Client Connected!");
  let userId = cookieParser.parse(req.headers.cookie).userId;
  let name = cookieParser.parse(req.headers.cookie).name;
  if (clientsPool.has(userId)) {
    handleOnClose(userId, clientsPool, availableClients);
  }
  let user = new User(name, userId, client, EMPTY_STRING);
  clientsPool.set(userId, user);
  availableClients.push(userId);
  () => {
    let seconds = 0;
    let fn = setInterval(() => {
      if (handleNewChatRequest(userId, req, client, clientsPool, availableClients) || seconds > 5000) {
        clearTimeout(fn);
      }
      seconds += 10;
    }, 10);
  };
  client.on("message", function incoming(msg) {
    console.log("received: %s", msg);
    userId = cookieParser.parse(req.headers.cookie).userId;
    let recipientUserId = clientsPool.get(userId).recipientUserId;
    if (recipientUserId !== EMPTY_STRING) {
      let recipient = clientsPool.get(recipientUserId);

      let message = JSON.parse(msg);

      switch (message.type) {
        case LEFT: {
          handleOnLeft(cookieParser.parse(req.headers.cookie).userId, clientsPool, availableClients);
          recipient.client.send(`${createMessage(LEFT, message.msg)}`);
          break;
        }
        case NEXT: {
          availableClients.push(userId);
          () => {
            let seconds = 0;
            let fn = setInterval(() => {
              if (handleNewChatRequest(userId, req, client, clientsPool, availableClients) || seconds > 5000) {
                clearTimeout(fn);
              }
              seconds += 10;
            }, 10);
          };
          break;
        }
        case CHAT: {
          recipient.client.send(`${createMessage(CHAT, message.msg)}`);
          break;
        }
        default: {
          client.send(`${createMessage(INFO, "Please do not tamper with site..")}`);
        }
      }
    } else {
      client.send(`${createMessage("WAIT", "Nobody is available to chat...Or The User you were talking to left...")}`);
    }
  });

  client.on("close", function () {
    userId = cookieParser.parse(req.headers.cookie).userId;

    if (clientsPool.has(userId)) {
      handleOnClose(userId, clientsPool, availableClients);
    }
  });
});
