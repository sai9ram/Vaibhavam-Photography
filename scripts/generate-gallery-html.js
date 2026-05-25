const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'images');
const EXCLUDE = new Set([
  'Candid Camera.webp',
  'Candid Video.avif',
  'Drone camera.webp',
  'LED wall.webp',
  'live Stream.avif',
  'Traditional camera.jpg',
  'Traditional Video.webp',
]);

const LAYOUT_CYCLE = [
  'card-tall',
  'card-wide',
  '',
  '',
  'card-tall',
  'card-large',
  'card-wide',
  'card-tall',
];

function imgSrc(file) {
  return `images/${encodeURIComponent(file)}`;
}

function isPreWedding(file) {
  const f = file.toLowerCase();
  return (
    f.includes('prewedd') ||
    f.includes('pre-wedding') ||
    f.includes('frozen in love') ||
    f.includes('beginning of forever') ||
    f.includes('tangled up') ||
    f.includes('pavan + varsha') ||
    f.includes('lovevib')
  );
}

function metaFromFile(file) {
  const lower = file.toLowerCase();
  if (lower.includes('haldi hues') || (lower.includes('raghu') && lower.includes('pooja') && lower.includes('haldi')))
    return { couple: 'Raghu & Pooja', title: 'Haldi Blessings', category: 'weddings' };
  if (lower.includes('pavan + varsha') || lower.includes('pavan'))
    return { couple: 'Pavan & Varsha', title: 'Music & Love', category: 'pre-weddings' };
  if (lower.includes('shrikanth') || lower.includes('srikanth') || lower.includes('pooja..'))
    return { couple: 'Shrikanth & Pooja', title: 'Graceful Moments', category: 'weddings' };
  if (lower.includes('varun & priya'))
    return { couple: 'Varun & Priya', title: 'Love Story', category: 'weddings' };
  if (lower.includes('somashekar') || lower.includes('harshitha'))
    return { couple: 'Somashekar & Harshitha', title: 'Tender Care', category: 'weddings' };
  if (lower.includes('shusmita') || lower.includes('golden rains'))
    return { couple: 'Shusmita', title: 'Golden Haldi', category: 'weddings' };
  if (lower.includes('gentle as petals') || lower.includes('petals'))
    return { couple: 'Timeless Love', title: 'Gentle Petals', category: 'weddings' };
  if (lower.includes('framed in grandeur'))
    return { couple: 'Royal Couple', title: 'Grandeur', category: 'weddings' };
  if (lower.includes('frozen in love'))
    return { couple: 'Forever Yours', title: 'Frozen in Love', category: 'pre-weddings' };
  if (lower.includes('beginning of forever'))
    return { couple: 'Newlyweds', title: 'Forever Begins', category: 'pre-weddings' };
  if (lower.includes('tangled up'))
    return { couple: 'Pre-Wedding', title: 'Love & Laughter', category: 'pre-weddings' };
  if (lower.includes('not just a picture'))
    return { couple: 'Srikanth & Pooja', title: 'Pure Feeling', category: 'weddings' };

  const category = isPreWedding(file) ? 'pre-weddings' : 'weddings';
  return { couple: 'Vaibhavam Wedding', title: 'Captured Moment', category };
}

const files = fs
  .readdirSync(imagesDir)
  .filter((f) => /\.(webp|jpg|jpeg|png)$/i.test(f) && !EXCLUDE.has(f))
  .sort((a, b) => a.localeCompare(b));

function portfolioCard(file, index) {
  const { couple, title, category } = metaFromFile(file);
  const layout = LAYOUT_CYCLE[index % LAYOUT_CYCLE.length];
  const layoutClass = layout ? ` ${layout}` : '';
  const label = category === 'pre-weddings' ? 'Pre-Weddings' : 'Weddings';
  const src = imgSrc(file);

  return `          <!-- Card ${index + 1} -->
          <div class="portfolio-card${layoutClass}" data-category="${category}">
            <img src="${src}" alt="${couple}">
            <div class="card-overlay">
              <span>${label}</span>
              <h3>${title}</h3>
            </div>
          </div>`;
}

function galleryPill(file, title) {
  const src = imgSrc(file);
  return `            <div class="gallery-pill">
              <a href="https://www.instagram.com/vaibhavam_by_varun/" target="_blank" rel="noopener" class="img-link">
                <img src="${src}" alt="Wedding">
                <div class="pill-overlay">
                  <h4>${title}</h4>
                </div>
              </a>
            </div>`;
}

// Gallery: curated mix (new images first, then variety)
const galleryPick = [];
const haldi = files.filter((f) => f.toLowerCase().includes('haldi hues'));
const pavan = files.filter((f) => f.toLowerCase().includes('pavan + varsha'));
const grace = files.filter((f) => f.toLowerCase().includes('grace in every'));
const others = files.filter(
  (f) =>
    !haldi.includes(f) &&
    !pavan.includes(f) &&
    !grace.includes(f) &&
    !f.toLowerCase().includes('gentle as petals') &&
    !f.toLowerCase().includes('tangled up')
);

function pickEvery(set, n) {
  if (!set.length) return [];
  const out = [];
  const step = Math.max(1, Math.floor(set.length / n));
  for (let i = 0; i < set.length && out.length < n; i += step) out.push(set[i]);
  return out;
}

galleryPick.push(
  ...pickEvery(haldi, 2),
  ...pickEvery(pavan, 2),
  ...pickEvery(grace, 1),
  ...pickEvery(files.filter((f) => f.toLowerCase().includes('golden rains')), 1),
  ...pickEvery(files.filter((f) => f.toLowerCase().includes('varun & priya')), 1),
  ...pickEvery(files.filter((f) => f.toLowerCase().includes('tangled up')), 1),
  ...pickEvery(files.filter((f) => f.toLowerCase().includes('beginning of forever')), 1),
  ...pickEvery(files.filter((f) => f.toLowerCase().includes('framed in grandeur')), 1)
);

// Dedupe and cap at 8 for marquee set 1
const gallerySet = [...new Set(galleryPick)].slice(0, 8);
while (gallerySet.length < 8 && files.length) {
  const f = files[gallerySet.length % files.length];
  if (!gallerySet.includes(f)) gallerySet.push(f);
  else break;
}

const galleryTitles = gallerySet.map((f) => metaFromFile(f).couple);
const galleryHtml =
  '            <!-- Set 1 -->\n' +
  gallerySet.map((f, i) => galleryPill(f, galleryTitles[i])).join('\n') +
  '\n            <!-- Set 2 (Duplicate for Loop) -->\n' +
  gallerySet.map((f, i) => galleryPill(f, galleryTitles[i])).join('\n');

const portfolioHtml = files.map((f, i) => portfolioCard(f, i)).join('\n');

const outDir = path.join(__dirname, '..', 'scripts', 'output');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'gallery-pills.html'), galleryHtml);
fs.writeFileSync(path.join(outDir, 'portfolio-grid.html'), portfolioHtml);
console.log(`Gallery pills: ${gallerySet.length * 2} items (${gallerySet.length} unique)`);
console.log(`Portfolio cards: ${files.length}`);
