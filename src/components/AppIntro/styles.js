/** @format */

export default {
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  bottomOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 230,
    backgroundColor: 'rgba(16, 18, 42, 0.18)',
  },
  icon: {
    backgroundColor: 'transparent',
  },
  page1BrandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 246,
    height: 246,
    borderRadius: 123,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 205,
    height: 205,
  },
  openWorldWrap: {
    marginTop: 14,
    width: 308,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  openWorldLogo: {
    width: 288,
    height: 72,
  },
  image: {
    width: 320,
    height: 320,
  },
  textWrap: {
    paddingBottom: 10,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.78)',
    backgroundColor: 'transparent',
    textAlign: 'center',
    paddingHorizontal: 16,
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 25,
    fontWeight: '700',
    color: 'white',
    backgroundColor: 'transparent',
    textAlign: 'center',
    marginBottom: 12,
  },
  buttonCircle: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, .2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationContainer: bottomInset => ({
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 50 + bottomInset,
    justifyContent: 'center',
    minHeight: 48,
  }),
  paginationDots: {
    height: 16,
    margin: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: 'rgba(0, 0, 0, .2)',
  },
  activeDot: {
    backgroundColor: 'rgba(255, 255, 255, .9)',
  },
  paginationButtonTouch: {
    position: 'absolute',
    right: 0,
  },
  paginationButtonTouchRtl: {
    left: 0,
    right: undefined,
  },
};
