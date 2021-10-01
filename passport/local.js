const passport = require("passport");
const { Strategy: LocalStrategy } = require("passport-local");
const bcrypt = require("bcrypt");
const { User } = require("../models");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({
            where: { email },
          });

          if (!exUser) {
            return done(null, false, {
              reason: "존재하지 않는 이메일 입니다.",
            });
          }

          const result = await bcrypt.compare(password, exUser.password);

          if (result) {
            return done(null, exUser);
          }
        } catch (error) {
          console.error(error);
          return done(error);
        }
      }
    )
  );
};
