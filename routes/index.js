var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')

const db = require('../models');
const User = db.users;
const Op = db.Sequelize.Op;

const Transaksi = db.transaksis;
const Saldo = db.saldos;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('transfer', { title: 'bebas' });
});


/* GET home page. */
router.get('/transfer', function(req, res, next) {
  
  res.render('transfer', { title: 'transfer' });
});

// REGISTER
// POST
router.post('/register', function (req, res, next) {
  var hash = bcrypt.hashSync(req.body.password, 8);

  var user = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: hash,
  }

  User.create(user)
    .then(
      res.json({
        info: "User Berhasil Ditambahkan"
      })
    )
    .catch(err => {
      res.json({
        info: "User Gagal Ditambahkan"
      })
    });

});

//transfer
router.post('/transfer/:id/:target', function(req, res, next) {
  var id = parseInt(req.params.id);
  var target = parseInt(req.params.target);
  // var idUser = parseFloat(req.body.idUser);
  // var idTarget = parseFloat(req.body.idTarget);
  var nominalTransfer = parseFloat(req.body.nominalSaldo);

  // Saldo.findAll({where: {userId: idUser}})
  Saldo.findByPk(id)
  .then(saldoLama => {
    var sisaSaldo = parseFloat(saldoLama.nominalSaldo - nominalTransfer);
    var nominalSaldo = {
      nominalSaldo: sisaSaldo
    }

    //Sudah Mengurangi Saldo Lama 
    Saldo.update(nominalSaldo, {
      // where: {userId: idUser}
      where: {id: id}
    })
    .then(saldoBaru => {
    var transaksi = {
      idUser: id,
      idTarget: target,
      nominalSaldo: nominalTransfer,
      tanggal: Date(),
      status: "transfer sukses"
    }
      //Membuat History Transaksi
      Transaksi.create(transaksi)
      .then(num => {

        // NAMBAH SALDO TARGET
        // Saldo.findAll({where: {userId: idUser}})
        Saldo.findByPk(target)
        .then(saldoLama => {
          var sisaSaldo = parseFloat(saldoLama.nominalSaldo + nominalTransfer);
          var nominalSaldo = {
            nominalSaldo: sisaSaldo
          }

          //Sudah Mengurangi Saldo Lama 
          Saldo.update(nominalSaldo, {
            // where: {userId: idUser}
            where: {id: target}
          })
          .then(saldoBaru => {
            res.json({
              saldoSekarang: sisaSaldo,
              // saldoSekarang: nominalSaldo,
              status: num.status
            })
          })
          .catch(err => {
            res.send(err);
          });
          
        })
        .catch(err => {
          res.send(err);
        });

      })
      .catch(err => {
          res.send(err);
      });
    })
    .catch(err => {
      res.send(err);
    });
  })
  .catch(err => {
    res.send(err);
  });
  
});

module.exports = router;
