let earbudsImg: any;
let keyboardImg: any;
let gamingSetupImg: any;
let palworldImg: any;

try {
  earbudsImg = require('../../assets/images/earbuds.jpg');
  keyboardImg = require('../../assets/images/keyboard.jpg');
  gamingSetupImg = require('../../assets/images/gaming_setup.jpg');
  palworldImg = require('../../assets/images/palworld.jpg');
} catch {
  earbudsImg = { uri: 'assets/images/earbuds.jpg' };
  keyboardImg = { uri: 'assets/images/keyboard.jpg' };
  gamingSetupImg = { uri: 'assets/images/gaming_setup.jpg' };
  palworldImg = { uri: 'assets/images/palworld.jpg' };
}

export const PROJECT_IMAGES: Record<string, any> = {
  earbuds: earbudsImg,
  keyboard: keyboardImg,
  gaming_setup: gamingSetupImg,
  palworld: palworldImg,
};

export const getProjectImage = (imageKey?: string, category?: string) => {
  if (imageKey && Object.prototype.hasOwnProperty.call(PROJECT_IMAGES, imageKey)) {
    return PROJECT_IMAGES[imageKey];
  }
  if (category === 'game') return PROJECT_IMAGES.gaming_setup;
  if (category === 'gadget') return PROJECT_IMAGES.keyboard;
  return PROJECT_IMAGES.earbuds;
};
