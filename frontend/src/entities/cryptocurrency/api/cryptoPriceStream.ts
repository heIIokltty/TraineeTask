import type {
  CryptocurrencyId,
  CryptocurrencyPrice,
} from '../model/cryptocurrency.types';

export interface CryptoPriceStream {
  connect: () => void;
  disconnect: () => void;
  subscribe: (listener: (prices: ReadonlyArray<CryptocurrencyPrice>) => void) => () => void;
}

const BINANCE_STREAM_BASE_URL = 'wss://stream.binance.com:9443/stream?streams=';
const RECONNECT_DELAY_MS = 3000;
const BINANCE_PRICE_SOURCES: ReadonlyArray<BinancePriceSource> = [
  { coinId: 'bitcoin', symbol: 'btcusdt' },
  { coinId: 'ethereum', symbol: 'ethusdt' },
  { coinId: 'solana', symbol: 'solusdt' },
  { coinId: 'xrp', symbol: 'xrpusdt' },
  { coinId: 'usd-coin', symbol: 'usdcusdt' },
  { coinId: 'binance-coin', symbol: 'bnbusdt' },
  { coinId: 'midnight', symbol: null },
  { coinId: 'dogecoin', symbol: 'dogeusdt' },
  { coinId: 'sui', symbol: 'suiusdt' },
  { coinId: 'tether', symbol: 'usdcusdt', invertPrice: true },
  { coinId: 'cardano', symbol: 'adausdt' },
  { coinId: 'polkadot', symbol: 'dotusdt' },
  { coinId: 'avalanche', symbol: 'avaxusdt' },
  { coinId: 'chainlink', symbol: 'linkusdt' },
  { coinId: 'polygon', symbol: 'maticusdt' },
  { coinId: 'toncoin', symbol: 'tonusdt' },
];
const PRICE_SOURCES_BY_BINANCE_SYMBOL = createPriceSourcesByBinanceSymbol();

interface BinancePriceSource {
  coinId: CryptocurrencyId;
  symbol: string | null;
  invertPrice?: boolean;
}

interface BinanceTickerMessage {
  data?: {
    s?: unknown;
    c?: unknown;
  };
}

export class BinancePriceStream implements CryptoPriceStream {
  private readonly listeners = new Set<(prices: ReadonlyArray<CryptocurrencyPrice>) => void>();

  private readonly prices = new Map<CryptocurrencyId, CryptocurrencyPrice>();

  private reconnectTimerId: number | null = null;

  private socket: WebSocket | null = null;

  private shouldReconnect = false;

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return;
    }

    this.shouldReconnect = true;
    this.clearReconnectTimer();
    this.openSocket();
  }

  disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  subscribe(listener: (prices: ReadonlyArray<CryptocurrencyPrice>) => void): () => void {
    this.listeners.add(listener);

    if (this.prices.size > 0) {
      listener([...this.prices.values()]);
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  private openSocket(): void {
    const socket = new WebSocket(createBinanceStreamUrl());
    this.socket = socket;

    socket.addEventListener('message', (event) => {
      const prices = parseBinanceTickerMessage(event.data);

      if (prices.length === 0) {
        return;
      }

      prices.forEach((price) => {
        this.prices.set(price.coinId, price);
      });
      this.emitPrices();
    });

    socket.addEventListener('error', () => {
      socket.close();
    });

    socket.addEventListener('close', () => {
      if (this.socket === socket) {
        this.socket = null;
      }

      if (this.shouldReconnect) {
        this.emitErrorPrices();
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect(): void {
    this.clearReconnectTimer();
    this.reconnectTimerId = window.setTimeout(() => {
      this.openSocket();
    }, RECONNECT_DELAY_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimerId === null) {
      return;
    }

    window.clearTimeout(this.reconnectTimerId);
    this.reconnectTimerId = null;
  }

  private emitErrorPrices(): void {
    getStreamedCoinIds().forEach((coinId) => {
      const currentPrice = this.prices.get(coinId);

      this.prices.set(coinId, {
        coinId,
        value: currentPrice?.value ?? null,
        status: 'error',
      });
    });

    this.emitPrices();
  }

  private emitPrices(): void {
    const prices = [...this.prices.values()];
    this.listeners.forEach((listener) => listener(prices));
  }
}

export function createCryptoPriceStream(): CryptoPriceStream {
  return new BinancePriceStream();
}

function createBinanceStreamUrl(): string {
  const streams = getStreamedSymbols().map((symbol) => `${symbol}@ticker`);

  return `${BINANCE_STREAM_BASE_URL}${streams.join('/')}`;
}

function parseBinanceTickerMessage(data: unknown): ReadonlyArray<CryptocurrencyPrice> {
  if (typeof data !== 'string') {
    return [];
  }

  try {
    const message = JSON.parse(data) as BinanceTickerMessage;
    const symbol = message.data?.s;
    const value = message.data?.c;

    if (typeof symbol !== 'string' || typeof value !== 'string') {
      return [];
    }

    const sources = PRICE_SOURCES_BY_BINANCE_SYMBOL[symbol.toLowerCase()];
    const numericValue = Number(value);

    if (!sources || !Number.isFinite(numericValue) || numericValue <= 0) {
      return [];
    }

    return sources.map((source) => ({
      coinId: source.coinId,
      value: source.invertPrice ? 1 / numericValue : numericValue,
      status: 'ready',
    }));
  } catch {
    return [];
  }
}

function getStreamedSymbols(): string[] {
  const symbols = BINANCE_PRICE_SOURCES
    .map((source) => source.symbol)
    .filter((symbol): symbol is string => Boolean(symbol));

  return [...new Set(symbols)];
}

function getStreamedCoinIds(): CryptocurrencyId[] {
  return BINANCE_PRICE_SOURCES
    .filter((source) => Boolean(source.symbol))
    .map((source) => source.coinId);
}

function createPriceSourcesByBinanceSymbol(): Readonly<Record<string, ReadonlyArray<BinancePriceSource>>> {
  return BINANCE_PRICE_SOURCES.reduce<Record<string, BinancePriceSource[]>>(
    (accumulator, source) => {
      if (source.symbol) {
        accumulator[source.symbol] = [...(accumulator[source.symbol] ?? []), source];
      }

      return accumulator;
    },
    {},
  );
}
