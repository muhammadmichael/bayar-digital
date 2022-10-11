var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')

const db = require('../models');
const transaksi = require('../models/transaksi');
const User = db.users;
const Transaksi = db.transaksis;
const Op = db.Sequelize.Op;

// Get history transaksi
router.get('/history', function (req, res, next) {

    var usernameList = []
    var targetIdList = []
    // const userNameList = Transaksi.findAll();
    // console.log(userNameList);

    // let kosong = []
    // async function getTransaksi() {
    //     return await Transaksi.findAll;
    //   }
    // kosong = getTransaksi();
    // console.log(kosong)

    Transaksi.findAll()
    .then(transaksi => {
        
    // // TODO.
    //     transaksi.forEach( 
    //         (item) => {
    //             // Simpan id user ke userIdList sebagai usernamenya
    //             User.findByPk(item.dataValues.idUser)
    //             .then(user => {
    //                 usernameList.push(user.dataValues.username);

    //                 // Simpan id user target ke targetIdList sebagai usernamenya
    //                 // if (item.dataValues.idTarget != null) {
    //                 //     User.findByPk(transaksi.dataValues.idTarget)
    //                 //     .then(user => {
    //                 //         targetIdList.push(user.dataValues.id);
    //                 //         console.log(userIdList);
    //                 //         console.log(targetIdList);
    //                 //     })
    //                 // } else {
    //                 //     targetIdList.push(null);
    //                 // }
    //                 console.log(usernameList)
    //                     res.render('historytransaksi', {
    //                         title: 'History Transaksi',
    //                         transaksis: transaksi,
    //                         usernameList: usernameList,
    //                     });
                    
    //             })
                
    //         }
    //       );

          res.render('historytransaksi', {
            title: 'History Transaksi',
            transaksis: transaksi
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