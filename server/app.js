const cookieParser = require("cookie");

const WebSocket = require("ws");
const { server } = require("./server");
const { EMPTY_STRING, LEFT, WAIT, NEXT, CHAT, INFO, CONNECTED, ERROR } = require("./utils/constants");

const { User } = require("./utils/User");
const { createMessage } = require("./utils/createMessage");
const { use } = require("express/lib/application");
const { send } = require("express/lib/response");

var fs = require("fs");
var util = require("util");
var log_file = fs.createWriteStream(__dirname + "/debug.log", { flags: "a" });
var log_stdout = process.stdout;

console.log = function (d) {
  //
  log_file.write(util.format(d) + "\n");
  log_stdout.write(util.format(d) + "\n");
};

const wsServer = new WebSocket.Server({ server: server });

const clientsPool = new Map();
const availableClients = new Set();

wsServer.on("connection", (client, req) => {
  let userId = cookieParser.parse(req.headers.cookie).userId;
  let name = cookieParser.parse(req.headers.cookie).name;
  let user = new User(name, userId, client);
  clientsPool.set(userId, user);
  availableClients.add(userId);
  if (availableClients.size > 1) {
    pairConnect(user);
  }
  client.on("message", function incoming(msg) {
    userId = cookieParser.parse(req.headers.cookie).userId;
    let sender = clientsPool.get(userId);
    try {
      let message = JSON.parse(`${msg}`);

      switch (message.type) {
        case CHAT: {
          let recipient = clientsPool.get(sender.recipientUserId);
          recipient.client.send(`${createMessage(CHAT, message.msg)}`);
          break;
        }

        case NEXT: {
          if (sender.recipientUserId !== undefined) {
            /**
             * 1. notify receipient (other user)
             * 2. remove 'send to' of both user
             */
            let recipient = clientsPool.get(sender.recipientUserId);
            if (recipient !== undefined) {
              recipient.client.send(`${createMessage(LEFT, "User you were talking to has left...")}`);
              clientsPool.set(recipient.userId, new User(recipient.name, recipient.userId, recipient.client));
            }
            clientsPool.set(sender.userId, new User(sender.name, sender.userId, sender.client));
          }
          availableClients.add(sender.userId);
          if (availableClients.size > 1) {
            pairConnect(sender);
          }
          break;
        }

        case LEFT: {
          handleOnUserLeft(sender);
          break;
        }
      }
    } catch (error) {
      console.log(req.headers.cookie + "," + req.headers.host + "," + req.headers.origin + ":", error);
      sender.client.send(`${createMessage(ERROR, EMPTY_STRING)}`);
      if (sender.recipientUserId !== undefined) {
        let recipient = clientsPool.get(sender.recipientUserId);
        if (recipient !== undefined) {
          recipient.client.send(`${createMessage(ERROR, EMPTY_STRING)}`);
        }
      }
    }
  });

  client.on("close", function () {
    userId = cookieParser.parse(req.headers.cookie).userId;
    let sender = clientsPool.get(userId);
    if (sender !== undefined) {
      let recipient = clientsPool.get(sender.recipientUserId);
      if (recipient !== undefined) {
        clientsPool.set(recipient.userId, new User(recipient.name, recipient.userId, recipient.client));
        recipient.client.send(`${createMessage(LEFT, "User you were talking to has left...")}`);
      }
    }
    clientsPool.delete(userId);
  });
});

function pairConnect(sender) {
  if (availableClients.size > 1) {
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
}
``;

function handleOnUserLeft(sender) {
  if (sender.recipientUserId !== undefined) {
    let recipient = clientsPool.get(sender.recipientUserId);
    if (recipient !== undefined) {
      recipient.client.send(`${createMessage(LEFT, "User you were talking to has left...")}`);
    }
    clientsPool.set(recipient.userId, new User(recipient.name, recipient.userId, recipient.client));
  }
}
