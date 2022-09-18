const WebSocket = require("ws");
const { server } = require("./server");
const { EMPTY_STRING, LEFT, PONG, NEXT, CHAT, PING, INIT, CONNECTED, TYPING, ERROR } = require("./utils/constants");

const { User } = require("./utils/User");
const { createMessage } = require("./utils/createMessage");
const { use } = require("express/lib/router");

const wsServer = new WebSocket.Server({ server: server });

const clientsPool = new Map();
const availableClients = new Set();

wsServer.on("connection", (client, req) => {
  try {
    client.send(`${createMessage(INIT)}`);
    // console.log("connected!!!!");
    // console.log("COOKIE_DATA: ");
    // console.log(req.headers.cookie);

    client.on("message", function incoming(msg) {
      // userId = cookieParser.parse(req.headers.cookie).userId;
      // let sender = clientsPool.get(userId);

      try {
        let message = JSON.parse(`${msg}`);
        console.log(message);
        let userId = message.ui;
        let name = message.cn;
        let user = clientsPool.get(userId) ? clientsPool.get(userId) : new User(name, userId, client);

        switch (message.t) {
          case INIT: {
            client.userId = userId;
            clientsPool.set(userId, user);
            availableClients.add(userId);
            if (availableClients.size > 1) {
              pairConnect(user);
            }
            break;
          }
          case CHAT: {
            let recipient = clientsPool.get(user.recipientUserId);
            recipient.client.send(`${createMessage(CHAT, message.m)}`);
            break;
          }

          case NEXT: {
            if (user.recipientUserId !== undefined) {
              /**
               * 1. notify receipient (other user)
               * 2. remove 'send to' of both user
               */
              let recipient = clientsPool.get(user.recipientUserId);
              if (recipient !== undefined) {
                recipient.client.send(`${createMessage(LEFT, "User you were talking to has left...")}`);
                clientsPool.set(recipient.userId, new User(recipient.name, recipient.userId, recipient.client));
              }
              clientsPool.set(user.userId, new User(user.name, user.userId, user.client));
            }
            availableClients.add(user.userId);
            if (availableClients.size > 1) {
              pairConnect(user);
            }
            break;
          }

          case LEFT: {
            handleOnUserLeft(user);
            break;
          }

          case TYPING: {
            let recipient = clientsPool.get(user.recipientUserId);
            recipient.client.send(`${createMessage(TYPING)}`);
            break;
          }
          case PING: {
            client.send(`${createMessage(PONG)}`);
            break;
          }
        }
      } catch (error) {
        console.log(req.headers.cookie + "," + req.headers.host + "," + req.headers.origin + ":", error);
        client.send(`${createMessage(ERROR, EMPTY_STRING)}`);
        if (clientsPool.get(client.userId).recipientUserId !== undefined) {
          let recipient = clientsPool.get(clientsPool.get(client.userId).recipientUserId);
          if (recipient !== undefined) {
            recipient.client.send(`${createMessage(ERROR, EMPTY_STRING)}`);
          }
        }
      }
    });

    client.on("close", function () {
      let sender = clientsPool.get(client.userId);
      if (sender !== undefined) {
        let recipient = clientsPool.get(sender.recipientUserId);
        if (recipient !== undefined) {
          clientsPool.set(recipient.userId, new User(recipient.name, recipient.userId, recipient.client));
          recipient.client.send(`${createMessage(LEFT, "User you were talking to has left...")}`);
        }
        clientsPool.delete(sender.userId);
      }
    });
  } catch (error) {
    console.log(error);
  }
});

function pairConnect(sender) {
  if (availableClients.size <= 1) return;

  let recipientId;
  for (let item of availableClients) {
    if (item !== sender.userId) {
      recipientId = item;
      availableClients.delete(item);
      availableClients.delete(sender.userId);
      break;
    }
  }
  let recipient = clientsPool.get(recipientId);
  if (recipient !== undefined) {
    clientsPool.set(recipientId, new User(recipient.name, recipient.userId, recipient.client, sender.userId));
    clientsPool.set(sender.userId, new User(sender.name, sender.userId, sender.client, recipientId));
    recipient.client.send(`${createMessage(CONNECTED, sender.name)}`);
    sender.client.send(`${createMessage(CONNECTED, recipient.name)}`);
  }
}

function handleOnUserLeft(sender) {
  if (sender.recipientUserId !== undefined) {
    let recipient = clientsPool.get(sender.recipientUserId);
    if (recipient !== undefined) {
      recipient.client.send(`${createMessage(LEFT, "User you were talking to has left...")}`);
    }
    clientsPool.set(recipient.userId, new User(recipient.name, recipient.userId, recipient.client));
  }
}
