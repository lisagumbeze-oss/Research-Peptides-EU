import { pool } from '../db.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class CurrencyService {
  private apiKey = process.env.FX_API_KEY;
  private apiUrl = `https://v6.exchangerate-api.com/v6/${this.apiKey}/latest`;

  async getRate(baseCurrency: string, targetCurrency = 'EUR'): Promise<number> {
    if (baseCurrency === targetCurrency) return 1.0;

    // 1. Check cache for recent rate (under 6 hours old)
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        `SELECT rate FROM fx_rates_cache 
         WHERE base_currency = $1 AND target_currency = $2 AND fetched_at > NOW() - INTERVAL '6 hours'`,
        [baseCurrency, targetCurrency]
      );

      if (rows.length > 0) {
        return parseFloat(rows[0].rate);
      }

      // 2. Fetch fresh rate if cache missed or stale
      logger.info(`Fetching fresh exchange rate for ${baseCurrency} to ${targetCurrency}`);
      const res = await fetch(`${this.apiUrl}/${baseCurrency}`);
      
      if (!res.ok) {
        throw new Error(`FX API Error: ${res.statusText}`);
      }

      const data = await res.json();
      
      if (data.result !== 'success' || !data.conversion_rates[targetCurrency]) {
         throw new Error(`Rate not found for ${targetCurrency}`);
      }

      const rate = data.conversion_rates[targetCurrency];

      // 3. Update cache
      await client.query(
        `INSERT INTO fx_rates_cache (base_currency, target_currency, rate, fetched_at) 
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (base_currency, target_currency) 
         DO UPDATE SET rate = EXCLUDED.rate, fetched_at = NOW()`,
        [baseCurrency, targetCurrency, rate]
      );

      return rate;
    } catch (error) {
      logger.error('Currency Fetch Error:', error);
      
      // Fallback to expired cache if available
      const { rows } = await client.query(
        `SELECT rate FROM fx_rates_cache WHERE base_currency = $1 AND target_currency = $2 ORDER BY fetched_at DESC LIMIT 1`,
        [baseCurrency, targetCurrency]
      );
      
      if (rows.length > 0) {
        logger.warn('Falling back to expired rate cache');
        return parseFloat(rows[0].rate);
      }
      
      return 1.0; // Ultimate fallback
    } finally {
      client.release();
    }
  }

  async convertToEur(amount: number, fromCurrency: string): Promise<number> {
    const rate = await this.getRate(fromCurrency, 'EUR');
    return parseFloat((amount * rate).toFixed(2));
  }

  /** @deprecated Use convertToEur — legacy name kept for import scripts. */
  async convertToGbp(amount: number, fromCurrency: string): Promise<number> {
    return this.convertToEur(amount, fromCurrency);
  }
}
