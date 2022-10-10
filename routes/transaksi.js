var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')

const db = require('../models');
const User = db.users;
const Transaksi = db.transaksis;
const Op = db.Sequelize.Op;

// Get history transaksi
router.get('/history', function (req, res, next) {
    Transaksi.findAll()
    .then(data => {
      res.render('historytransaksi', {
        title: 'History Transaksi',
        transaksis: data
      });
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message,
        transaksis: []
      });
    });
});

// tes post
router.post('/tambah', function (req, res, next) {

    var transaksi = {
        idUser: req.body.idUser,
        idTarget: req.body.idTarget,
        nominalSaldo: req.body.nominalSaldo,
        tanggal: req.body.tanggal,
        status: req.body.status
      }
    
      Transaksi.create(transaksi)
        .then(
            res.json({
                info: "Transaksi berhasil ditambahkan",
                transaksi: transaksi
            })
        )
        .catch(err => {
            res.json({
                info: "Error",
                message: err.message,
                transaksi: []
              })
        });
});

module.exports = router;