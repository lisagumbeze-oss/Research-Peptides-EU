import { chromium, Browser, Page } from 'playwright';
import { extractStructuredData, ScrapedProduct } from './extractors/structured.js';
import { extractFromDom } from './extractors/dom.js';
import { extractLegalContent, ScrapedLegalPage } from './extractors/legalContent.js';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
});

export class ScraperEngine {
  private browser: Browser | null = null;
  
  async init() {
    const proxyOpts = process.env.PROXY_URL && process.env.PROXY_URL.includes('YOUR_API_KEY_HERE') === false
      ? { server: process.env.PROXY_URL } 
      : undefined;

    this.browser = await chromium.launch({ 
      headless: true,
      proxy: proxyOpts
    });
  }

  async close() {
    if (this.browser) await this.browser.close();
  }

  async scrapeProductPage(url: string): Promise<ScrapedProduct | null> {
    if (!this.browser) await this.init();
    const context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    
    const page = await context.newPage();
    let productData: ScrapedProduct | null = null;

    try {
      logger.info(`Visiting URL: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      
      const title = await page.title();
      if (title.includes('Just a moment') || title.includes('Cloudflare') || title.includes('Attention Required')) {
        throw new Error(`Blocked by Cloudflare/WAF. Page Title: ${title}`);
      }

      const html = await page.content();
      if (html.includes('403 Forbidden')) {
        throw new Error('Blocked by 403 Forbidden directly.');
      }
      
      // Try JSON-LD first
      const structuredData = await extractStructuredData(page);
      if (structuredData.length > 0) {
        logger.info(`Found JSON-LD data for ${url}`);
        productData = structuredData[0];
      } else {
        // Fallback to DOM parsing
        logger.info(`No JSON-LD, falling back to DOM parsing for ${url}`);
        productData = await extractFromDom(page);
      }

    } catch (error) {
      logger.error(`Error scraping ${url}:`, error);
    } finally {
      await page.close();
      await context.close();
    }

    return productData;
  }

  async scrapeLegalPage(url: string): Promise<ScrapedLegalPage | null> {
    if (!this.browser) await this.init();
    const context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    let legalData: ScrapedLegalPage | null = null;

    try {
      logger.info(`Visiting legal/support URL: ${url}`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => undefined);

      const title = await page.title();
      if (title.includes('Just a moment') || title.includes('Cloudflare') || title.includes('Attention Required')) {
        throw new Error(`Blocked by Cloudflare/WAF. Page Title: ${title}`);
      }

      const html = await page.content();
      if (html.includes('403 Forbidden')) {
        throw new Error('Blocked by 403 Forbidden directly.');
      }

      legalData = await extractLegalContent(page);
    } catch (error) {
      logger.error(`Error scraping legal/support page ${url}:`, error);
    } finally {
      await page.close();
      await context.close();
    }

    return legalData;
  }
}
