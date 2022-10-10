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
      info: "Data Id Tidak Ada"
    })
	});
});

router.post('/topup/:id', function(req, res, next) {
  var id = parseInt(req.params.id);
  var topup = parseFloat(req.body.saldo);

  Saldo.findByPk(id)
  .then(saldoLama => {
    var topupSaldo = parseFloat(saldoLama.nominalSaldo + topup);
    var nominalSaldo = {
      nominalSaldo: topupSaldo
    }
    Saldo.update(nominalSaldo, {
      where: {id: id}
    })
    .then(num => {
        res.json({
          saldoSekarang: nominalSaldo
        })
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
