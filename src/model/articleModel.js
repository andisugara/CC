const { Firestore } = require("@google-cloud/firestore");
const db = new Firestore();

async function getArticles() {
  const articlesSnapshot = await db.collection("articles").get();
  const articles = [];

  articlesSnapshot.forEach((doc) => {
    const data = doc.data();
    articles.push({
      id: data.id ?? doc.id,
      ...data,
    });
  });

  return articles;
}

module.exports = { getArticles };