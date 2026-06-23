const crypto = require('crypto');
require("dotenv").config();

const { createJournal, getAllJournals, getJournalById, getLatestJournal, getWeekLatestJournal } = require("../model/journalModel");
const { default: axios } = require('axios');

const createJournalCtrl = async (req, res) => {
    const { user_id, waktu_belajar, waktu_belajar_tambahan, waktu_tidur, aktivitas_sosial, aktivitas_fisik, jurnal_harian } = req.body

    if (isNaN(parseFloat(waktu_belajar)) || isNaN(parseFloat(waktu_belajar_tambahan)) || isNaN(parseFloat(waktu_tidur)) || isNaN(parseFloat(aktivitas_sosial)) || isNaN(parseFloat(aktivitas_fisik))) {
        return res.status(400).json({ message: 'Input waktu dan aktivitas harus berupa angka!' });
    }

    const totalWaktu = parseFloat(waktu_belajar) + parseFloat(waktu_belajar_tambahan) + parseFloat(waktu_tidur) + parseFloat(aktivitas_sosial) + parseFloat(aktivitas_fisik);
    if (totalWaktu > 24) {
        return res.status(400).json({
            error: true,
            message: "Jam total lebih dari 24 jam."
        });
    }
    if (totalWaktu < 24) {
        return res.status(400).json({
            error: true,
            message: "Jam total kurang dari 24 jam."
        });
    }

    const journal_id = crypto.randomUUID()
    const createdAt = new Date().toISOString();

    const newJournal = {
        journal_id: journal_id,
        user_id: user_id,
        waktu_belajar: parseFloat(waktu_belajar),
        waktu_belajar_tambahan: parseFloat(waktu_belajar_tambahan),
        waktu_tidur: parseFloat(waktu_tidur),
        aktivitas_sosial: parseFloat(aktivitas_sosial),
        aktivitas_fisik: parseFloat(aktivitas_fisik),
        jurnal_harian: jurnal_harian,
        created: createdAt
    }

    if (!newJournal) {
        return res.status(404).json ({
            error: true,
            message: "harap diisi yang lengkap ya !"
        })
    } 

    try {
        // Panggil API ML untuk mendapatkan prediksi
        const predict = await axios.post(`${process.env.ML_API}`, {
            waktu_belajar: parseFloat(waktu_belajar),
            waktu_belajar_tambahan: parseFloat(waktu_belajar_tambahan),
            waktu_tidur: parseFloat(waktu_tidur),
            aktivitas_sosial: parseFloat(aktivitas_sosial),
            aktivitas_fisik: parseFloat(aktivitas_fisik),
            jurnal_harian: jurnal_harian
        }, {
            headers: {
                'Content-Type': 'application/json',  
            }
        })

        const fullJournal = {
            ...newJournal,
            predict: predict.data
        }

        console.log(fullJournal)

            await createJournal(journal_id, fullJournal)
            return res.status(200).json ({
                error: false,
                message: "journal telah dibuat",
                journal: fullJournal
            })
    } catch(e) {
        return res.status(500).json({
            error: true,
            message: 'Gagal membuat journal: ' + e.message,
        });
    }
}

const getAllJournalsCtrl = async (req, res) => {
    const { id } = req.params

    try {
        const journals = await getAllJournals(id);

        return res.status(200).json({
            message: 'Semua journal berhasil ditampilkan!',
            journals: journals
        });
    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

const getLatestJournalCtrl = async (req, res) => {
    const { id } = req.params;

    try {
        const lastjournal = await getLatestJournal(id);
        console.log(lastjournal)

        if (!lastjournal) {
            return res.status(404).json({
                message: 'Journal terakhir tidak ditemukan!'
            })
        }

        return res.status(200).json({
            message: 'Journal terakhir telah ditampilkan!',
            journal: lastjournal
        })
    } catch(e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

const getWeekLatestJournalCtrl = async (req, res) => {
    const { id } = req.params;

    try {
        const lastjournal = await getWeekLatestJournal(id);
        console.log(lastjournal)

        if (!lastjournal) {
            return res.status(404).json({
                message: 'Journal terakhir tidak ditemukan!'
            })
        }

        return res.status(200).json({
            message: 'Journal terakhir telah ditampilkan!',
            journal: lastjournal
        })
    } catch(e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

const getJournalByIdCtrl = async (req, res) => {
    const { id } = req.params;

    try {
        const journal = await getJournalById(id);

        if (!journal) {
            return res.status(404).json({
                message: 'Journal tidak ditemukan!'
            })
        }

        return res.status(200).json({
            message: 'Journal ditemukan!',
            journal: journal
        })
    } catch(e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

module.exports = { createJournalCtrl, getAllJournalsCtrl, getJournalByIdCtrl, getLatestJournalCtrl, getWeekLatestJournalCtrl }