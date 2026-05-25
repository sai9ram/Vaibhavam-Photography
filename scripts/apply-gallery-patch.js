const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const galleryPills = fs.readFileSync(path.join(__dirname, 'output', 'gallery-pills.html'), 'utf8');
const portfolioGrid = fs.readFileSync(path.join(__dirname, 'output', 'portfolio-grid.html'), 'utf8');

// index.html — gallery track
const indexPath = path.join(root, 'index.html');
let index = fs.readFileSync(indexPath, 'utf8');
const indexStart = index.indexOf('<div class="infinite-gallery-track">');
const indexEnd = index.indexOf(
  '<div class="reveal-up" style="text-align: center; margin-top: 50px; transition-delay: 0.3s;">',
  indexStart
);
if (indexStart === -1 || indexEnd === -1) throw new Error('index.html gallery markers not found');

const indexReplacement =
  '<div class="infinite-gallery-track">\n' +
  galleryPills +
  '\n          </div>\n        </div>\n        ';

index = index.slice(0, indexStart) + indexReplacement + index.slice(indexEnd);
fs.writeFileSync(indexPath, index);

// portfolio.html — grid
const portfolioPath = path.join(root, 'portfolio.html');
let portfolio = fs.readFileSync(portfolioPath, 'utf8');
const gridStart = portfolio.indexOf('<div class="portfolio-grid reveal-up">');
const gridEnd = portfolio.indexOf('</div>\n      </div>\n    </section>\n\n    <!-- PORTFOLIO VIDEOS');
if (gridStart === -1 || gridEnd === -1) throw new Error('portfolio.html grid markers not found');

const gridReplacement =
  '<div class="portfolio-grid reveal-up">\n' +
  portfolioGrid +
  '\n        </div>\n      </div>\n    </section>\n\n    <!-- PORTFOLIO VIDEOS';

portfolio =
  portfolio.slice(0, gridStart) + gridReplacement + portfolio.slice(gridEnd + '</div>\n      </div>\n    </section>\n\n    <!-- PORTFOLIO VIDEOS'.length);
fs.writeFileSync(portfolioPath, portfolio);

// Update scrollytelling featured chapters with new hero images
const scrollyUpdates = [
  {
    old: /images\/%E2%80%9CGrace%20in%20every%20glance[^"]+\.webp/,
    new: 'images/Haldi%20hues%20and%20forever%20vows%20%E2%80%94%20Raghu%20%E2%9D%A4%EF%B8%8F%20Pooja%23HaldiCeremony%20%23HaldiVibes%20%23WeddingSeason%20%23CoupleGo%20(2).webp',
  },
];
let p2 = fs.readFileSync(portfolioPath, 'utf8');
p2 = p2.replace(
  /<img src="images\/%E2%80%9CGrace%20in%20every%20glance[^"]+" alt="The Grand Celebration">/,
  '<img src="images/Haldi%20hues%20and%20forever%20vows%20%E2%80%94%20Raghu%20%E2%9D%A4%EF%B8%8F%20Pooja%23HaldiCeremony%20%23HaldiVibes%20%23WeddingSeason%20%23CoupleGo%20(2).webp" alt="Raghu & Pooja Haldi">'
);
p2 = p2.replace(
  /<img src="images\/Varun%20%26%20Priya[^"]+" alt="Whispers of Love">/,
  '<img src="images/Pavan%20%2B%20varshaYou%2C%20me%2C%20and%20a%20little%20music%20%E2%80%94%20that%E2%80%99s%20all%20this%20heart%20needs%20%E2%9D%A4%EF%B8%8F%23couplegoals%20%23lovevib.webp" alt="Pavan & Varsha">'
);
p2 = p2.replace(
  /<span>Chapter II<\/span>\s*<h3>Whispers of Love<\/h3>/,
  '<span>Chapter II</span>\n            <h3>Pavan & Varsha</h3>'
);
p2 = p2.replace(
  /<span>Chapter I<\/span>\s*<h3>The Grand Celebration<\/h3>/,
  '<span>Chapter I</span>\n            <h3>Haldi & Forever</h3>'
);
fs.writeFileSync(portfolioPath, p2);

console.log('Patched index.html and portfolio.html');
