const btn = document.querySelector("button.btn");
const output = document.querySelector(".output span");

let count = 0;

btn.addEventListener("click", () => {
  output.textContent = ++count;
});

handleShareTargetParams()

let params = [];
for (const [key, value] of new URLSearchParams(location.search).entries()) {
  params.push(`${key}: ${value}`);
}

document.querySelector(".url-params").innerHTML = params.join("<br><br>");

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}

function handleShareTargetParams() {
  const searchParams = new URLSearchParams(location.search);
  let params = [];
  for (const [key, value] of searchParams.entries()) {
    params.push(`${key}: ${value}`);
  }

  if (searchParams.has("description")) {
    document.querySelector('form input[type="url"]').value =
      searchParams.get("description");
  }

  document.querySelector(".url-params").innerHTML = params.join("<br><br>");
}
