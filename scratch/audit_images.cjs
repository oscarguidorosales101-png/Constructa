const fs = require('fs');

const files = [
  'src/config/companyConfig.js',
  'src/components/public/PublicHero.jsx',
  'src/components/public/PublicProjects.jsx',
  'src/components/public/PublicProjectModal.jsx',
  'src/components/public/PublicGallery.jsx',
  'src/components/public/PublicSpecialties.jsx',
  'src/components/public/PublicAbout.jsx',
  'src/pages/Materials/Materials.jsx',
  'src/components/materials/MaterialModal.jsx',
  'src/pages/ClientPortal/ClientPortal.jsx'
];

async function scan() {
  const urlRegex = /https:\/\/images\.unsplash\.com\/[^\s'"`,)]+/g;
  const urls = new Set();
  for (const f of files) {
    if (fs.existsSync(f)) {
      const content = fs.readFileSync(f, 'utf8');
      let m;
      while ((m = urlRegex.exec(content)) !== null) {
        urls.add(m[0]);
      }
    }
  }

  console.log('Testing ' + urls.size + ' unique URLs...');
  for (const u of urls) {
    try {
      const res = await fetch(u, { method: 'HEAD' });
      if (res.status !== 200) {
        console.log('FAIL:', res.status, u);
      } else {
        console.log('OK 200:', u.substring(28, 65));
      }
    } catch (e) {
      console.log('ERR:', u, e.message);
    }
  }
  console.log('Scan finished.');
}
scan();
