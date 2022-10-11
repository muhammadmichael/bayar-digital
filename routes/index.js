var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')

const db = require('../models');
const { FLOAT } = require('sequelize');
const User = db.users;
const Transaksi = db.transaksis;
const Saldo = db.saldos;
const Op = db.Sequelize.Op;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
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

//Untuk Mendapatkan Form Top Up
router.get('/topup/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  User.findOne({
      include: [Saldo],
      where: {id: id}
  })
	.then(topup => {
		if(topup){
			//res.send(topup);
      	res.render('topUp', { 
        	title: 'Silahkan Top Up',
        	topup: topup,
          saldo: topup.saldo
      	});
		}else{
			res.json({
        info: "Data Tidak Ditemukan"
      })
		}	
	})
	.catch(err => {
		res.json({
      info: "Data Id Tidak Ada",
      err
    })
	});
});

//Untuk Update Jumlah Saldo
router.post('/topup/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var topup = parseFloat(req.body.saldo);

  Saldo.findByPk(id)
  .then(saldoLama => {
    var topupSaldo = parseFloat(saldoLama.nominalSaldo + topup);
    var nominalSaldo = {
      nominalSaldo: topupSaldo
    }

    //Sudah Menambahkan Saldo Lama dan Jumlah TopUp
    Saldo.update(nominalSaldo, {
      where: {id: id}
    })
    .then(saldoBaru => {
    var transaksi = {
      idUser: id,
      idTarget: null,
      nominalSaldo: topupSaldo,
      tanggal: Date(),
      status: "Debit"
    }
      //Membuat History Transaksi
      Transaksi.create(transaksi)
      .then(num => {
          res.json({
            saldoSekarang: nominalSaldo,
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
});

//Untuk Mendapatkan Form Transfer
router.get('/transfer/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  User.findOne({
      include: [Saldo],
      where: {id: id}
  })
  .then(transfer => {
    if(transfer){
      //res.send(transfer);
        res.render('transfer', {
          title: 'Silahkan Transfer',
          transfer: transfer,
          saldo: transfer.saldo
        });
    }else{
      res.json({
        info: "Data Tidak Ditemukan"
      })
    }
  })
  .catch(err => {
    res.json({
      info: "Data Id Tidak Ada",
      err
    })
  });
});

//Untuk Mendapatkan Form Transfer Saldo
router.get('/transfer_saldo/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  User.findOne({
      include: [Saldo],
      where: {id: id}
  })
  .then(transfer => {
    if(transfer){
      //res.send(transfer);
        res.render('transfer_saldo', {
          title: 'Silahkan Transfer',
          transfer: transfer,
          saldo: transfer.saldo
        });
    }else{
      res.json({
        info: "Data Tidak Ditemukan"
      })
    }
  })
  .catch(err => {
    res.json({
      info: "Data Id Tidak Ada",
      err
    })
  });
});

//Untuk Transfer Saldo
router.post('/transfer_saldo/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var idTarget = parseInt(req.body.idTarget);
  var nominalTransfer = parseFloat(req.body.nominalTransfer);

  if(idTarget != id && idTarget != null){
    User.findOne({
      include: [Saldo],
      where: {id: id}
    })
    .then(transfer => {
      Saldo.findByPk(id)
    .then(saldoLama => {
      if(saldoLama.nominalSaldo < nominalTransfer && saldoLama.nominalSaldo != 0){
        res.json({
          info: "Saldo Anda Tidak Mencukupi"
        })
      }else{
        var saldoSekarang = parseFloat(saldoLama.nominalSaldo - nominalTransfer);
        var nominalSaldo = {
          nominalSaldo: saldoSekarang
        }
        //Sudah Mengurangi Saldo Lama dan Jumlah Transfer
        Saldo.update(nominalSaldo, {
          where: {id: id}
        })
        .then(saldoBaru => {
          //Membuat History Transaksi
          //Untuk Menambahkan Saldo Target
          Saldo.findByPk(idTarget)
          .then(saldoTarget => {
            var saldoTargetSekarang = parseFloat(saldoTarget.nominalSaldo + nominalTransfer);
            var nominalSaldoTarget = {
              nominalSaldo: saldoTargetSekarang
            }
            //Sudah Menambahkan Saldo Target
            Saldo.update(nominalSaldoTarget, {
              where: {id: idTarget}
            })
            .then(saldoTargetBaru => {//Membuat History Transaksi
              var transaksi = {
                idUser: id,
                idTarget: idTarget,
                nominalSaldo: saldoSekarang,
                tanggal: Date(),
                status: "Debit"
              }
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
      }
  })
  .catch(err => {
    res.send(err);
  });
  })
    .catch(err => {
      res.send(err);
    });
  }else{
    res.json({
      info: "ID penerima tidak boleh sama dengan ID pengirim / kosong"
    })
  }
});

module.exports = router;
