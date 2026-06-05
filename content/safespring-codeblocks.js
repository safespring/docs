(function () {
  var sidebarScrollKeyPrefix = "safespring:sidebar-scroll:";

  function inferLanguage(code) {
    var className = code.className || "";
    var classMatch = className.match(/(?:^|\s)language-([^\s]+)/);
    if (classMatch) return classMatch[1];

    var text = code.textContent.trim();
    if (/^(ssh|scp|rsync|curl|openstack|terraform|kubectl|helm|sudo|apt|dnf|yum|export)\b/m.test(text)) {
      return "shell";
    }
    if (/^\s*[{[]/.test(text)) return "json";
    if (/^\s*</.test(text)) return "xml";
    if (/^\s*---?\s*$|^\s*[\w-]+:\s/m.test(text)) return "yaml";

    return "text";
  }

  function labelFor(language) {
    var labels = {
      bash: "Shell",
      shell: "Shell",
      sh: "Shell",
      zsh: "Shell",
      json: "JSON",
      yaml: "YAML",
      yml: "YAML",
      xml: "XML",
      html: "HTML",
      python: "Python",
      py: "Python",
      text: "Text"
    };

    return labels[language] || language.charAt(0).toUpperCase() + language.slice(1);
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll(".md-typeset pre > code").forEach(function (code) {
      var pre = code.parentElement;
      if (!pre || pre.dataset.safespringEnhanced === "true") return;

      pre.dataset.safespringEnhanced = "true";
      var language = inferLanguage(code);
      pre.dataset.safespringLanguage = language;

      var header = document.createElement("div");
      header.className = "safespring-code-header";

      var label = document.createElement("span");
      label.className = "safespring-code-language";
      label.textContent = labelFor(language);

      var button = document.createElement("button");
      button.className = "safespring-code-copy";
      button.type = "button";
      button.textContent = "Copy";
      button.setAttribute("aria-label", "Copy code");

      button.addEventListener("click", function () {
        navigator.clipboard.writeText(code.textContent).then(function () {
          button.textContent = "Copied";
          window.setTimeout(function () {
            button.textContent = "Copy";
          }, 1600);
        }).catch(function () {
          button.textContent = "Copy failed";
          window.setTimeout(function () {
            button.textContent = "Copy";
          }, 1600);
        });
      });

      header.appendChild(label);
      header.appendChild(button);
      pre.insertBefore(header, code);
    });
  }

  function imageAverageLuminance(image) {
    var sampleSize = 24;
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context || !image.naturalWidth || !image.naturalHeight) return null;

    canvas.width = sampleSize;
    canvas.height = sampleSize;
    context.drawImage(image, 0, 0, sampleSize, sampleSize);

    var pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
    var total = 0;
    var count = 0;

    for (var index = 0; index < pixels.length; index += 4) {
      var alpha = pixels[index + 3] / 255;
      if (alpha < 0.2) continue;

      var red = pixels[index];
      var green = pixels[index + 1];
      var blue = pixels[index + 2];
      total += 0.2126 * red + 0.7152 * green + 0.0722 * blue;
      count += 1;
    }

    return count ? total / count : null;
  }

  function classifyImageBrightness(image) {
    if (image.dataset.safespringImageChecked === "true") return;
    if (!image.complete || !image.naturalWidth) {
      image.addEventListener("load", function () {
        classifyImageBrightness(image);
      }, { once: true });
      return;
    }

    image.dataset.safespringImageChecked = "true";

    try {
      var luminance = imageAverageLuminance(image);
      if (luminance === null) return;

      image.dataset.safespringLuminance = String(Math.round(luminance));
      image.classList.toggle("safespring-image-light", luminance >= 172);
      image.classList.toggle("safespring-image-dark", luminance < 172);
    } catch (error) {
      image.dataset.safespringImageChecked = "failed";
    }
  }

  function enhanceImages() {
    document.querySelectorAll(".md-typeset img").forEach(classifyImageBrightness);
  }

  function closeMoreMenus(exceptItem) {
    document.querySelectorAll(".md-tabs__item--services.safespring-services-menu--open").forEach(function (item) {
      if (item === exceptItem) return;
      item.classList.remove("safespring-services-menu--open");
      var button = item.querySelector(".md-tabs__link--services");
      if (button) button.setAttribute("aria-expanded", "false");
    });

    if (!exceptItem) {
      var menu = document.getElementById("safespring-services-menu");
      if (menu) menu.classList.remove("safespring-services-menu--open");
    }
  }

  function positionMoreMenu(button, menu) {
    var buttonRect = button.getBoundingClientRect();
    var menuWidth = menu.getBoundingClientRect().width || 240;
    var padding = 8;
    var left = Math.min(buttonRect.right - menuWidth, window.innerWidth - menuWidth - padding);

    menu.style.setProperty("--safespring-more-menu-left", Math.max(padding, left) + "px");
    menu.style.setProperty("--safespring-more-menu-top", buttonRect.bottom + 4 + "px");
  }

  function enhanceMoreMenu() {
    document.querySelectorAll(".md-tabs__item--services").forEach(function (item) {
      if (item.dataset.safespringMoreEnhanced === "true") return;

      var button = item.querySelector(".md-tabs__link--services");
      var menu = document.getElementById("safespring-services-menu");
      if (!button || !menu) return;

      item.dataset.safespringMoreEnhanced = "true";

      button.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();

        var isOpen = item.classList.toggle("safespring-services-menu--open");
        closeMoreMenus(item);
        positionMoreMenu(button, menu);
        menu.classList.toggle("safespring-services-menu--open", isOpen);
        button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      });

      button.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowDown") return;
        event.preventDefault();
        item.classList.add("safespring-services-menu--open");
        positionMoreMenu(button, menu);
        menu.classList.add("safespring-services-menu--open");
        button.setAttribute("aria-expanded", "true");
        var firstLink = menu.querySelector("a");
        if (firstLink) firstLink.focus();
      });

      menu.addEventListener("click", function (event) {
        event.stopPropagation();
      });
    });
  }

  function sidebarScrollKey() {
    var section = window.location.pathname.split("/").filter(Boolean)[0] || "overview";
    return sidebarScrollKeyPrefix + section;
  }

  function rememberSidebarScroll(scrollwrap) {
    try {
      window.sessionStorage.setItem(sidebarScrollKey(), String(scrollwrap.scrollTop));
    } catch (error) {
      return;
    }
  }

  function enhanceSidebarScroll() {
    var scrollwrap = document.querySelector(".md-sidebar--primary .md-sidebar__scrollwrap");
    if (!scrollwrap) return;

    try {
      var scrollTop = window.sessionStorage.getItem(sidebarScrollKey());
      if (scrollTop !== null) {
        scrollwrap.scrollTop = Number(scrollTop) || 0;
      }
    } catch (error) {
      return;
    }

    if (scrollwrap.dataset.safespringScrollEnhanced === "true") return;

    scrollwrap.dataset.safespringScrollEnhanced = "true";
    scrollwrap.addEventListener("scroll", function () {
      rememberSidebarScroll(scrollwrap);
    }, { passive: true });
  }

  function enhancePage() {
    enhanceSidebarScroll();
    enhanceCodeBlocks();
    enhanceImages();
    enhanceMoreMenu();
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(enhancePage);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhancePage);
  } else {
    enhancePage();
  }

  document.addEventListener("click", function () {
    closeMoreMenus();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMoreMenus();
  });

  window.addEventListener("resize", function () {
    closeMoreMenus();
  });

})();
