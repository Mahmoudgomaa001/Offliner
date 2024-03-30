const btn = document.querySelector("button.btn");
const output = document.querySelector(".output span");

let count = 0;

btn.addEventListener("click", () => {
  output.textContent = ++count;
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
