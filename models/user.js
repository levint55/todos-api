var bcrypt = require("bcryptjs");
var _ = require("underscore");
var cryptojs = require("crypto-js");
var jwt = require("jsonwebtoken");

module.exports = (sequelize, DataTypes) => {
  var user = sequelize.define(
    "user",
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      salt: {
        type: DataTypes.STRING,
      },
      password_hash: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          len: [7, 100],
        },
        set: function (value) {
          var salt = bcrypt.genSaltSync(10);
          var hashPassword = bcrypt.hashSync(value, salt);

          this.setDataValue("password", value);
          this.setDataValue("salt", salt);
          this.setDataValue("password_hash", hashPassword);
        },
      },
    },
    {
      hooks: {
        beforeValidate: function (user, options) {
          if (typeof user.email === "string") {
            user.email = user.email.toLowerCase();
          }
        },
      },
      instanceMethods: {
        toPublicJSON: function () {
          var json = this.toJSON();
          return _.pick(json, "id", "email", "createdAt", "updatedAt");
        },
        generateToken: function (type) {
          if (!_.isString(type)) {
            return undefined;
          }

          try {
            var stringData = JSON.stringify({ id: this.get("id"), type: type });
            var encryptedData = cryptojs.AES.encrypt(
              stringData,
              "abc123"
            ).toString();
            var token = jwt.sign(
              {
                token: encryptedData,
              },
              "qwerty"
            );
            return token;
          } catch (e) {
            return undefined;
          }
        },
      },
      classMethods: {
        authenticate: function (body) {
          return new Promise((resolve, reject) => {
            if (!_.isString(body.email) || !_.isString(body.password)) {
              return reject();
            }

            user
              .findOne({ where: { email: body.email } })
              .then((user) => {
                if (
                  !user ||
                  !bcrypt.compareSync(body.password, user.get("password_hash"))
                ) {
                  // possible but fail
                  return reject();
                }

                resolve(user);
              })
              .catch((e) => reject());
          });
        },
        findByToken: function (token) {
          return new Promise((resolve, reject) => {
            try {
              var decodedJWT = jwt.verify(token, "qwerty");
              var bytes = cryptojs.AES.decrypt(decodedJWT.token, "abc123");
              var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

              user.findById(tokenData.id).then(
                (user) => {
                  if (user) {
                    resolve(user);
                  } else {
                    reject();
                  }
                },
                () => {
                  reject();
                }
              );
            } catch (e) {
              reject();
            }
          });
        },
      },
    }
  );
  return user;
};
