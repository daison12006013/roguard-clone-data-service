const fs = require('fs-extra');
const jsdom = require('jsdom');
const helpers = require('./helpers');
const { JSDOM } = jsdom;
const { normalizeText } = helpers;

const dir = './database/item';

cloneItemData = async pages => {
  // Check and create dir when dir not exist
  await fs.ensureDir(dir);

  for (let i = 1; i <= pages; i++) {
    const page = i === 1 ? '' : `?page=${i}`;
    const resp = await serializeItemData(page);
    fs.writeFile(
      `${dir}/data${i}.json`,
      JSON.stringify(resp, null, 4),
      err => {
        if (err) {
          console.log(err);
        } else {
          console.log(`WRITE ITEM DATA SUCCESSFUL, data${i}.json`);
        }
      },
    );
  }
};

serializeItemData = async pages => {
  const respDom = await JSDOM.fromURL(
    `https://www.roguard.net/db/items/${pages}`,
  );
  const dom = new JSDOM(respDom.serialize());
  const tbody = dom.window.document.querySelector('tbody').innerHTML;
  const match = tbody.match(/<tr[\s\S]*?<\/tr>/g);

  const itemData = [];

  for (const element of match) {
    const itemImage =
      element.match(/src\s*=\s*\\*"\/\/(.+?)\\*"\s*/) !== null
        ? element.match(/src\s*=\s*\\*"\/\/(.+?)\\*"\s*/)[1]
        : null;
    const itemName = element.match(/<a (.*)>(.+?)<\/a>/)[2];
    const itemChineseName = element.match(
      /<div style="color: (.*);">(.+?)<\/div>/,
    )[2];

    // split by td tag element into array
    const splitdata = element.split('</td>');
    const splitItemDescriptionDiv = splitdata[3];

    itemDescription = '';
    itemEffect = [];

    // if item description has multiple lines
    if (splitItemDescriptionDiv.match(/<br ?\/?>/)) {
      const itemEffects = splitItemDescriptionDiv;

      if (itemEffects.match(/<div style="margin-top: 10px;">(.*)<br>/)) {
        itemEffect.push(
          normalizeText(
            itemEffects.match(/<div style="margin-top: 10px;">(.*)<br>/)[1],
          ),
        );
      }

      if (itemEffects.match(/<br>\n(.*)<\/div>/)) {
        itemEffect.push(
          normalizeText(itemEffects.match(/<br>\n(.*)<\/div>/)[1]),
        );
      }
    }

    // if effect card has single lines
    itemDescription =
      splitdata[2].match(/<td (.*)>\s*(.*)/)[2] !== ''
        ? splitdata[2].match(/<td (.*)>\s*(.*)/)[2]
        : null;

    if (itemDescription === null) {
      itemDescription =
        element.split('</td>')[3].match(/<td (.*)>\s*(.*)/)[2] !== null
          ? element.split('</td>')[3].match(/<td (.*)>\s*(.*)/)[2]
          : null;
    }

    itemDescription = itemDescription.replace('<div>', '');
    itemDescription = itemDescription.replace('</div>', '');

    itemData.push({
      imgsrc: itemImage,
      name: normalizeText(itemName),
      chineseName: itemChineseName,
      description: normalizeText(itemDescription),
      effects: itemEffect,
    });
  }

  return itemData;
};

module.exports = {
  async clone(pages) {
    await cloneItemData(pages);
  },
};
