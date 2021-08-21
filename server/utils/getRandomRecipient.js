/**
 * This method choose a random client as recipient
 * Tries to find for 10 times
 * returns null if not found
 *
 * @param {*} userId
 * @param {*} clientsPool
 * @param {*} availableClients
 * @returns {*} recipientUserId
 */

function getRandomRecipient(userId, clientsPool, availableClients) {
  let opponent_index = Math.floor(Math.random() * availableClients.length);
  let recipientUserId = availableClients[opponent_index];

  if (JSON.stringify(userId) !== JSON.stringify(recipientUserId)) {
    availableClients.splice(opponent_index, 1);
    availableClients.splice(availableClients.indexOf(userId));
    //console.log(opponent_cookie)
    return recipientUserId;
  }

  return null;
}

module.exports = { getRandomRecipient };
