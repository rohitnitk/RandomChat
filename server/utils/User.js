class User {
  constructor(name, userId, client, recipientUserId) {
    this.name = name;
    this.userId = userId;
    this.client = client;
    this.recipientUserId = recipientUserId;
  }
}

module.exports = { User };
