function createMessage(type, msg) {
  let message = {
    type: type,
    msg: msg,
  };
  return JSON.stringify(message);
}

module.exports = { createMessage };
