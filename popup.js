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
