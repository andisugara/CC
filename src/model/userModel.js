const {Firestore} = require("@google-cloud/firestore");
const db = new Firestore();

async function inputUser(id, data) {
  const usersCollection = db.collection("users");
  return usersCollection.doc(id).set(data);
}

async function getUsers(email) {
  try {
    const usersRef = await db.collection("users");
    const userSnapshot = await usersRef.where("email", "==", email).get();

    if (userSnapshot.empty) {
      return null; // Tidak ada pengguna dengan email ini
    }

    let data = null;
    userSnapshot.forEach((item) => {
        data = item.data();
    });

    return data;

  } catch (error) {
    throw new Error(error.message);
  }
}


async function updateProfil(id, newData) {
  const userRef = await db.collection("users").doc(id);

  if (newData.profile_img === undefined) {
    throw new Error("avatar kosong");
  }

  await userRef.update(newData);
}

async function getUserbyid(user_id){
  try {
    const userDoc = await db.collection("users").doc(user_id).get();
    if (!userDoc.exists) {
      return null;
    }
    return userDoc.data();
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = { inputUser, getUsers, updateProfil, getUserbyid };