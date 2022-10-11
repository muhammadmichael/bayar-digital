const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize('BayarDigitalDB', 'akunbayardigital', 'pass123', {
    dialect: 'mssql',
    dialectOptions: {
      // Observe the need for this nested `options` field for MSSQL
      options: {
        // Your tedious options here
        useUTC: false,
        dateFirst: 1,
      },
    },
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./user')(sequelize, Sequelize);
db.saldos = require('./saldo')(sequelize, Sequelize);
db.transaksis = require('./transaksi')(sequelize, Sequelize);

// Associations
// One-to-one, satu user punya satu saldo
db.users.hasOne(db.saldos);
db.saldos.belongsTo(db.users);

module.exports = db;