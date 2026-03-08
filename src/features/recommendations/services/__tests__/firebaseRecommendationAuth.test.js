/** @format */

const loadAuthModule = () => {
  jest.resetModules();
  jest.doMock('firebase/auth', () => ({
    onAuthStateChanged: jest.fn(),
  }));

  const firebaseAuth = require('firebase/auth');
  const recommendationAuth = require('../firebaseRecommendationAuth');

  return {
    firebaseAuth,
    recommendationAuth,
  };
};

describe('firebaseRecommendationAuth', () => {
  it('returnează userul autentificat existent', async () => {
    const { firebaseAuth, recommendationAuth } = loadAuthModule();
    const user = { uid: 'user_1', isAnonymous: false };

    const result = await recommendationAuth.requireRecommendationUser({
      currentUser: user,
    });

    expect(result).toBe(user);
    expect(firebaseAuth.onAuthStateChanged).not.toHaveBeenCalled();
  });

  it('așteaptă restaurarea sesiunii și returnează userul autentificat', async () => {
    const { firebaseAuth, recommendationAuth } = loadAuthModule();
    const firebaseInstance = { currentUser: null };
    const restoredUser = { uid: 'user_2', isAnonymous: false };

    firebaseAuth.onAuthStateChanged.mockImplementation(
      (auth, onNext, _onError) => {
        Promise.resolve().then(() => {
          auth.currentUser = restoredUser;
          onNext(restoredUser);
        });

        return () => {};
      },
    );

    const result = await recommendationAuth.requireRecommendationUser(
      firebaseInstance,
    );

    expect(result).toBe(restoredUser);
  });

  it('aruncă login-required când nu există user', async () => {
    const { firebaseAuth, recommendationAuth } = loadAuthModule();

    firebaseAuth.onAuthStateChanged.mockImplementation(
      (_auth, onNext, _onError) => {
        Promise.resolve().then(() => onNext(null));
        return () => {};
      },
    );

    await expect(
      recommendationAuth.requireRecommendationUser({ currentUser: null }),
    ).rejects.toMatchObject({
      code: recommendationAuth.RECOMMENDATION_LOGIN_REQUIRED_CODE,
    });
  });

  it('aruncă login-required când userul curent este anonim', async () => {
    const { recommendationAuth } = loadAuthModule();

    await expect(
      recommendationAuth.requireRecommendationUser({
        currentUser: { uid: 'anon_1', isAnonymous: true },
      }),
    ).rejects.toMatchObject({
      code: recommendationAuth.RECOMMENDATION_LOGIN_REQUIRED_CODE,
    });
  });
});
