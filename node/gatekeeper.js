const {
  models: { User, Transaction },
} = require("./db");


const requireToken = async (req, res, next) => {
  const token = req.headers.authorization;
  req.user = await User.findByToken(token);
  next();
};

const isAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).send("You must be an admin to access this route");
  } else {
    next();
  }
};

//const isYourSection = async (req, res, next) => {
  //let sectionId = req.params.sectionId;
  //const section = await Section.findByPk(sectionId, {
    //include: {
      //model: Project,
      //include: User,
    //},
  //});
  //const userIds = section.project.users.map((x) => x.id);
  //const userInProject = userIds.some((x) => x === req.user.id);
  //if (userInProject) {
    //next();
  //} else {
    //return res.status(403).send("You cannot access other users sections");
  //}
//};

const isSelf = (req, res, next) => {
  let userId = req.params.userId;
  if (!userId) {
    userId = req.body.userId;
  }
  if (!userId) {
    userId = req.query.userId;
  }
  const isSelf = req.user.id === Number(userId);
  if (isSelf) {
    next();
  } else {
    return res.status(403).send("You cannot access other users data");
  }
};

const isAdminOrSelf = (req, res, next) => {
  const isSelf = req.user.id === Number(req.params.userId);
  const isAdmin = req.user.isAdmin;
  if (isSelf | isAdmin) {
    next();
  } else {
    return res.status(403).send("You must be an admin to access this route");
  }
};

module.exports = {
  requireToken,
  isSelf,
  //isYourSection,
  isAdmin,
  isAdminOrSelf,
};
