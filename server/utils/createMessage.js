function createMessage(type, msg) {
  let message = {
    t: type,
    m: msg,
  };
  return JSON.stringify(message);
}

module.exports = { createMessage };
