const express = require('express');

const router = express.Router();
const namemc = require('../utils/namemc');

router.get('/user/:identifier', async (req, res) => {
  const data = await namemc.userStats(req.params.identifier);
  console.log(data);

  res.send(data);
});

router.get('/droptime/:username', async (req, res) => {
  const data = await namemc.droptime(req.params.username);
  let resp_status = 200;
  if (data.error !== undefined) {
    resp_status = 400;
  }

  res.status(resp_status).send(data);
});

module.exports = router;
