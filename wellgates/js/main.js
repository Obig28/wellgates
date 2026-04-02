(function () {
  "use strict";

  /** Smooth scroll for same-page anchors */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var id = this.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
        closeNav();
      });
    });
  }

  function closeNav() {
    var nav = document.querySelector(".main-nav");
    var toggle = document.querySelector(".nav-toggle");
    if (nav && toggle) {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    }
  }

  function initStickyHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;

    function update() {
      var y = window.scrollY || document.documentElement.scrollTop;
      header.classList.toggle("is-scrolled", y > 10);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  function initScrollReveal() {
    var sections = document.querySelectorAll(".reveal");
    if (!sections.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sections.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    sections.forEach(function (el) {
      observer.observe(el);
    });
  }

  function initFAQ() {
    var list = document.getElementById("faq-list");
    if (!list) return;

    function closeAll() {
      list.querySelectorAll(".faq-item").forEach(function (item) {
        item.classList.remove("is-open");
        var btn = item.querySelector(".faq-question");
        var panelId = btn && btn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        if (btn) btn.setAttribute("aria-expanded", "false");
        if (panel) panel.hidden = true;
      });
    }

    list.querySelectorAll(".faq-question").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".faq-item");
        var panelId = btn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!item || !panel) return;

        var wasOpen = item.classList.contains("is-open");
        closeAll();

        if (!wasOpen) {
          item.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.hidden = false;
        }
      });
    });
  }

  function setNavOpen(isOpen) {
    document.body.classList.toggle("nav-open", isOpen);
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      setNavOpen(open);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });

    nav.querySelectorAll("a").forEach(function (link) {
      if (link.getAttribute("href") && !link.getAttribute("href").startsWith("#")) {
        link.addEventListener("click", closeNav);
      }
    });
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var successEl = document.getElementById("contact-form-success");
    var fieldIds = ["contact-name", "contact-phone", "contact-email", "contact-message"];

    function digitsOnly(s) {
      return String(s).replace(/\D/g, "");
    }

    function isValidEmail(s) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
    }

    function setFieldError(input, message) {
      var err = document.getElementById(input.getAttribute("aria-describedby"));
      if (err) err.textContent = message || "";
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (message) input.classList.add("has-error");
      else input.classList.remove("has-error");
    }

    function clearFieldError(input) {
      setFieldError(input, "");
    }

    function validate() {
      var ok = true;
      var nameEl = document.getElementById("contact-name");
      var phoneEl = document.getElementById("contact-phone");
      var emailEl = document.getElementById("contact-email");
      var msgEl = document.getElementById("contact-message");

      var name = nameEl ? nameEl.value.trim() : "";
      if (!name) {
        setFieldError(nameEl, "Please enter your name.");
        ok = false;
      } else if (name.length < 2) {
        setFieldError(nameEl, "Name must be at least 2 characters.");
        ok = false;
      } else {
        clearFieldError(nameEl);
      }

      var phoneDigits = phoneEl ? digitsOnly(phoneEl.value) : "";
      if (!phoneEl.value.trim()) {
        setFieldError(phoneEl, "Please enter a phone number.");
        ok = false;
      } else if (phoneDigits.length < 10) {
        setFieldError(phoneEl, "Enter a valid phone number (at least 10 digits).");
        ok = false;
      } else {
        clearFieldError(phoneEl);
      }

      var email = emailEl ? emailEl.value.trim() : "";
      if (!email) {
        setFieldError(emailEl, "Please enter your email address.");
        ok = false;
      } else if (!isValidEmail(email)) {
        setFieldError(emailEl, "Enter a valid email address.");
        ok = false;
      } else {
        clearFieldError(emailEl);
      }

      var msg = msgEl ? msgEl.value.trim() : "";
      if (!msg) {
        setFieldError(msgEl, "Please enter a message.");
        ok = false;
      } else if (msg.length < 10) {
        setFieldError(msgEl, "Message must be at least 10 characters.");
        ok = false;
      } else {
        clearFieldError(msgEl);
      }

      return ok;
    }

    function hideSuccess() {
      if (successEl) {
        successEl.hidden = true;
      }
    }

    function showSuccess() {
      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        successEl.focus();
      }
    }

    fieldIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () {
        hideSuccess();
        clearFieldError(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideSuccess();

      if (!validate()) {
        var firstInvalid = form.querySelector(".has-error");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      form.reset();
      fieldIds.forEach(function (id) {
        var el = document.getElementById(id);
        if (el) clearFieldError(el);
      });
      showSuccess();
    });
  }

  function initLoanCalculator() {
    var form = document.getElementById("loan-calculator-form");
    if (!form) return;

    var amount = document.getElementById("loan-amount");
    var rate = document.getElementById("annual-rate");
    var monthsEl = document.getElementById("loan-months");
    var monthlyOut = document.getElementById("monthly-payment");
    var totalOut = document.getElementById("total-payment");
    var interestOut = document.getElementById("total-interest");

    function formatMoney(n) {
      return n.toLocaleString(undefined, {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    /** Fixed-rate loan: monthly payment = P * r(1+r)^n / ((1+r)^n - 1), r = annual%/12, n = months */
    function calculate() {
      var P = parseFloat(amount && amount.value) || 0;
      var annual = parseFloat(rate && rate.value) || 0;
      var n = Math.floor(parseFloat(monthsEl && monthsEl.value) || 0);
      if (n < 0) n = 0;

      var monthly = 0;
      var total = 0;

      if (P > 0 && n > 0) {
        var r = annual / 100 / 12;
        if (r === 0) {
          monthly = P / n;
        } else {
          monthly = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        }
        total = monthly * n;
      }

      var interest = Math.max(0, total - P);

      if (monthlyOut) monthlyOut.textContent = formatMoney(monthly);
      if (totalOut) totalOut.textContent = formatMoney(total);
      if (interestOut) interestOut.textContent = formatMoney(interest);
    }

    form.addEventListener("input", calculate);
    form.addEventListener("change", calculate);
    calculate();
  }

  function initLoginForm() {
    var form = document.getElementById("login-form");
    if (!form) return;

    var successEl = document.getElementById("login-form-success");
    var emailEl = document.getElementById("login-email");
    var passEl = document.getElementById("login-password");

    function isValidEmail(s) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());
    }

    function setFieldError(input, message) {
      if (!input) return;
      var err = document.getElementById(input.getAttribute("aria-describedby"));
      if (err) err.textContent = message || "";
      input.setAttribute("aria-invalid", message ? "true" : "false");
      if (message) input.classList.add("has-error");
      else input.classList.remove("has-error");
    }

    function clearFieldError(input) {
      setFieldError(input, "");
    }

    function validate() {
      var ok = true;
      var email = emailEl ? emailEl.value.trim() : "";
      if (!email) {
        setFieldError(emailEl, "Please enter your email.");
        ok = false;
      } else if (!isValidEmail(email)) {
        setFieldError(emailEl, "Enter a valid email address.");
        ok = false;
      } else {
        clearFieldError(emailEl);
      }

      var pass = passEl ? passEl.value : "";
      if (!pass) {
        setFieldError(passEl, "Please enter your password.");
        ok = false;
      } else if (pass.length < 8) {
        setFieldError(passEl, "Password must be at least 8 characters.");
        ok = false;
      } else {
        clearFieldError(passEl);
      }

      return ok;
    }

    function hideSuccess() {
      if (successEl) successEl.hidden = true;
    }

    function showSuccess() {
      if (successEl) {
        successEl.hidden = false;
        successEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        successEl.focus();
      }
    }

    [emailEl, passEl].forEach(function (el) {
      if (!el) return;
      el.addEventListener("input", function () {
        hideSuccess();
        clearFieldError(el);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      hideSuccess();

      if (!validate()) {
        var firstInvalid = form.querySelector(".has-error");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      showSuccess();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStickyHeader();
    initScrollReveal();
    initFAQ();
    initSmoothScroll();
    initMobileNav();
    initContactForm();
    initLoginForm();
    initLoanCalculator();
  });
})();
