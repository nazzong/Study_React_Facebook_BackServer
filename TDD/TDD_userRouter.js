const express = require("express");
const { User } = require("../models");
const bcrypt = require("bcrypt");

const router = express.Router();
const passport = require("passport");

/**
 * ROUTER       : userRouter
 * URL          : "/create"
 * METHOD       : POST
 * AUTHOR       : 4LEAF.NJS
 * DESC         : Create New User
 * PARAMS       : { email, password, nickname }
 * PARAMS TYPE  : BODY
 * DEV_DATE     : 2021-09-07
 * RESPONSES    : 201, 400, 403
 * PACKAGES     : bcrypt
 * CONFIRM      :
 * CONFIRM_DATE :
 * CURRENT CODE :
 */
router.post("/create", async (req, res, next) => {
  const { email, password, nickname } = req.body;

  try {
    const hasPassword = await bcrypt.hash(password, 10);

    const createResult = await User.create({
      email,
      password: hasPassword,
      nickname,
    });

    if (!createResult) {
      return res.status(403).send("잘못된 요청입니다. 다시 시도해주세요.");
    }

    return res.status(201).json({ result: true });
  } catch (error) {
    console.error(error);
    return res.status(400).send("새로운 사용자를 생성할 수 없습니다.");
  }
});

router.post("/sighin", (req, res, next) => {
  passport.authenticate("local", (error, user, info) => {
    if (error) {
      console.error(error);
      return next(error);
    }

    if (info) {
      return res.status(401).send(info.reason);
    }

    return req.login(user, async (loginError) => {
      if (loginError) {
        return next(loginError);
      }
      const fullUser = await User.findOne({
        where: { id: parseInt(user.id) },
        attributes: {
          include: ["id", "email", "nickname", "createdAt", "updatedAt"],
        },
      });

      return res.status(200).json(fullUser);
    });
  });
});

module.exports = router;
