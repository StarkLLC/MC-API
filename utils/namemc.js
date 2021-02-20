const axios = require('axios');
const cheerio = require('cheerio');

exports.userStats = async (identifier) => {
  const data = {};
  // identifier can either uuid, uuid with dashes, or ign.

  const url = `https://namemc.com/profile/${identifier}`;
  const response = await axios.get(url).catch((err) => {
    if (err.response.status === 503) {
      return { error: 'failed to connect to namemc' };
    } // TODO: fix.
  });

  const $ = cheerio.load(response.data);

  data.username = $('body > main > h1').text();

  data.uuid = $(
    'body > main > div > div.col-lg-8.order-lg-2 > div:nth-child(1) > div.card-body.py-1 > div:nth-child(2) > div.col-12.order-md-2.col-md > samp'
  ).text();

  data.location = $(
    'body > main > div > div.col-lg-8.order-lg-2 > div:nth-child(5) > div.card-body.py-1 > div:nth-child(1) > div.col-auto'
  ).text();

  if (data.location === 'Accounts') {
    data.location = '';
  }

  data.views = parseInt(
    $(
      'body > main > div > div.col-lg-8.order-lg-2 > div:nth-child(1) > div.card-body.py-1 > div:nth-child(4) > div.col-auto'
    )
      .text()
      .split(' ')[0],
    10
  );

  data.accounts = {};

  $(
    'body > main > div > div.col-lg-8.order-lg-2 > div:nth-child(5) > div.card-body.py-1 > div.row.no-gutters.align-items-center > div.col.text-right.text-md-left'
  )
    .find('a')
    .each((i, v) => {
      const acc_type = $(v)
        .find('img')
        .attr('src')
        .split('/')
        .pop()
        .split('.')[0];
      const link_or_void = $(v).attr('href');
      // eslint-disable-next-line no-script-url
      if (link_or_void === 'javascript:void(0)') {
        data.accounts[acc_type] = $(v).data('content');
      }
      else {
        data.accounts[acc_type] = link_or_void;
      }
    });

  data.skins = {};

  data.skins.skin_ids = [];
  data.skins.texture_urls = [];

  $(
    'body > main > div > div.col-lg-4.order-lg-1 > div:nth-child(3) > div.card-body.text-center'
  )
    .find('a')
    .each((index, value) => {
      data.skins.skin_ids.push($(value).attr('href').split('/').pop());
    });

  for (let index = 0; index < data.skins.skin_ids.length; index++) {
    const element = data.skins.skin_ids[index];

    data.skins.texture_urls.push(`https://namemc.com/texture/${element}.png`);
  }

  return data;
};

exports.droptime = async (username) => {
  const url = `https://namemc.com/name/${username}`;
  const resp = await axios.get(url);
  const $ = cheerio.load(resp.data);

  const time_attr = $('#availability-time').attr('datetime');
  let ret_time = null;
  if (time_attr === undefined) {
    ret_time = { error: `${username} is not dropping` };
  }
  else {
    ret_time = { droptime: Date.parse(time_attr.replace('.000', '')) / 1000 };
  }
  return ret_time;
};
