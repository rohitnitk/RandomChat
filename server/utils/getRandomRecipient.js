/**
 * This method choose a random client as recipient
 * Tries to find for 10 times
 * returns null if not found
 *
 * @param {*} userId
 * @param {*} clientsPool
 * @param {*} availableClients
 * @returns recipient
 */

function getRandomRecipient(userId, clientsPool, availableClients) {
  // Check to see if the counter has been initialized
  if (typeof getRandomRecipient.counter == "undefined") {
    // It has not... perform the initialization
    getRandomRecipient.counter = 1;
  }

  let opponent_index = Math.floor(Math.random() * availableClients.length);
  let recipientUserId = availableClients[opponent_index];

  if (JSON.stringify(userId) !== JSON.stringify(recipientUserId)) {
    availableClients.splice(opponent_index, 1);
    availableClients.splice(availableClients.indexOf(userId));
    //console.log(opponent_cookie)
    return recipientUserId;
  }

  if (getRandomRecipient.counter > 10) {
    recipientUserId = null;
    //   console.log(opponent_cookie)
    return recipientUserId;
  }

  // increment counter before finding again the random client
  getRandomRecipient.counter++;
  return getRandomRecipient(userId, clientsPool, availableClients);
}

module.exports = { getRandomRecipient };
