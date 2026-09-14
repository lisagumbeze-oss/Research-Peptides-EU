/** Quick live vs local prerender presence check */
const url = process.argv[2] || 'https://www.researchpeptide.eu/en';

const res = await fetch(url, { headers: { 'User-Agent': 'Googlebot' } });
const t = await res.text();
console.log('url', url, 'status', res.status, 'bytes', t.length);
console.log('title', (t.match(/<title>[^<]+<\/title>/i) || ['(none)'])[0]);
console.log('has_h1', /<h1[\s>]/i.test(t));
console.log('has_jsonld', t.includes('application/ld+json'));
console.log('has_prerender', t.includes('data-rp-prerender'));
console.log('empty_root', /<div id="root">\s*<\/div>/i.test(t));
