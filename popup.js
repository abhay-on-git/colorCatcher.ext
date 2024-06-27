const btn = document.querySelector(".changeColorBtn");
const colorGrid = document.querySelector(".colorGrid");
const colorValue = document.querySelector(".colorValue");
const scrapeColorBtn = document.querySelector(".scrapeColorBtn");
const scrapedColorsDiv = document.querySelector(".scrapedColorsDiv")

window.addEventListener('load',()=>{
  const lastColor = localStorage.getItem("lastColor")
  if(lastColor){
    colorGrid.style.backgroundColor = lastColor;
    colorValue.textContent = lastColor;
  }
})

btn.addEventListener("click", async () => {
  try {
    const color = await colorPicker();
    localStorage.setItem("lastColor", color);
    copyToClipboard(color);
    colorGrid.style.backgroundColor = color;
    colorValue.textContent = color;
  } catch (err) {
    console.error(err);
    colorValue.textContent = "No access to the eye dropper API";
  }
});

// Color Picking Code

async function colorPicker() {
  // console.log("inside colorPicker");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const eyeDropper = new EyeDropper();
    const { sRGBHex } = await eyeDropper.open();
    // console.log("After await", sRGBHex);
    return sRGBHex;
  } catch (err) {
    console.error(err);
    throw new Error("No access to the eye dropper API");
  }
}

async function copyToClipboard(text) {
 await navigator.clipboard.writeText(text);
}


// Scraping Color code

let isScraped = false;

scrapeColorBtn.addEventListener('click', async () => {
  if (isScraped) {
    // Remove all scraped div children
    while (scrapedColorsDiv.firstChild) {
      scrapedColorsDiv.removeChild(scrapedColorsDiv.firstChild);
    }
    scrapedColorsDiv.style.height = 'initial'; 
    isScraped = false;
  } else {
    // Scrape colors and display them
    const colors = await scrapeAllColors();
    // console.log(colors);
    
    if (colors.length !== 0) {
      for (let color of colors) {
        const scrapedDivChild = document.createElement('div');
        scrapedDivChild.className = 'scrapedDivChild';
        scrapedDivChild.style.backgroundColor = color;
        scrapedColorsDiv.appendChild(scrapedDivChild);
        scrapedDivChild.addEventListener('click', () => {
          const hexColor = rgbToHex(color)
          copyScrapedDivChildColorCode(hexColor)
          console.log(hexColor);
        });
      }
    }
    isScraped = true;
  }
});

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g).map(Number);
  return `#${result.map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}


const copyScrapedDivChildColorCode = (color) => {
  navigator.clipboard.writeText(color);
  scrapeColorBtn.innerText = "Copied";
  setTimeout(() => scrapeColorBtn.innerText = "Scrape on", 1600);
}



async function scrapeAllColors() {
  try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Inject a content script into the active tab
      const colors = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
              const colorsSet = new Set();
              const allElements = Array.from(document.querySelectorAll("*"));
              allElements.forEach((element) => {
                  const style = window.getComputedStyle(element);
                  colorsSet.add(style.color);
                  colorsSet.add(style.backgroundColor);
              });
              return Array.from(colorsSet); // Convert set to array for returning
          }
      });
      
      // Retrieve the result from the content script execution
      const colorsResult = colors[0].result;
      return colorsResult;

  } catch (err) {
      // console.error("Error scraping colors:", err);
      throw err;
  }
}

// Gradient generator code 
const generateGradientBtn = document.querySelector('.generateGradientBtn');
const wrapper = document.querySelector('.wrapper');

let isOpened = false;
generateGradientBtn.addEventListener( "click" , ()=>{
  if (!isOpened){
    wrapper.style.height = 'auto';
    isOpened = true;
  }else{
    wrapper.style.height = '0px'; 
    isOpened = false; 
  }
} );

const gradientBox = document.querySelector(".gradient-box");
const selectMenu = document.querySelector(".select-box select");
const colorInputs = document.querySelectorAll(".colors input");
const textarea = document.querySelector("textarea");
const refreshBtn = document.querySelector(".refresh");
const copyBtn = document.querySelector(".copy");

const getRandomColor = () => {
    // Generating a random color in hexadecimal format. Example: #5665E9
    const randomHex = Math.floor(Math.random() * 0xffffff).toString(16);
    return `#${randomHex}`;
}

const generateGradient = (isRandom) => {
    if(isRandom) { // If isRandom is true, update the colors inputs value with random color
        colorInputs[0].value = getRandomColor();
        colorInputs[1].value = getRandomColor();
    }
    // Creating a gradient string using the select menu value with color input values
    const gradient = `linear-gradient(${selectMenu.value}, ${colorInputs[0].value}, ${colorInputs[1].value})`;
    gradientBox.style.background = gradient;
    textarea.value = `background: ${gradient};`;
}

const copyCode = () => {
    // Copying textarea value and updating the copy button text
    navigator.clipboard.writeText(textarea.value);
    copyBtn.innerText = "Code Copied";
    setTimeout(() => copyBtn.innerText = "Copy Code", 1600);
}

colorInputs.forEach(input => {
    // Calling generateGradient function on each color input clicks
    input.addEventListener("input", () => generateGradient(false));
});

selectMenu.addEventListener("change", () => generateGradient(false));
refreshBtn.addEventListener("click", () => generateGradient(true));
copyBtn.addEventListener("click", copyCode);