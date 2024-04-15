const btn = document.querySelector(".changeColorBtn");
const colorGrid = document.querySelector(".colorGrid");
const colorValue = document.querySelector(".colorValue");

window.addEventListener('load',()=>{
  const lastColor = localStorage.getItem("lastColor")
  if(lastColor){
    colorGrid.style.backgroundColor = lastColor;
    colorValue.textContent = lastColor;
  }
})

btn.addEventListener("click", async () => {
  // alert("Pick colors from anywhere including outside the browser... ")
  try {
    document.querySelector('body').style.height = "0px";
    const color = await colorPicker();
    // window.close();
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
  console.log("inside colorPicker");
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const eyeDropper = new EyeDropper();
    const { sRGBHex } = await eyeDropper.open();
    console.log("After await", sRGBHex);
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




async function  scrapeAllColors (){
  const colors = [];
  const allElements = Array.from(document.querySelectorAll("*"));
  console.log("Number of elements found:", allElements.length);
  allElements.forEach((element)=>{
  const style = window.getComputedStyle(element);
  console.log("Computed styles for element:", style);
  console.log("Color:", style.color, "Background Color:", style.backgroundColor);
  colors.push(style.color);
  colors.push(style.backgroundColor);
});
}
scrapeAllColors();