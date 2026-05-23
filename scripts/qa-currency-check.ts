import { formatMoney } from '../src/lib/currency.ts';

const amount = 129.95;
console.log('EUR formatting QA (129.95):');
console.log('  DE:', formatMoney(amount, 'de-DE', 'EUR'));
console.log('  NL:', formatMoney(amount, 'nl-NL', 'EUR'));
console.log('  EN:', formatMoney(amount, 'en-IE', 'EUR'));
