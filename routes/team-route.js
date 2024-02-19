const express = require("express");
const router = express.Router();
const teamValidation = require("../validation").teamValidation;
const passport = require("passport");
const { resolve } = require("path");
const upload = require("../config/multer-court");
const { default: mongoose } = require("mongoose");
const Team = require("../models").team;
const Court = require("../models").court;
const User = require("../models").user;

router.use((req, res, next) => {
  console.log("正在接受一個team-router請求");
  next();
});

//獲得所有隊伍資料
router.get("/", async (req, res) => {
  console.log("正在取得所有隊伍資料");
  try {
    const teamFound = await Team.find({});

    //處理court
    await Promise.all(
      teamFound.map(async (team) => {
        team.court = await Court.findById(team.court, { courtName: 1 });
        return team.court;
      })
    );

    //處理teamLeader
    await Promise.all(
      teamFound.map(async (team) => {
        team.teamLeader = await User.findById(team.teamLeader, {
          username: 1,
          goodAtPosition: 1,
          skillLevel: 1,
          photoSelected: 1,
        });
        return team.teamLeader;
      })
    );
    //處理teamMember
    await Promise.all(
      teamFound.map(async (team) => {
        team.teamMember = await Promise.all(
          team.teamMember.map(async (memberId) => {
            memberId = await User.findById(memberId, {
              username: 1,
              goodAtPosition: 1,
              skillLevel: 1,
              photoSelected: 1,
            });
            return memberId;
          })
        );
        return team.teamMember;
      })
    );
    return res.send(teamFound);
  } catch (e) {
    return res.status(500).send("獲取隊伍資料失敗");
  }
});

//建立隊伍資料(需jwt)
router.post(
  "/auth/teamCreate",
  upload.none(),
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    console.log("正在建立球場");
    //處理球場資料格式
    let { court, teamMember } = req.body;
    let courtFound = await Court.findOne({ courtName: court });
    if (courtFound) {
      court = courtFound._id;
    } else {
      return res.status(400).send("找不到此球場");
    }
    // console.log(typeof teamMember);
    teamMember = JSON.parse(teamMember);
    // console.log(teamMember);
    const { ObjectId } = mongoose.Types;
    const objectIdArray = teamMember.map((id) => new ObjectId(id));
    teamMember = objectIdArray;
    console.log(typeof objectIdArray);

    //驗證資料格式
    let { error } = teamValidation(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    console.log("驗證格式完成");
    //獲取隊伍資料並儲存到資料庫
    try {
      let { date, teamName, teamLeader } = req.body;
      let newTeam = new Team({
        court,
        date,
        teamName,
        teamLeader,
        teamMember,
      });
      const saveTeam = await newTeam.save();
      // console.log("saveTeam success");
      //找到對應id球場資料並將隊伍push到球場資料庫的teams-array更新
      let courtFound = await Court.findOne({ _id: court }).exec();
      courtFound.teams.push(saveTeam._id);
      await courtFound.save();
      // console.log("update success");

      //找到隊伍中現有成員對應id的user資料並將隊伍push到user資料庫的teams-array更新
      let userLeaderFound = await User.findOne({ _id: teamLeader });
      // 確認teamMember資料格式;
      if (!Array.isArray(teamMember)) {
        teamMember = [teamMember];
      }
      let userMemberFound = await Promise.all(
        teamMember.map(async (memberId) => {
          let userFound = await User.findOne({ _id: memberId });
          return userFound;
        })
      );
      // console.log(userLeaderFound);
      // console.log(userMemberFound);
      userLeaderFound.teams.push(saveTeam._id);
      await userLeaderFound.save();
      userMemberFound.map(async (member) => {
        member.teams.push(saveTeam._id);
        await member.save();
      });

      return res.send("創建隊伍成功");
    } catch (e) {
      console.error(e);
      return res.status(500).send("創建隊伍失敗");
    }
  }
);

//加入隊伍（需要jwt)
router.patch(
  "/auth/teamJoin/:teamId/:userId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //透過id取得使用者及隊伍資料
    let { teamId, userId } = req.params;
    let teamFound = await Team.findOne({ _id: teamId }).exec();
    let userFound = await User.findOne({ _id: userId }).exec();
    console.log(teamFound);
    console.log(userFound);

    //檢查是否已在隊伍中
    // console.log(typeof teamFound.teamLeader);
    // console.log(typeof userFound._id);
    if (teamFound.teamMember.length >= 5) {
      return res.status(400).send("此隊伍已滿員");
    } else if (teamFound.teamLeader.toString() === userFound._id.toString()) {
      return res.status(400).send("你已是該隊伍的隊長");
    } else if (teamFound.teamMember.includes(userFound._id)) {
      return res.status(400).send("你已是該隊伍的隊員");
    }

    //將使用者id加入隊伍資料並將隊伍id加入使用者資料
    teamFound.teamMember.push(userFound._id);
    userFound.teams.push(teamFound._id);
    let saveTeam = await teamFound.save();
    let saveUser = await userFound.save();
    console.log(saveTeam);
    console.log(saveUser);
    return res.send("加入隊伍成功");
  }
);

//使用email來找到user資料
router.get(
  "/:email",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let { email } = req.params;
    // console.log(username);
    let userFound = await User.findOne(
      { email },
      { username: 1, photoSelected: 1, skillLevel: 1, goodAtPosition: 1 }
    );
    // console.log(userFound);
    res.send(userFound);
  }
);

//隨機獲得資料庫中的十位user;
router.get(
  "/auth/radomTen",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let userCount;
    try {
      userCount = await User.countDocuments();
      // console.log(userCount);
      //生成十個隨機數（範圍在0~User資料庫的數量)
      const userIndexes = [];
      while (userIndexes.length < 10) {
        const userIndex = Math.floor(Math.random() * userCount);
        if (!userIndexes.includes(userIndex)) userIndexes.push(userIndex);
      }
      // console.log(userIndexes);
      //依照生成的隨機數來取得User資料
      let radomUsers = await Promise.all(
        userIndexes.map((index) => {
          let foundUser = User.findOne(
            {},
            { username: 1, photoSelected: 1, skillLevel: 1, goodAtPosition: 1 }
          ).skip(index);
          return foundUser;
        })
      );
      // console.log(radomUsers);
      return res.send(radomUsers);
    } catch (e) {
      // console.log(e);
      return res.status(500).send("獲取十位隨機用戶失敗");
    }
  }
);

module.exports = router;
