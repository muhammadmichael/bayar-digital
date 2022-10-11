var express = require('express');
var router = express.Router();
var bcrypt = require('bcryptjs')

const auth = require('../auth')
const db = require('../models');
const { FLOAT } = require('sequelize');
const User = db.users;
const Transaksi = db.transaksis;
const Saldo = db.saldos;
const Op = db.Sequelize.Op;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express Start',
  })
})

router.get('/valid/:id', function(req, res, next) {

    var id = parseInt(req.params.id);
    Saldo.findOne({
      include: [User],
      where: {iduser: id}
    })
      .then(data => {
        let user = data.user;
        res.render('index', {
          title: 'Selamat Datang ' + user.name,
          saldo: data
        })
      })
      .catch(err => {
        res.send(err)
      });
});

// REGISTER
// Create a user
// GET
router.get('/register', function (req, res, next) {
  res.render('register', { title: 'Register' });
});

// POST
router.post('/register', function (req, res, next) {
  var hash = bcrypt.hashSync(req.body.password, 8);

  var user = {
    name: req.body.name,
    email: req.body.email,
    username: req.body.username,
    password: hash,
  }

  // Create user dan juga saldo dengan nominal 0
  Saldo.create({
    nominalSaldo: 0,
    user
  }, {
    include: [User]
  })
    .then(
      res.redirect('/login')
    )
    .catch(err => {
      res.redirect('/login')
    });
});

// Login
// GET
router.get('/login', function (req, res, next) {
  res.render('loginform', { title: 'Login' });
});

// POST
router.post('/login', function (req, res, next) {
  User.findOne({ where: { username: req.body.username } })
    .then(data => {
      if (data) {
        var loginValid = bcrypt.compareSync(req.body.password, data.password);
        if (loginValid) {
          // simpan session
          req.session.username = req.body.username;
          req.session.islogin = true;

          res.redirect('/valid/'+ data.id);
        } else {
          res.redirect('/login')
        }
      } else {
        res.redirect('/login')
      }
    })
    .catch(err => {
      res.json({
        info: "Error",
        message: err.message
      });
    });

});

// Logout
router.get('/logout', function (req, res, next) {
  req.session.destroy();
  res.redirect('/login');
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
      status: "Top Up"
    }
      //Membuat History Transaksi
      Transaksi.create(transaksi)
      .then(num => {
          // res.json({
          //   saldoSekarang: nominalSaldo,
          //   status: num.status
          // })
          // res.send(num)
          res.redirect('/valid/'+ num.idUser);
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

// Get history transaksi
router.get('/history/:id', function (req, res, next) {

  var id = req.params.id;

    Transaksi.findAll({
      where: {
        [Op.or]: [{idUser: id}, {idTarget: id}]
      },
      include: [
        {
          // include array user pengirim, Foreign Key: idUser
          model: User,
          as: 'pengirim',
        },
        {
          // include array user penerima, Foreign Key: idTarget
          model: User,
          as: 'target'
        }
    ],
    })
    .then(transaksi => {
      res.render('historytransaksi', {
        title: 'History Transaksi',
        transaksis: transaksi,
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

router.get('/transfersaldo/:id', function(req, res, next) {
  
  res.render('transferSaldo', {
    title: 'Express Start',
  })
})

module.exports = router;
