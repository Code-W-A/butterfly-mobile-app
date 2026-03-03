/** @format */

const store = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async key => (key in store ? store[key] : null)),
    setItem: jest.fn(async (key, value) => {
      store[key] = value;
    }),
  },
}));

import {
  appendHistorySession,
  getHistorySessions,
  saveHistorySessions,
} from '../historyStorage';

describe('historyStorage', () => {
  beforeEach(() => {
    Object.keys(store).forEach(key => {
      delete store[key];
    });
  });

  it('serializează și returnează sesiunile sortate desc după createdAt', async () => {
    await saveHistorySessions([
      { sessionId: 's1', createdAt: 1000 },
      { sessionId: 's2', createdAt: 3000 },
      { sessionId: 's3', createdAt: 2000 },
    ]);

    const sessions = await getHistorySessions();
    expect(sessions.map(item => item.sessionId)).toEqual(['s2', 's3', 's1']);
  });

  it('păstrează maximum 50 de sesiuni', async () => {
    const sessions = Array.from({ length: 55 }, (_, index) => ({
      sessionId: `s_${index}`,
      createdAt: index + 1,
    }));

    const saved = await saveHistorySessions(sessions);
    expect(saved).toHaveLength(50);
    expect(saved[0].sessionId).toBe('s_54');
  });

  it('appendHistorySession adaugă sesiunea nouă și menține sortarea', async () => {
    await appendHistorySession({ sessionId: 's_old', createdAt: 1000 });
    await appendHistorySession({ sessionId: 's_new', createdAt: 2000 });

    const sessions = await getHistorySessions();
    expect(sessions.map(item => item.sessionId)).toEqual(['s_new', 's_old']);
  });
});
