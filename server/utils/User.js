class User {
  constructor(name, userId, client, recipientUserId) {
    this.name = name;
    this.userId = userId;
    this.recipientUserId = recipientUserId;
    this.client = client;
  }
}

module.exports = { User };
