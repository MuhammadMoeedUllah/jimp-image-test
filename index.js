const Jimp = require('jimp')

/**
 * The X axis of the font used in jimp
 *
 * @type {number}
 */

const IMAGE_X_AXIS = 5

/**
 * The X axis of the font used in jimp
 *
 * @type {number}
 */
const IMAGE_Y_AXIS = 50

/**
 * The background color for jimp image
 *
 * @type {string}
 */
const BACKGROUND_COLOR = 'blue'

/**
 * The background color for jimp image
 *
 * @type {number}
 */
const JIMP_IMG_PIXEL_HEIGHT = 200

/**
 * The font used in jimp image generation
 *
 * @type {number}
 */
const JIMP_TEXT_FONT = Jimp.FONT_SANS_64_BLACK

/**
 * 
 * @param {string} text 
 * @returns number of pixels required to fit the text
 */
const getImageWidth = (text) => {
    let upperCaselLetters = 0;
    let lowerCaseLetters = 0;
    for (let each of text){
        if (each === each.toUpperCase() ){upperCaselLetters +=1}
        if (each === each.toLowerCase() ){lowerCaseLetters +=1}
    }   
    // calculating pixels required for each letter
    return upperCaselLetters*40 + lowerCaseLetters*40
}

/**
 * generateImage : creates a new image based on provided text.
 * @param {string} brandName 
 * @returns jimp image object
 */
const generateImage = async (brandName) => {
    /**
     * width : the width of the image calculated based on the text length and
     * type of characters; This is not the best way to do it though I need get a 
     * good formula to calculate it.
     */
    const widthOfImage= getImageWidth(brandName)
    
    const image = new Jimp(widthOfImage, JIMP_IMG_PIXEL_HEIGHT , BACKGROUND_COLOR);
    const font = await Jimp.loadFont(JIMP_TEXT_FONT);
    image.print(font, IMAGE_X_AXIS, IMAGE_Y_AXIS, brandName);
    return image ;
}


//// ================================================= ////
/*                USAGE                                 */
//// ================================================= ////
/*
productName = 'webex services'
generateImage(productName).then((image) => {
    const file = `new_name.${image.getExtension()}`;
    image.write(file);
})
*/

module.exports = {generateImage}