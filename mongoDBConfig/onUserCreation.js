/* eslint-disable */
// inputed manually into MongoDB web setup
// App Services -> App Users -> Custom User Data -> On User Creation
/*
  This function will run after a user is created and is called with an object representing that user.

  This function runs as a System user and has full access to Services, Functions, and MongoDB Data.

  Example below:

  exports = (user) => {
    // use collection that Custom User Data is configured on
    const collection = context.services.get("<SERVICE_NAME>").db("<DB_NAME>").collection("<COLL_NAME>");

    // insert custom data into collection, using the user id field that Custom User Data is configured on
    const doc = collection.insertOne({ <USER_ID_FIELD>: user.id, name: user.data.name });
  };
*/

exports = (user) => {
  const collection = context.services
    .get("mongodb-atlas")
    .db("breathe-easy-sync-dev")
    .collection("custom-user-data");

  try {
    collection.insertOne({
      user_id: user.id,
      expoPushToken: null,
      isBlocked: false,
    });
  } catch (err) {
    console.error(err);
  }
  return;
};
