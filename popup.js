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

let isClickeble = true;
scrapeColorBtn.addEventListener('click',async ()=>{
  console.log("Inside scrape colors ")
  const colors = isClickeble && await scrapeAllColors();
  console.log(colors)
  isClickeble = false;
  if(colors.length != 0){
    for(let color of colors){
      const scrapedDivChild = document.createElement( 'div' );
      scrapedDivChild.className = 'scrapedDivChild';
      scrapedDivChild.style.backgroundColor = color;
      scrapedColorsDiv.appendChild(scrapedDivChild);
    }
  }
})


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
      console.error("Error scraping colors:", err);
      throw err;
  }
}
