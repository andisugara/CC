const { getArticles } = require("../model/articleModel");

const getArticlesCtrl = async (req, res) => {
  try {
    const articles = await getArticles();

    return res.status(200).json({
      message: "Daftar artikel berhasil diambil",
      articles,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message,
    });
  }
};

module.exports = { getArticlesCtrl };