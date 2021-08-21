const ws = new WebSocket("ws://localhost:8080");
const CONNECTED = "CONNECTED";
const WAIT = "WAIT";
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
  }
});

document.getElementById("nextBtn").addEventListener("click", function () {
  toggleElement("loader", "show");
  ws.send(createMessage(LEFT, "User left..."));
  ws.send(createMessage(NEXT, EMPTY_STRING));
});

function setChatItem(msg, sender) {
  let chatItem = document.createElement("div");
  chatItem.className = sender === "me" ? "chat-item border right" : "chat-item border left";
  let chatBox = document.getElementById("chatBox");
  let msgSpan = document.createElement("span");
  msgSpan.innerHTML = msg;
  let timeSpan = document.createElement("span");
  timeSpan.textContent = getTime();
  timeSpan.className = "time";
  chatItem.appendChild(msgSpan);
  chatItem.appendChild(timeSpan);
  chatBox.appendChild(chatItem);
  chatBox.scrollTop = chatBox.scrollHeight;
  if (sender === "me") {
    ws.send(createMessage(CHAT, msg));
  }
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
    switch (msgBody.type) {
      case WAIT: {
        toggleElement("loader", "hide");
        document.getElementById("userDesc").innerHTML = msgBody.msg;
        toggleElement("typingContainer", "hide");
        break;
      }

      case CONNECTED: {
        console.log("cncted rain");
        toggleElement("loader", "hide");
        document.getElementById("userDesc").innerHTML = "<i>Connected to <i/>" + "<b>" + msgBody.msg + "<b/>";
        toggleElement("typingContainer", "show");
        break;
      }

      case CHAT: {
        setChatItem(msgBody.msg);
        break;
      }
      case LEFT: {
        toggleElement("loader", "hide");
        toggleElement("typingContainer", "hide");
        toggleElement("info", "show", msgBody.msg);
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
