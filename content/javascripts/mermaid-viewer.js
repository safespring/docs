(function () {
  var diagramSelector = ".md-typeset .mermaid";
  var viewer = null;
  var activeDiagram = null;
  var mermaidConfig = {
    startOnLoad: false,
    securityLevel: "strict",
    theme: "base",
    themeVariables: {
      background: "#FAFEFE",
      primaryColor: "#E7EFF3",
      primaryBorderColor: "#195F8C",
      primaryTextColor: "#323232",
      secondaryColor: "#195F8C20",
      secondaryBorderColor: "#3C9BCD",
      secondaryTextColor: "#323232",
      tertiaryColor: "#FAFEFE",
      tertiaryBorderColor: "#D6E5EC",
      tertiaryTextColor: "#323232",
      lineColor: "#195F8C",
      textColor: "#323232",
      mainBkg: "#FAFEFE",
      nodeBorder: "#195F8C",
      clusterBkg: "#19608c10",
      clusterBorder: "#9EC6DB",
      edgeLabelBackground: "#fafefe",
      fontFamily: "Montserrat, Arial, sans-serif"
    }
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function uniqueId() {
    return "mermaid-fullscreen-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  }

  function getDiagramSource(diagram) {
    var code = diagram.querySelector(":scope > code");

    if (code && diagram.getAttribute("data-processed") !== "true") {
      return code.textContent || "";
    }

    return diagram.dataset.mermaidSource || diagram.textContent || "";
  }

  function ensureViewer() {
    if (viewer) {
      return viewer;
    }

    var dialog = document.createElement("dialog");
    dialog.className = "mermaid-viewer";
    dialog.setAttribute("aria-label", "Mermaid diagram viewer");

    var panel = document.createElement("div");
    panel.className = "mermaid-viewer__panel";

    var toolbar = document.createElement("div");
    toolbar.className = "mermaid-viewer__toolbar";

    var zoomOut = document.createElement("button");
    zoomOut.className = "mermaid-viewer__button";
    zoomOut.type = "button";
    zoomOut.textContent = "-";
    zoomOut.setAttribute("aria-label", "Zoom out");

    var zoomIn = document.createElement("button");
    zoomIn.className = "mermaid-viewer__button";
    zoomIn.type = "button";
    zoomIn.textContent = "+";
    zoomIn.setAttribute("aria-label", "Zoom in");

    var reset = document.createElement("button");
    reset.className = "mermaid-viewer__button mermaid-viewer__button--text";
    reset.type = "button";
    reset.textContent = "Reset";
    reset.setAttribute("aria-label", "Reset zoom and position");

    var close = document.createElement("button");
    close.className = "mermaid-viewer__button mermaid-viewer__button--text";
    close.type = "button";
    close.textContent = "Close";
    close.setAttribute("aria-label", "Close diagram viewer");

    toolbar.append(zoomOut, zoomIn, reset, close);

    var canvas = document.createElement("div");
    canvas.className = "mermaid-viewer__canvas";

    var content = document.createElement("div");
    content.className = "mermaid-viewer__content";
    canvas.appendChild(content);

    panel.append(toolbar, canvas);
    dialog.appendChild(panel);
    document.body.appendChild(dialog);

    var state = {
      scale: 1,
      minScale: 0.2,
      maxScale: 6,
      x: 0,
      y: 0,
      pointers: new Map(),
      previousPinch: null
    };

    function applyTransform() {
      content.style.transform = "translate3d(" + state.x + "px, " + state.y + "px, 0) scale(" + state.scale + ")";
    }

    function setSvgNaturalSize() {
      var svg = content.querySelector("svg");

      if (!svg || !svg.viewBox || !svg.viewBox.baseVal) {
        return;
      }

      var viewBox = svg.viewBox.baseVal;

      if (viewBox.width > 0 && viewBox.height > 0) {
        svg.style.width = viewBox.width + "px";
        svg.style.height = viewBox.height + "px";
        svg.style.maxWidth = "none";
      }
    }

    function fitToCanvas() {
      setSvgNaturalSize();
      state.scale = 1;
      state.x = 0;
      state.y = 0;
      applyTransform();

      requestAnimationFrame(function () {
        var canvasRect = canvas.getBoundingClientRect();
        var contentRect = content.getBoundingClientRect();
        var availableWidth = Math.max(canvasRect.width - 32, 1);
        var availableHeight = Math.max(canvasRect.height - 32, 1);
        var fitScale = Math.min(availableWidth / contentRect.width, availableHeight / contentRect.height, 1);

        if (!Number.isFinite(fitScale) || fitScale <= 0) {
          fitScale = 1;
        }

        state.scale = clamp(fitScale, state.minScale, 1);
        state.x = (canvasRect.width - contentRect.width * state.scale) / 2;
        state.y = (canvasRect.height - contentRect.height * state.scale) / 2;
        applyTransform();
      });
    }

    function zoomAt(nextScale, clientX, clientY) {
      var rect = canvas.getBoundingClientRect();
      var oldScale = state.scale;
      var scale = clamp(nextScale, state.minScale, state.maxScale);
      var pointX = clientX - rect.left;
      var pointY = clientY - rect.top;

      state.x = pointX - ((pointX - state.x) / oldScale) * scale;
      state.y = pointY - ((pointY - state.y) / oldScale) * scale;
      state.scale = scale;
      applyTransform();
    }

    function zoomFromCenter(factor) {
      var rect = canvas.getBoundingClientRect();
      zoomAt(state.scale * factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    function getPinchState() {
      var points = Array.from(state.pointers.values());

      if (points.length < 2) {
        return null;
      }

      var first = points[0];
      var second = points[1];
      var dx = second.clientX - first.clientX;
      var dy = second.clientY - first.clientY;

      return {
        distance: Math.hypot(dx, dy),
        centerX: (first.clientX + second.clientX) / 2,
        centerY: (first.clientY + second.clientY) / 2
      };
    }

    function stopPointer(pointerId) {
      state.pointers.delete(pointerId);
      state.previousPinch = null;
      canvas.classList.toggle("is-panning", state.pointers.size > 0);
    }

    function renderFallback(diagram) {
      var clone = diagram.cloneNode(true);
      clone.classList.add("mermaid-viewer__fallback");
      content.replaceChildren(clone);
      fitToCanvas();
    }

    async function renderDiagram(diagram) {
      content.replaceChildren();
      activeDiagram = diagram;

      if (!window.mermaid || typeof window.mermaid.render !== "function") {
        renderFallback(diagram);
        return;
      }

      try {
        window.mermaid.initialize(mermaidConfig);
        var result = await window.mermaid.render(uniqueId(), getDiagramSource(diagram));
        content.innerHTML = result.svg;

        if (typeof result.bindFunctions === "function") {
          result.bindFunctions(content);
        }

        fitToCanvas();
      } catch (error) {
        renderFallback(diagram);
        console.error("Failed to render Mermaid diagram in fullscreen viewer.", error);
      }
    }

    zoomOut.addEventListener("click", function () {
      zoomFromCenter(0.8);
    });

    zoomIn.addEventListener("click", function () {
      zoomFromCenter(1.25);
    });

    reset.addEventListener("click", fitToCanvas);

    close.addEventListener("click", function () {
      dialog.close();
    });

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", function () {
      document.documentElement.classList.remove("mermaid-viewer-is-open");
      content.replaceChildren();
      activeDiagram = null;
      state.pointers.clear();
      state.previousPinch = null;
    });

    canvas.addEventListener("wheel", function (event) {
      event.preventDefault();
      zoomAt(state.scale * Math.exp(-event.deltaY * 0.001), event.clientX, event.clientY);
    }, { passive: false });

    canvas.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 && event.pointerType === "mouse") {
        return;
      }

      event.preventDefault();
      canvas.setPointerCapture(event.pointerId);
      state.pointers.set(event.pointerId, {
        clientX: event.clientX,
        clientY: event.clientY,
        previousX: event.clientX,
        previousY: event.clientY
      });
      state.previousPinch = getPinchState();
      canvas.classList.add("is-panning");
    });

    canvas.addEventListener("pointermove", function (event) {
      if (!state.pointers.has(event.pointerId)) {
        return;
      }

      event.preventDefault();

      var pointer = state.pointers.get(event.pointerId);
      pointer.previousX = pointer.clientX;
      pointer.previousY = pointer.clientY;
      pointer.clientX = event.clientX;
      pointer.clientY = event.clientY;

      if (state.pointers.size === 1) {
        state.x += pointer.clientX - pointer.previousX;
        state.y += pointer.clientY - pointer.previousY;
        applyTransform();
        return;
      }

      var pinch = getPinchState();

      if (pinch && state.previousPinch && state.previousPinch.distance > 0) {
        var scaleFactor = pinch.distance / state.previousPinch.distance;
        zoomAt(state.scale * scaleFactor, pinch.centerX, pinch.centerY);
        state.x += pinch.centerX - state.previousPinch.centerX;
        state.y += pinch.centerY - state.previousPinch.centerY;
        applyTransform();
      }

      state.previousPinch = pinch;
    });

    canvas.addEventListener("pointerup", function (event) {
      stopPointer(event.pointerId);
    });

    canvas.addEventListener("pointercancel", function (event) {
      stopPointer(event.pointerId);
    });

    viewer = {
      open: function (diagram) {
        document.documentElement.classList.add("mermaid-viewer-is-open");
        dialog.showModal();
        renderDiagram(diagram);
      },
      refresh: function () {
        if (activeDiagram) {
          fitToCanvas();
        }
      }
    };

    window.addEventListener("resize", function () {
      if (dialog.open) {
        viewer.refresh();
      }
    });

    return viewer;
  }

  function enhanceMermaidBlocks() {
    document.querySelectorAll(diagramSelector).forEach(function (diagram, index) {
      if (diagram.closest(".mermaid-viewer")) {
        return;
      }

      if (!diagram.dataset.mermaidSource) {
        diagram.dataset.mermaidSource = diagram.textContent.trim();
      }

      if (diagram.closest(".mermaid-figure")) {
        return;
      }

      var figure = document.createElement("div");
      figure.className = "mermaid-figure";

      var button = document.createElement("button");
      button.className = "mermaid-figure__expand";
      button.type = "button";
      button.textContent = "Fullscreen";
      button.setAttribute("aria-label", "Open Mermaid diagram " + (index + 1) + " in fullscreen");

      diagram.parentNode.insertBefore(figure, diagram);
      figure.append(diagram, button);

      button.addEventListener("click", function () {
        ensureViewer().open(diagram);
      });
    });
  }

  function renderMermaidBlocks() {
    var diagrams = Array.from(document.querySelectorAll(diagramSelector)).filter(function (diagram) {
      return !diagram.closest(".mermaid-viewer");
    });
    var unprocessedDiagrams = diagrams.filter(function (diagram) {
      return diagram.getAttribute("data-processed") !== "true";
    });

    if (diagrams.length === 0) {
      return;
    }

    unprocessedDiagrams.forEach(function (diagram) {
      if (!diagram.dataset.mermaidSource) {
        diagram.dataset.mermaidSource = getDiagramSource(diagram).trim();
      }

      diagram.textContent = diagram.dataset.mermaidSource;
    });

    if (!window.mermaid || typeof window.mermaid.run !== "function") {
      enhanceMermaidBlocks();
      return;
    }

    if (unprocessedDiagrams.length === 0) {
      enhanceMermaidBlocks();
      return;
    }

    window.mermaid.initialize(mermaidConfig);

    window.mermaid.run({ nodes: unprocessedDiagrams }).then(enhanceMermaidBlocks).catch(function (error) {
      enhanceMermaidBlocks();
      console.error("Failed to render Mermaid diagrams.", error);
    });
  }

  ready(function () {
    if (window.document$ && typeof window.document$.subscribe === "function") {
      window.document$.subscribe(renderMermaidBlocks);
      return;
    }

    renderMermaidBlocks();
  });
})();
