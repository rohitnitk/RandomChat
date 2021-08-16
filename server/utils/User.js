class User {
  constructor(name, userId, client, recipientUserId) {
    this.name = name;
    this.userId = userId;
    this.recipientUserId = recipientUserId;
    this.client = client;
    console.log("User class run : " + this);
  }
}

module.exports = { User };
