// Nav state (dark over hero, light after) + scroll-reveal + booking form. No frameworks.

(function () {
  var nav = document.getElementById("nav");
  var hero = document.getElementById("hero");

  var onScroll = function () {
    var y = window.scrollY;
    nav.classList.toggle("scrolled", y > 12);
    // Cream text while the dark hero is behind the nav; ink text afterwards.
    nav.classList.toggle("nav-dark", y < hero.offsetHeight - 70);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  // Reveal sections as they enter the viewport
  var reveals = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -36px 0px" }
  );

  reveals.forEach(function (el) { observer.observe(el); });
})();

// Booking form. FormSubmit (formsubmit.co) relays each submission as an email.
(function () {
  var EMAIL_TO = "abhirajtiwari0102@gmail.com";
  var EMAIL_CC = ["nandnived08@gmail.com"];

  var form = document.getElementById("book-form");
  var service = document.getElementById("book-service");
  var status = document.getElementById("book-status");
  if (!form) return;

  // Any "book" button preselects what the visitor clicked on
  document.querySelectorAll("[data-service]").forEach(function (el) {
    el.addEventListener("click", function () { service.value = el.dataset.service; });
  });

  var setStatus = function (msg, kind) {
    status.textContent = msg;
    status.className = "book-status" + (kind ? " " + kind : "");
  };

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    var bad = Array.prototype.filter.call(form.querySelectorAll("[required]"), function (el) {
      var invalid = !el.value.trim() || !el.checkValidity();
      el.classList.toggle("invalid", invalid);
      return invalid;
    });
    if (bad.length) {
      setStatus("Please fill in your name, a valid email, and a phone number.", "err");
      bad[0].focus();
      return;
    }

    var data = {};
    new FormData(form).forEach(function (v, k) { data[k] = v; });
    data._subject = "New " + data.service + " request from " + data.name;
    data._cc = EMAIL_CC.join(",");
    data._template = "table";

    var button = form.querySelector("button[type=submit]");
    button.disabled = true;
    setStatus("Sending…");

    fetch("https://formsubmit.co/ajax/" + EMAIL_TO, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok || String(j.success) !== "true") throw j; }); })
      .then(function () {
        form.reset();
        setStatus("Got it. We’ll be in touch soon.", "ok");
      })
      .catch(function () {
        setStatus("That didn’t go through. Email us at " + EMAIL_TO + " instead.", "err");
      })
      .then(function () { button.disabled = false; });
  });
})();
