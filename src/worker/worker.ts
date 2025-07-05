declare const self: SharedWorkerGlobalScope;

type ExchangeName = "NYSE" | "DAX" | "LSE";

export type Stock = {
  symbol: string;
  exchange: ExchangeName;
};

export type Snapshot = Stock & {
  last: number;
  volume: number;
  bid: number;
  ask: number;
  lastUpdated: number;
};

export type StockSnapshotList = {
  type: "snapshotList";
  stocks: Snapshot[];
};

export type StockDelta = Stock & {
  type: "stockDelta";
  update: Partial<Snapshot>;
};

export type Message = StockSnapshotList | StockDelta;

const SP500: Stock[] = [
  { symbol: "AAPL", exchange: "NYSE" },
  { symbol: "AMZN", exchange: "NYSE" },
  { symbol: "GOOGL", exchange: "NYSE" },
  { symbol: "MSFT", exchange: "NYSE" },
];

const DAX: Stock[] = [
  { symbol: "1COV", exchange: "DAX" },
  { symbol: "ADS", exchange: "DAX" },
  { symbol: "ALV", exchange: "DAX" },
  { symbol: "BAS", exchange: "DAX" },
  { symbol: "BAYN", exchange: "DAX" },
  { symbol: "BMW", exchange: "DAX" },
  { symbol: "DB1", exchange: "DAX" },
  { symbol: "DBK", exchange: "DAX" },
  { symbol: "DTE", exchange: "DAX" },
  { symbol: "ENR", exchange: "DAX" },
  { symbol: "EOAN", exchange: "DAX" },
  { symbol: "FME", exchange: "DAX" },
  { symbol: "FRE", exchange: "DAX" },
  { symbol: "HEN3", exchange: "DAX" },
  { symbol: "IFX", exchange: "DAX" },
  { symbol: "LHA", exchange: "DAX" },
  { symbol: "LIN", exchange: "DAX" },
  { symbol: "MRK", exchange: "DAX" },
  { symbol: "MTX", exchange: "DAX" },
  { symbol: "MUV2", exchange: "DAX" },
  { symbol: "PUM", exchange: "DAX" },
  { symbol: "QIA", exchange: "DAX" },
  { symbol: "RWE", exchange: "DAX" },
  { symbol: "SAP", exchange: "DAX" },
  { symbol: "SIE", exchange: "DAX" },
  { symbol: "SRT3", exchange: "DAX" },
  { symbol: "VNA", exchange: "DAX" },
  { symbol: "VOW3", exchange: "DAX" },
  { symbol: "ZAL", exchange: "DAX" },
];

const FTSE100: Stock[] = [
  { symbol: "ABF", exchange: "LSE" },
  { symbol: "AZN", exchange: "LSE" },
  { symbol: "BARC", exchange: "LSE" },
  { symbol: "BLND", exchange: "LSE" },
  { symbol: "BP", exchange: "LSE" },
  { symbol: "CNA", exchange: "LSE" },
  { symbol: "CPG", exchange: "LSE" },
  { symbol: "CRH", exchange: "LSE" },
  { symbol: "DGE", exchange: "LSE" },
  { symbol: "EXPN", exchange: "LSE" },
  { symbol: "GLEN", exchange: "LSE" },
  { symbol: "GSK", exchange: "LSE" },
  { symbol: "HSBA", exchange: "LSE" },
  { symbol: "IMB", exchange: "LSE" },
  { symbol: "LAND", exchange: "LSE" },
  { symbol: "LLOY", exchange: "LSE" },
  { symbol: "MNG", exchange: "LSE" },
  { symbol: "NG", exchange: "LSE" },
  { symbol: "NXT", exchange: "LSE" },
  { symbol: "PRU", exchange: "LSE" },
  { symbol: "RDSA", exchange: "LSE" },
  { symbol: "RIO", exchange: "LSE" },
  { symbol: "SHEL", exchange: "LSE" },
  { symbol: "SMIN", exchange: "LSE" },
  { symbol: "SSE", exchange: "LSE" },
  { symbol: "STAN", exchange: "LSE" },
  { symbol: "TSCO", exchange: "LSE" },
  { symbol: "ULVR", exchange: "LSE" },
  { symbol: "VOD", exchange: "LSE" },
];

const ALL_STOCKS: Stock[] = [...SP500, ...DAX, ...FTSE100];
const state: Record<string, Snapshot> = {};
const ports: MessagePort[] = [];

let updateInterval = 1;
let running = false;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function initialize({ symbol, exchange }: Stock): Snapshot {
  const price = randomBetween(50, 500);
  return (state[symbol] = {
    symbol,
    exchange,
    last: price,
    volume: Math.floor(randomBetween(1000, 50000)),
    bid: price - 0.05,
    ask: price + 0.05,
    lastUpdated: Date.now(),
  });
}

function broadcast(msg: Message) {
  for (const port of ports) {
    port.postMessage(msg);
  }
}

function generateAndEmitChanges(stock: Stock) {
  const lastUpdated = Date.now();

  const update: Partial<Snapshot> = createRandomUpdate(stock);
  state[stock.symbol] = {
    ...state[stock.symbol],
    ...update,
    lastUpdated,
  };

  broadcast({
    type: "stockDelta",
    ...stock,
    update: { ...update, lastUpdated },
  });
}

const createRandomUpdate = (stock: Stock) => {
  const randomInt = Math.floor(Math.random() * 4);

  switch (randomInt) {
    case 0:
      return { last: state[stock.symbol].last * randomBetween(0.995, 1.005) };
    case 1:
      return {
        volume:
          state[stock.symbol].volume + Math.floor(randomBetween(100, 2000)),
      };
    case 2:
      return { bid: state[stock.symbol].last - randomBetween(0.01, 0.05) };
    case 3:
      return { ask: state[stock.symbol].last + randomBetween(0.01, 0.05) };
    default:
      return {};
  }
};

function start() {
  if (running) return;
  running = true;

  setInterval(() => {
    const stock = ALL_STOCKS[Math.floor(Math.random() * ALL_STOCKS.length)];
    generateAndEmitChanges(stock);
  }, updateInterval);
}

self.onconnect = (e: MessageEvent) => {
  const port = e.ports[0];
  ports.push(port);

  port.onmessage = (event) => {
    const msg = event.data;
    if (msg?.type === "setFrequency" && typeof msg.ms === "number") {
      updateInterval = msg.ms;
    } else if (msg?.type === "disconnect") {
      const index = ports.indexOf(port);
      if (index !== -1) {
        ports.splice(index, 1);
      }
      port.close();
    }
  };

  port.start();

  const initialStocks = ALL_STOCKS.map((stock) => initialize(stock));

  broadcast({
    type: "snapshotList",
    stocks: initialStocks,
  });

  start();
};
