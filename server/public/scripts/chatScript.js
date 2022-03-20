var ws;
if (screen.width > 1000) {
  ws = new WebSocket("ws://localhost:8080");
} else {
  ws = new WebSocket("ws://192.168.43.238:8080");
}

const CONNECTED = "CONNECTED";
const ERROR = "ERROR";
const CHAT = "CHAT";
const NEXT = "NEXT";
const LEFT = "LEFT";
const EMPTY_STRING = "";

document.getElementById("sendBtn").addEventListener("click", function () {
  let inputBox = document.getElementById("inputBox");
  let msg = inputBox.textContent.trim() !== EMPTY_STRING ? removeUnwantedLines(inputBox) : EMPTY_STRING;
  inputBox.innerHTML = EMPTY_STRING;
  inputBox.focus();

  if (msg !== EMPTY_STRING) {
    setChatItem(msg, "me");
    ws.send(createMessage(CHAT, msg));
  }
  let chatBox = document.getElementById("chatBox");
  chatBox.scrollTop = chatBox.scrollHeight;
});
document.getElementById("homeBtn").addEventListener("click", function () {
  ws.close();
  window.history.back();
});
document.getElementById("nextBtn").addEventListener("click", function () {
  toggleElement("chatItemContainer", "hide");
  toggleElement("loader", "show");
  toggleElement("userDesc", "show", EMPTY_STRING);
  toggleElement("info", "hide");
  toggleElement("typingContainer", "hide");
  resetChatContainer();
  ws.send(createMessage(NEXT, EMPTY_STRING));
});

function setChatItem(msg, sender) {
  let chatItemContainer = document.getElementById("chatItemContainer");
  let chatItem = document.createElement("div");
  chatItem.className = sender === "me" ? "chat-item border right" : "chat-item border left";
  let msgSpan = document.createElement("span");
  msgSpan.innerHTML = msg;
  let timeSpan = document.createElement("span");
  timeSpan.textContent = getTime();
  timeSpan.className = "time";
  chatItem.appendChild(msgSpan);
  chatItem.appendChild(timeSpan);
  chatItemContainer.appendChild(chatItem);
}

function getTime() {
  let date = new Date();
  let hours = date.getHours();
  let meridian = hours < 12 ? "am" : "pm";
  if (hours == 0) {
    hours += 12;
  } else {
    if (hours > 12) {
      hours = hours % 12;
    }
  }

  let minutes = date.getMinutes();
  if (minutes.length < 2) {
    minutes = "0" + minutes;
  }

  return hours + ":" + minutes + " " + meridian;
}

function removeUnwantedLines(node) {
  let msgHtml = EMPTY_STRING;
  let children = [].slice.call(node.childNodes);
  var start = 0,
    end = children.length;
  while (children[start].textContent === EMPTY_STRING) {
    console.log(children[start]);
    start++;
  }
  for (let i = children.length - 1; i >= 0; i--) {
    if (children[i].textContent !== EMPTY_STRING) {
      break;
    }
    end--;
  }
  children = children.slice(start, end);
  for (let i = 0; i < children.length; i++) {
    console.log(children[i].nodename);
    if (children[i].outerHTML === undefined) {
      msgHtml += children[i].textContent;
    } else {
      msgHtml += children[i].outerHTML;
    }
  }

  return msgHtml;
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return EMPTY_STRING;
}

function WSConnection() {
  console.log("WS ran...");

  ws.onopen = () => {
    console.log("connection opend!");
  };
  ws.onmessage = (data) => {
    let msgBody = JSON.parse(data.data);
    console.log(msgBody);
    switch (msgBody.type) {
      case ERROR: {
        toggleElement("loader", "hide");
        document.getElementById("userDesc").innerHTML = EMPTY_STRING;
        toggleElement("typingContainer", "hide");
        window.history.back();
        break;
      }

      case CONNECTED: {
        console.log("connected!!");
        toggleElement("loader", "hide");
        toggleElement("info", "hide");
        document.getElementById("userDesc").innerHTML = "<i>Connected to <i/>" + "<b>" + msgBody.msg + "<b/>";
        resetChatContainer();
        toggleElement("chatItemContainer", "show");
        toggleElement("typingContainer", "show");
        break;
      }

      case CHAT: {
        toggleElement("info", "hide");
        setChatItem(msgBody.msg);
        let chatBox = document.getElementById("chatBox");
        chatBox.scrollTop = chatBox.scrollHeight;
        break;
      }
      case LEFT: {
        toggleElement("loader", "hide");
        toggleElement("typingContainer", "hide");
        toggleElement("info", "show", msgBody.msg);
        let chatBox = document.getElementById("chatBox");
        chatBox.scrollTop = chatBox.scrollHeight;
        break;
      }
    }
    console.log(data.data);
  };
}

function toggleElement(id, flag, string) {
  let element = document.getElementById(id);
  if (flag === "show") {
    element.style.visibility = "visible";
    if (string !== undefined) {
      element.innerHTML = string;
    }
  } else if (flag === "hide") {
    element.style.visibility = "hidden";
  }
}

function createMessage(type, msg) {
  let message = {
    type: type,
    msg: msg,
  };
  return JSON.stringify(message);
}

function resetChatContainer() {
  let chatItemContainer = document.getElementById("chatItemContainer");
  chatItemContainer.innerHTML = EMPTY_STRING;
}
