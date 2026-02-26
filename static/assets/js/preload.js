window.onload = function() {
	let scope;
	const vercelCheck = localStorage.getItem('isVercel');
	const swAllowedHostnames = ["localhost", "127.0.0.1"];
	const wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";
	
	// Points to the UV bundle to initialize the BareMux worker
	const connection = new BareMux.BareMuxConnection("/uv/uv.bundle.js");

	function isMobile() {
		let details = navigator.userAgent;
		let regexp = /android|iphone|kindle|ipad/i;
		return !!regexp.test(details);
	}

	async function registerSW() {
		if (!navigator.serviceWorker) {
			if (location.protocol !== "https:" && !swAllowedHostnames.includes(location.hostname)) throw new Error("Service workers cannot be registered without https.");
			throw new Error("Your browser doesn't support service workers.");
		}
		
		// Set transport to use the UV bundle and the /seal/ endpoint from uv.config.js
		await connection.setTransport("/uv/uv.bundle.js", ["/seal/"]);

		// Register Service Workers from the static root
		await window.navigator.serviceWorker.register("/sw.js", {
			scope: '/service/',
		});
		await window.navigator.serviceWorker.register("/lab.js", {
			scope: '/assignments/',
		});

		async function fetchDomains() {
			const response = await fetch('/data/b-list.json');
			const data = await response.json();
			return data.domains;
		}

		function createDomainRegex(domains) {
			const escapedDomains = domains.map(domain => domain.replace(/\./g, '\\.'));
			return new RegExp(escapedDomains.join('|') + '(?=[/\\s]|$)', 'i');
		}

		const domains = await fetchDomains();
		const domainRegex = createDomainRegex(domains);
		const searchValue = Ultraviolet.codec.xor.decode(localStorage.getItem("encodedUrl"));
		
		if (isMobile()) {
			scope = '/assignments/';
		} else if (!vercelCheck) {
			if (domainRegex.test(searchValue)) {
				scope = '/assignments/';
			} else {
				scope = '/service/';
			}
		} else {
			scope = '/assignments/';
		}
		
		let encodedUrl = localStorage.getItem("encodedUrl");
		if (encodedUrl) {
			encodedUrl = scope + encodedUrl;
			const siteFrame = document.querySelector("#siteurl");
			if (siteFrame) siteFrame.src = encodedUrl;
		}
	}

	/* Tab Cloaking / History Logic */
	function rndAbcString(length) {
		const characters = "abcdefghijklmnopqrstuvw0123456789012345";
		let result = "";
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length));
		}
		return result;
	}

	var randomAlphanumericString = rndAbcString(7);
	var url = "/mastery?auth=" + randomAlphanumericString;
	var title = "Google Docs";
	history.pushState({}, title, url);
	
	registerSW();
	if (typeof live === "function") live();
};
