const crypto = require('crypto');
require('dotenv').config()

const { generateAccessToken } = require('../middleware/authToken');
const { inputUser, getUsers, updateProfil, getUserbyid } = require('../model/userModel')
const { encrypt, decrypt } = require('../utils/crypt')

const registerCtrl = async (req, res) => {
    const { fullname, password, confirmPass, birthdate, email, profile_img } = req.body;
    // const profile_img = req.file.cloudStoragePublicUrl;
    const user_id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    if (password !== confirmPass) {
        return res.status(400).json({
            error: true,
            message: 'Password tidak cocok!'
        });
    }

    const existingUser = await getUsers(email);

    if (existingUser) {
      return res.status(400).json({
        error: true,
        message: 'Email sudah ada'
      });
    }

    const encryptedPassword = encrypt(password);
    const newUser = {
        user_id: user_id,
        fullname: fullname,
        birthdate: birthdate,
        email: email,
        password: 
        encryptedPassword,
        createdAt: createdAt,
        profile_img: profile_img
    }
    try {
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
    const { email, password } = req.body

    const userSnapshot = await getUsers(email);

   if (!userSnapshot) { // ✅ ganti dari userSnapshot.empty
        return res.status(404).json({
            error: true,
            message: 'Email atau Password salah!'
        })
    }

    const checkPassword = decrypt(userSnapshot.password)

    if (password !== checkPassword) {
        return res.status(404).json({
            error: true,
            message: 'Email atau Password salah!'
        })
    }

    console.log(userSnapshot.email)

    userSnapshot.token = generateAccessToken(email);

    return res.status(200).json({
        error: false,
        message: 'Login Berhasil !',
        user: userSnapshot
    })
}

const onLoginCtrl = (req, res) => {
    const data = res.locals.jwt;

    res.status(200).json({
        error: false,
        message: data
    });
}

const updateProfilCtrl = async (req, res) => {
    const user_id = req.params.id
    const ava = req.file.cloudStoragePublicUrl
    const { fullname, email, password, birthdate } = req.body;

    try {
        const user = await getUserbyid(user_id);

        const data = {
            user_id: user_id,
            birthdate: birthdate || user.birthdate,
            fullname: fullname || user.fullname,
            email: email || user.email,
            password: password || 
            user.password,
            profile_img: ava || user.profile_img
        }

        if (password) {
            const encryptedPassword = encrypt(data.password);
            data.password = encryptedPassword; 
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
        
        const decryptedPass = decrypt(user.password)

        const data = {
            user_id: user.user_id,
            birthdate: user.birthdate,
            fullname: user.fullname,
            email: user.email,
            password: 
            decryptedPass,
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
