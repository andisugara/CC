require('dotenv').config()

const { inputUser, updateProfil, getUserbyid } = require('../model/userModel')

const registerCtrl = async (req, res) => {
    const { fullname, birthdate, profile_img } = req.body;
    const user_id = res.locals.uid;
    const email = res.locals.email;
    const createdAt = new Date().toISOString();

    try {
        const existingUser = await getUserbyid(user_id);

        if (existingUser) {
            return res.status(400).json({
                error: true,
                message: 'User sudah terdaftar!'
            });
        }

        const newUser = {
            user_id: user_id,
            fullname: fullname,
            birthdate: birthdate,
            email: email,
            createdAt: createdAt,
            profile_img: profile_img || null
        }

        await inputUser(user_id, newUser);

        return res.status(200).json({
            error: false,
            message: 'Berhasil, Silahkan login!',
            user: newUser
        })

    } catch (e) {
        return res.status(500).json({
            error: true,
            message: e.message,
        });
    }
}

const loginCtrl = async (req, res) => {
    const user_id = res.locals.uid;

    try {
        const userSnapshot = await getUserbyid(user_id);

        if (!userSnapshot) {
            return res.status(404).json({
                error: true,
                message: 'Profil user tidak ditemukan!'
            })
        }

        return res.status(200).json({
            error: false,
            message: 'Login Berhasil !',
            user: userSnapshot
        })
    } catch (e) {
        return res.status(500).json({
            error: true,
            message: e.message,
        });
    }
}

const onLoginCtrl = (req, res) => {
    res.status(200).json({
        error: false,
        message: {
            uid: res.locals.uid,
            email: res.locals.email
        }
    });
}

const updateProfilCtrl = async (req, res) => {
    const user_id = req.params.id
    const ava = req.file ? req.file.cloudStoragePublicUrl : null
    const { fullname, email, birthdate } = req.body;

    try {
        const user = await getUserbyid(user_id);

        if (!user) {
            return res.status(404).json({
                error: true,
                message: 'User tidak ditemukan'
            });
        }

        const data = {
            user_id: user_id,
            birthdate: birthdate || user.birthdate,
            fullname: fullname || user.fullname,
            email: email || user.email,
            profile_img: ava || user.profile_img || null
        }

        await updateProfil(user_id, data)

        res.status(200).json({
            error: false,
            message: 'Data anda berhasil diubah',
            user: data
        });

    } catch (error) {
        res.status(404).json({
            error: true,
            message: error.message
        });
    }
}

const getUserbyidCtrl = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await getUserbyid(id);
        
        if (!user) {
            return res.status(404).json({
                message: 'User tidak ditemukan!'
            });
        }

        const data = {
            user_id: user.user_id,
            birthdate: user.birthdate,
            fullname: user.fullname,
            email: user.email,
            profile_img: user.profile_img
        }

        return res.status(200).json({
            message: 'Berhasil mengambil data user!',
            user_detail: data
        });
    } catch (e) {
        return res.status(500).json({
            message: e.message,
        });
    }
}

module.exports = { registerCtrl, loginCtrl, onLoginCtrl, updateProfilCtrl, getUserbyidCtrl }
