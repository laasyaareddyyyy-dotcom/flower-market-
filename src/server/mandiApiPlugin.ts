import type { Plugin } from 'vite';
import type { IncomingMessage, ServerResponse } from 'http';

export function mandiApiPlugin(): Plugin {
  return {
    name: 'mandi-api-server-middleware',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const urlObj = new URL(req.url, 'http://localhost:3000');
        const pathname = urlObj.pathname;
        const query = urlObj.searchParams;

        res.setHeader('Content-Type', 'application/json');

        // Health check
        if (pathname === '/api/health') {
          res.statusCode = 200;
          return res.end(JSON.stringify({ status: 'ok', serverTime: new Date().toISOString() }));
        }

        // 1. GET /api/farmer/parchi?view=daily|monthly&date=...
        if (pathname === '/api/farmer/parchi') {
          const view = (query.get('view') || 'daily') as 'daily' | 'monthly';
          const date = query.get('date') || new Date().toISOString().slice(0, 10);
          const month = query.get('month') || date.slice(0, 7);

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              view,
              date,
              month,
              parchis: [],
              message: 'Farmer Parchi API response',
              summary: {
                totalParchis: 0,
                totalVolume: 0,
                grossTotal: 0,
                commissionAmount: 0,
                totalOtherExpenditures: 0,
                farmerNetPayable: 0,
                amountPaid: 0,
                balanceDue: 0,
                settledCount: 0,
                partialCount: 0,
                unpaidCount: 0,
              },
            })
          );
        }

        // 2. GET /api/farmers/search?query=...
        if (pathname === '/api/farmers/search') {
          const searchQuery = query.get('query') || '';
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              query: searchQuery,
              count: 0,
              farmers: [],
              message: 'Farmers Search API response',
            })
          );
        }

        // 3. GET /api/farmer/:farmerId/transactions?merchantId=...
        const transactionsMatch = pathname.match(/^\/api\/farmer\/([^/]+)\/transactions$/);
        if (transactionsMatch) {
          const farmerId = decodeURIComponent(transactionsMatch[1]);
          const merchantId = query.get('merchantId') || undefined;

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              farmerId,
              merchantId,
              count: 0,
              transactions: [],
              message: 'Farmer Transactions API response',
            })
          );
        }

        // 4. GET /api/farmer/:farmerId/sales-summary?merchantId=...&groupBy=month
        const salesSummaryMatch = pathname.match(/^\/api\/farmer\/([^/]+)\/sales-summary$/);
        if (salesSummaryMatch) {
          const farmerId = decodeURIComponent(salesSummaryMatch[1]);
          const merchantId = query.get('merchantId') || undefined;
          const groupBy = (query.get('groupBy') || 'month') as 'month';

          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              farmerId,
              merchantId,
              groupBy,
              summaries: [],
              overall: {
                totalParchis: 0,
                totalVolume: 0,
                grossTotal: 0,
                farmerNetPayable: 0,
                amountPaid: 0,
                balanceDue: 0,
              },
              message: 'Farmer Sales Summary API response',
            })
          );
        }

        // Fallback for unrecognized API route
        next();
      });
    },
  };
}
