/** @format */

const lazyDefault = (name, loader) => {
  Object.defineProperty(exports, name, {
    enumerable: true,
    get: () => {
      const mod = loader();
      return mod?.default ?? mod;
    },
  });
};

lazyDefault('Button', () => require('./Button/Button'));
lazyDefault('ButtonIndex', () => require('./Button'));
lazyDefault('ProductSize', () => require('./ProductSize'));
lazyDefault('ProductColor', () => require('./ProductColor'));
lazyDefault('TextInput', () => require('./TextInput'));
lazyDefault('ShippingMethod', () => require('./ShippingMethod'));
lazyDefault('TabBarIcon', () => require('./TabBarIcon'));
lazyDefault('ToolbarIcon', () => require('./ToolbarIcon'));
lazyDefault('NavigationBarIcon', () => require('./NavigationBarIcon'));
lazyDefault('CartIcon', () => require('./CartIcon'));
lazyDefault('CartIcons', () => require('./CartIcons'));
lazyDefault('TabBar', () => require('./TabBar'));
lazyDefault('Search', () => require('./Search'));
lazyDefault('Rating', () => require('./Rating'));
lazyDefault('PostBanner', () => require('./PostBanner'));
lazyDefault('PostList', () => require('./PostList'));
lazyDefault('FlatButton', () => require('./FlatButton'));
lazyDefault('ShopButton', () => require('./ShopButton'));
lazyDefault('PostLayout', () => require('./PostLayout'));
lazyDefault('LogoSpinner', () => require('./LogoSpinner'));
lazyDefault('Spinner', () => require('./Spinner'));
lazyDefault('Spinkit', () => require('./Spinkit'));
lazyDefault('WishListIcon', () => require('./WishListIcon'));
lazyDefault('ProductPrice', () => require('./ProductPrice'));
lazyDefault('Empty', () => require('./Empty'));
lazyDefault('CategorySlider', () => require('./CategorySlider'));
lazyDefault('Video', () => require('./Video'));
lazyDefault('WebView', () => require('./WebView'));
lazyDefault('ProductItem', () => require('./ProductItem'));
lazyDefault('StepIndicator', () => require('./StepIndicator'));
lazyDefault('Accordion', () => require('./Accordion'));
lazyDefault('Drawer', () => require('./Drawer'));
lazyDefault('ProductRelated', () => require('./ProductRelated'));
lazyDefault('AdMob', () => require('./AdMob'));
lazyDefault('ImageCache', () => require('./ImageCache'));
lazyDefault('AnimatedHeader', () => require('./AnimatedHeader'));
lazyDefault('AppIntro', () => require('./AppIntro'));
lazyDefault('SafeAreaView', () => require('./SafeAreaView'));
lazyDefault('UserProfileHeader', () => require('./UserProfileHeader'));
lazyDefault('UserProfileItem', () => require('./UserProfileItem'));
lazyDefault('CurrencyPicker', () => require('./CurrencyPicker'));
lazyDefault('Text', () => require('./Text'));
lazyDefault('ModalBox', () => require('./Modal'));
lazyDefault('ModalLayout', () => require('./Modal/Layout'));
lazyDefault('HorizonLayout', () => require('./HorizonLayout'));
lazyDefault('HorizonList', () => require('./HorizonList'));
lazyDefault('ProductList', () => require('./ProductList'));
lazyDefault('CategoryCarousel', () => require('./CategoryCarousel'));
lazyDefault('SideMenu', () => require('./SideMenu'));
lazyDefault('ModalReview', () => require('./Modal/Review'));
lazyDefault('Review', () => require('./Review'));
lazyDefault('SplitCategories', () => require('./SplitCategories'));
lazyDefault('TouchableScale', () => require('./TouchableScale'));
lazyDefault('ConfirmCheckout', () => require('./ConfirmCheckout'));
lazyDefault('Chips', () => require('./Chips'));
lazyDefault('ProductCatalog', () => require('./ProductCatalog'));
lazyDefault('ProductTags', () => require('./ProductTags'));
lazyDefault('AddressItem', () => require('./AddressItem'));
lazyDefault('SlideItem', () => require('./SlideItem'));
lazyDefault('ExpandComponent', () => require('./ExpandComponent'));
lazyDefault('BannerSlider', () => require('./HorizonLayout/BannerSlider'));
lazyDefault('BannerImage', () => require('./HorizonLayout/BannerImage'));
lazyDefault('TextHighlight', () => require('./TextHighlight'));
lazyDefault('ColumnCategories', () => require('./ColumnCategories'));
lazyDefault('SubCategories', () => require('./SubCategories'));
lazyDefault('ActionSheets', () => require('./ActionSheets'));
lazyDefault('DisCount', () => require('./DisCount'));
lazyDefault('BlogList', () => require('./BlogList'));
lazyDefault('TabBarIconHome', () => require('./TabBarIconHome'));
lazyDefault('PickerBox', () => require('./PickerBox'));
lazyDefault('SelectCountry', () => require('./SelectCountry'));
