const form = document.querySelector("form");
const input = document.querySelector("input");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (typeof __uv$config === 'undefined') {
        alert("Proxy engine not loaded yet. Please refresh.");
        return;
    }

    let url = input.value.trim();
    if (!/^http(s?):\/\//.test(url) && !url.includes(".")) {
        url = "https://duckduckgo.com/?q=" + encodeURIComponent(url);
    } else if (!/^http(s?):\/\//.test(url)) {
        url = "https://" + url;
    }

    localStorage.setItem("encodedUrl", __uv$config.encodeUrl(url));
    location.href = "/mastery";
});
