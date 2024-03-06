// main.js
const { processItem } = require("./processItem");

const urls = [
  'https://staging-eu01-angelini.demandware.net/s/lmind/cuddle-box-C00001.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/tummy-box-C00002.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/touchy-feely-box-C00003.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/nosy-box-C00004.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/brainy-box-C00005.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/handy-box-C00006.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/bloomy-box-C00007.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/bubble-box-C00008.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/root-box-C00009.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/nest-box-C00010.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/breezy-box-C00011.html',
  'https://staging-eu01-angelini.demandware.net/s/lmind/story-box-C00012.html',
];

urls.forEach(url => {
  processItem(url);
});

