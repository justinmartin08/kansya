let earbudsImg: any;
let keyboardImg: any;
let gamingSetupImg: any;
let palworldImg: any;
let laptopImg: any;
let phoneImg: any;
let collegeImg: any;
let headphonesImg: any;
let shoesImg: any;
let travelImg: any;
let mascotAvatarImg: any;
let homeHeroPiggyImg: any;
let wishlistHeroImg: any;
let wishlistFooterImg: any;

try {
  earbudsImg = require('../../assets/images/earbuds.jpg');
  keyboardImg = require('../../assets/images/keyboard.jpg');
  gamingSetupImg = require('../../assets/images/gaming_setup.jpg');
  palworldImg = require('../../assets/images/palworld.jpg');
  laptopImg = require('../../assets/images/laptop.jpg');
  phoneImg = require('../../assets/images/phone.jpg');
  collegeImg = require('../../assets/images/college.jpg');
  headphonesImg = require('../../assets/images/headphones.jpg');
  shoesImg = require('../../assets/images/shoes.jpg');
  travelImg = require('../../assets/images/travel.jpg');
  mascotAvatarImg = require('../../assets/images/mascot_avatar.png');
  homeHeroPiggyImg = require('../../assets/images/home_hero_piggy.png');
  wishlistHeroImg = require('../../assets/images/wishlist_hero.png');
  wishlistFooterImg = require('../../assets/images/wishlist_footer.png');
} catch {
  earbudsImg = { uri: 'assets/images/earbuds.jpg' };
  keyboardImg = { uri: 'assets/images/keyboard.jpg' };
  gamingSetupImg = { uri: 'assets/images/gaming_setup.jpg' };
  palworldImg = { uri: 'assets/images/palworld.jpg' };
  laptopImg = { uri: 'assets/images/laptop.jpg' };
  phoneImg = { uri: 'assets/images/phone.jpg' };
  collegeImg = { uri: 'assets/images/college.jpg' };
  headphonesImg = { uri: 'assets/images/headphones.jpg' };
  shoesImg = { uri: 'assets/images/shoes.jpg' };
  travelImg = { uri: 'assets/images/travel.jpg' };
  mascotAvatarImg = { uri: 'assets/images/mascot_avatar.png' };
  homeHeroPiggyImg = { uri: 'assets/images/home_hero_piggy.png' };
  wishlistHeroImg = { uri: 'assets/images/wishlist_hero.png' };
  wishlistFooterImg = { uri: 'assets/images/wishlist_footer.png' };
}

export const PROJECT_IMAGES: Record<string, any> = {
  earbuds: earbudsImg,
  keyboard: keyboardImg,
  gaming_setup: gamingSetupImg,
  palworld: palworldImg,
  laptop: laptopImg,
  phone: phoneImg,
  college: collegeImg,
  headphones: headphonesImg,
  shoes: shoesImg,
  travel: travelImg,
  mascot_avatar: mascotAvatarImg,
  home_hero_piggy: homeHeroPiggyImg,
  wishlist_hero: wishlistHeroImg,
  wishlist_footer: wishlistFooterImg,
};

export const getProjectImage = (imageKey?: string, category?: string) => {
  if (imageKey && Object.prototype.hasOwnProperty.call(PROJECT_IMAGES, imageKey)) {
    return PROJECT_IMAGES[imageKey];
  }
  if (category === 'game') return PROJECT_IMAGES.gaming_setup;
  if (category === 'gadget') return PROJECT_IMAGES.keyboard;
  return PROJECT_IMAGES.earbuds;
};

