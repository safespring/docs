(function () {
  var sidebarScrollKeyPrefix = "safespring:sidebar-scroll:";
  var codeBlockId = 0;
  var articleViewStorageKey = "safespring:article-view:v1";
  var articleTextSizes = [70, 80, 90, 100, 110, 120, 130];
  var articleViewPreference = loadArticleViewPreference();
  var articleHintStorageKey = "safespring:article-width-hint-dismissed:v1";
  var articleHintDismissed = loadArticleHintDismissed();
  var codeFocusEnabled = articleViewPreference.mode === "code";
  var codeFocusScrollCleanup = null;
  var articleView = {};
  var articleResizeDrag = null;
  var articleResizeThreshold = 8;
  var articleResizeMedia = window.matchMedia("(min-width: 60em) and (pointer: fine)");
  var articleHintIntroMedia = window.matchMedia("(min-width: 76.25em) and (pointer: fine)");
  var mascotAssetVersion = "20260701-mascot-12";
  var mascotImageUrl = resolveAssetUrl("images/mascot-white-t-shirt-alt1.svg?v=" + mascotAssetVersion);
  var sittingMascotImageUrl = resolveAssetUrl("images/mascot-white-t-shirt-sitting.svg?v=" + mascotAssetVersion);
  var mascotFacesUrl = resolveAssetUrl("images/maskot-heads-2026.svg?v=" + mascotAssetVersion);
  var mascotBubbleItems = [];
  var mascotBubbleFrame = 0;
  var mascotImageSourceSize = {
    height: 406.72,
    width: 378.01
  };
  var mascotFaceSprite = {
    columns: [50, 200, 350, 500],
    cropHeight: 125,
    cropWidth: 130,
    rows: [25, 215],
    spriteHeight: 437,
    spriteWidth: 675
  };
  var mascotFaceEffects = {
    1: "fireworks",
    2: "exclaim"
  };

  function resolveAssetUrl(path) {
    var script = document.currentScript || document.querySelector('script[src*="safespring-codeblocks.js"]');
    if (script && script.src) return new URL(path, script.src).toString();
    return new URL(path, document.baseURI).toString();
  }

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

    return "";
  }

  function labelFor(language) {
    if (!language) return "";

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
      py: "Python"
    };

    return labels[language] || language.charAt(0).toUpperCase() + language.slice(1);
  }

  function isMermaidBlock(pre, code) {
    var codeClass = code ? code.className || "" : "";

    return pre.classList.contains("safespring-mermaid") ||
      pre.classList.contains("mermaid") ||
      !!pre.closest(".mermaid-figure") ||
      /(?:^|\s)language-mermaid(?:\s|$)/.test(codeClass) ||
      /(?:^|\s)mermaid(?:\s|$)/.test(codeClass);
  }

  function cleanupMermaidCodeBlockEnhancements() {
    document.querySelectorAll(
      ".mermaid-figure pre.safespring-code-block--collapsible, pre.safespring-mermaid.safespring-code-block--collapsible, pre.mermaid.safespring-code-block--collapsible"
    ).forEach(function (pre) {
      pre.classList.remove("safespring-code-block--collapsible");
      pre.classList.remove("safespring-code-block--collapsed");
      pre.classList.remove("safespring-code-block--expanded");
      pre.removeAttribute("data-safespring-language");
      pre.removeAttribute("data-safespring-enhanced");

      pre.querySelectorAll(":scope > .safespring-code-header, :scope > .safespring-code-expand-row").forEach(function (element) {
        element.remove();
      });
    });
  }

  function shouldCollapseCodeBlock(code) {
    var text = code.textContent.replace(/\s+$/, "");
    var lineCount = text ? text.split("\n").length : 0;

    return lineCount > 10;
  }

  function enhanceCodeBlockExpansion(pre, code) {
    if (!shouldCollapseCodeBlock(code)) return;

    codeBlockId += 1;
    code.id = code.id || "safespring-code-block-" + codeBlockId;

    pre.classList.add("safespring-code-block--collapsible");
    pre.classList.add("safespring-code-block--collapsed");

    var controls = document.createElement("div");
    controls.className = "safespring-code-expand-row";

    var button = document.createElement("button");
    button.className = "safespring-code-expand";
    button.type = "button";
    button.textContent = "Expand";
    button.setAttribute("aria-controls", code.id);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-label", "Expand code block");

    button.addEventListener("click", function () {
      var isExpanded = pre.classList.toggle("safespring-code-block--expanded");
      pre.classList.toggle("safespring-code-block--collapsed", !isExpanded);
      button.textContent = isExpanded ? "Show less" : "Expand";
      button.setAttribute("aria-expanded", isExpanded ? "true" : "false");
      button.setAttribute("aria-label", isExpanded ? "Collapse code block" : "Expand code block");
    });

    controls.appendChild(button);
    pre.appendChild(controls);
  }

  function copyTextWithEvent(text) {
    return new Promise(function (resolve, reject) {
      var copied = false;

      function handleCopy(event) {
        if (!event.clipboardData) return;

        event.clipboardData.setData("text/plain", text);
        event.preventDefault();
        copied = true;
      }

      document.addEventListener("copy", handleCopy);

      try {
        if (document.execCommand && document.execCommand("copy") && copied) {
          resolve();
        } else {
          reject(new Error("Copy command failed"));
        }
      } catch (error) {
        reject(error);
      } finally {
        document.removeEventListener("copy", handleCopy);
      }
    });
  }

  function copyTextWithTextarea(text) {
    return new Promise(function (resolve, reject) {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      textarea.style.position = "fixed";
      textarea.style.top = "0";

      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      try {
        if (document.execCommand && document.execCommand("copy")) {
          resolve();
        } else {
          reject(new Error("Copy command failed"));
        }
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(textarea);
      }
    });
  }

  function fallbackCopyText(text) {
    return copyTextWithEvent(text).catch(function () {
      return copyTextWithTextarea(text);
    });
  }

  function copyText(text) {
    return fallbackCopyText(text).catch(function (fallbackError) {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
      }

      throw fallbackError;
    });
  }

  function codeBlockHost(pre) {
    var parent = pre.parentElement;
    if (parent && (parent.classList.contains("highlight") || parent.classList.contains("codehilite"))) return parent;
    return pre;
  }

  function codeBlockHasMascot(pre) {
    var host = codeBlockHost(pre);
    return pre.classList.contains("safespring-code-with-mascot") ||
      (host && host.classList.contains("safespring-code-with-mascot"));
  }

  function codeBlockHasSittingMascot(pre) {
    var host = codeBlockHost(pre);
    return pre.classList.contains("safespring-code-mascot-sitting") ||
      (host && host.classList.contains("safespring-code-mascot-sitting"));
  }

  function codeBlockMascotFace(pre) {
    var host = codeBlockHost(pre);
    var className = [pre.className || "", host ? host.className || "" : ""].join(" ");
    var match = className.match(/(?:^|\s)safespring-code-mascot-face-([1-8])(?:\s|$)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  function normalizeMascotFaceIndex(faceIndex) {
    var parsed = parseInt(faceIndex, 10);
    if (!isFinite(parsed)) return 1;
    return ((parsed - 1 + 8) % 8) + 1;
  }

  function mascotFaceSource(faceIndex) {
    if (!faceIndex || faceIndex < 1 || faceIndex > 8) return null;

    var zeroIndex = faceIndex - 1;
    var column = zeroIndex % 4;
    var row = Math.floor(zeroIndex / 4);

    return {
      height: mascotFaceSprite.cropHeight,
      left: mascotFaceSprite.columns[column],
      top: mascotFaceSprite.rows[row],
      width: mascotFaceSprite.cropWidth
    };
  }

  function mascotFaceEffect(faceIndex) {
    return mascotFaceEffects[normalizeMascotFaceIndex(faceIndex)] || "none";
  }

  function createMascotEffect() {
    var effect = document.createElement("span");
    effect.className = "safespring-code-mascot-effect";
    effect.dataset.safespringMascotEffect = "none";
    effect.dataset.safespringMascotEffectRun = "0";
    effect.setAttribute("aria-hidden", "true");

    var exclaim = document.createElement("span");
    exclaim.className = "safespring-code-mascot-effect__exclaim";
    exclaim.textContent = "!";
    effect.appendChild(exclaim);

    var fireworks = document.createElement("span");
    fireworks.className = "safespring-code-mascot-effect__fireworks";
    for (var index = 0; index < 10; index += 1) {
      var spark = document.createElement("span");
      spark.className = "safespring-code-mascot-effect__spark";
      fireworks.appendChild(spark);
    }
    effect.appendChild(fireworks);

    return effect;
  }

  function markMascotWrapTarget(host) {
    var previous = host.previousElementSibling;
    if (previous && previous.matches("p")) {
      previous.classList.add("safespring-code-mascot-wrap");
    }
  }

  function mascotBubbleDebugEnabled() {
    var params = new URLSearchParams(window.location.search);
    return params.get("mascot_debug") === "1" ||
      params.get("bubble_debug") === "1" ||
      params.get("bubble_debug") === "true";
  }

  function clamp(value, min, max) {
    if (max < min) return min;
    return Math.min(Math.max(value, min), max);
  }

  function unionRects(rects) {
    var visibleRects = rects.filter(function (rect) {
      return rect && rect.width > 0 && rect.height > 0;
    });

    if (!visibleRects.length) return null;

    return visibleRects.reduce(function (union, rect) {
      return {
        left: Math.min(union.left, rect.left),
        top: Math.min(union.top, rect.top),
        right: Math.max(union.right, rect.right),
        bottom: Math.max(union.bottom, rect.bottom),
        width: Math.max(union.right, rect.right) - Math.min(union.left, rect.left),
        height: Math.max(union.bottom, rect.bottom) - Math.min(union.top, rect.top)
      };
    });
  }

  function inflateRect(rect, amount) {
    return {
      left: rect.left - amount,
      top: rect.top - amount,
      right: rect.right + amount,
      bottom: rect.bottom + amount,
      width: rect.width + amount * 2,
      height: rect.height + amount * 2
    };
  }

  function rectOverlapArea(a, b) {
    var width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
    var height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
    return width * height;
  }

  function rectContainsPoint(rect, point) {
    return point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom;
  }

  function viewportBounds() {
    var viewport = window.visualViewport;
    var width = viewport ? viewport.width : document.documentElement.clientWidth;
    var height = viewport ? viewport.height : window.innerHeight;

    return {
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width: width,
      height: height
    };
  }

  function mascotHeadPoint(item, imageRect) {
    return {
      x: imageRect.left + imageRect.width * 0.59,
      y: imageRect.top + imageRect.height * 0.19
    };
  }

  function rectFromRatios(rect, ratios) {
    return {
      left: rect.left + rect.width * ratios.left,
      top: rect.top + rect.height * ratios.top,
      right: rect.left + rect.width * ratios.right,
      bottom: rect.top + rect.height * ratios.bottom,
      width: rect.width * (ratios.right - ratios.left),
      height: rect.height * (ratios.bottom - ratios.top)
    };
  }

  function parseClipLength(value, size) {
    var parsed = parseFloat(value);
    if (!isFinite(parsed)) return 0;
    return /%$/.test(value) ? size * parsed / 100 : parsed;
  }

  function clipInsetsForElement(element, rect) {
    var clipPath = window.getComputedStyle(element).clipPath;
    var match = /^inset\((.+)\)$/.exec(clipPath || "");
    if (!match) return { top: 0, right: 0, bottom: 0, left: 0 };

    var parts = match[1].trim().split(/\s+/);
    var top = parts[0] || "0";
    var right = parts[1] || top;
    var bottom = parts[2] || top;
    var left = parts[3] || right;

    return {
      top: parseClipLength(top, rect.height),
      right: parseClipLength(right, rect.width),
      bottom: parseClipLength(bottom, rect.height),
      left: parseClipLength(left, rect.width)
    };
  }

  function mascotMaskScale() {
    return Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  }

  function mascotMaskLayers(item, imageRect, legsRect) {
    var layers = [];
    if (item.image.complete && item.image.naturalWidth) {
      layers.push({ element: item.image, rect: imageRect });
    }
    if (item.legs && legsRect && item.legs.complete && item.legs.naturalWidth) {
      layers.push({ element: item.legs, rect: legsRect });
    }
    return layers;
  }

  function measureMascotAlpha(item, imageRect, legsRect) {
    var layers = mascotMaskLayers(item, imageRect, legsRect);
    var bounds = unionRects(layers.map(function (layer) { return layer.rect; }));
    if (!bounds) return null;

    var scale = mascotMaskScale();
    var width = Math.max(1, Math.ceil(bounds.width * scale));
    var height = Math.max(1, Math.ceil(bounds.height * scale));
    var canvas = item.measureCanvas || (item.measureCanvas = document.createElement("canvas"));

    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;

    context.clearRect(0, 0, width, height);

    var imageData;
    try {
      layers.forEach(function (layer) {
        var rect = layer.rect;
        var insets = clipInsetsForElement(layer.element, rect);
        var drawLeft = (rect.left - bounds.left) * scale;
        var drawTop = (rect.top - bounds.top) * scale;
        var drawWidth = rect.width * scale;
        var drawHeight = rect.height * scale;
        var clipLeft = drawLeft + insets.left * scale;
        var clipTop = drawTop + insets.top * scale;
        var clipWidth = Math.max(0, drawWidth - (insets.left + insets.right) * scale);
        var clipHeight = Math.max(0, drawHeight - (insets.top + insets.bottom) * scale);

        context.save();
        context.rect(clipLeft, clipTop, clipWidth, clipHeight);
        context.clip();
        context.drawImage(layer.element, drawLeft, drawTop, drawWidth, drawHeight);
        context.restore();
      });
      imageData = context.getImageData(0, 0, width, height);
    } catch (error) {
      return null;
    }

    var minX = width;
    var minY = height;
    var maxX = -1;
    var maxY = -1;
    var data = imageData.data;

    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] <= 16) continue;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }

    if (maxX < minX || maxY < minY) return null;

    return {
      bounds: bounds,
      data: data,
      height: height,
      scale: scale,
      visibleRect: {
        left: bounds.left + minX / scale,
        top: bounds.top + minY / scale,
        right: bounds.left + (maxX + 1) / scale,
        bottom: bounds.top + (maxY + 1) / scale,
        width: (maxX - minX + 1) / scale,
        height: (maxY - minY + 1) / scale
      },
      width: width
    };
  }

  function mascotVisualRect(item, imageRect, legsRect) {
    var mask = measureMascotAlpha(item, imageRect, legsRect);
    if (mask) return mask.visibleRect;

    var bodyBounds = item.isSitting
      ? { left: 0.197, top: 0, right: 0.818, bottom: 0.652 }
      : { left: 0.197, top: 0, right: 0.818, bottom: 0.981 };

    if (!item.isSitting || !legsRect) {
      return rectFromRatios(imageRect, bodyBounds);
    }

    return unionRects([
      rectFromRatios(imageRect, bodyBounds),
      rectFromRatios(legsRect, { left: 0.19, top: 0.652, right: 0.862, bottom: 0.995 })
    ]);
  }

  function mascotAvoidRect(mascotRect) {
    return inflateRect(mascotRect, Math.max(5, Math.min(9, mascotRect.width * 0.12)));
  }

  function drawMascotDebugMask(item, avoidRect, mask) {
    if (!item.debugZone || !mask) return;

    var canvas = item.debugZone.querySelector(".safespring-code-mascot-debug-zone__shape");
    if (!canvas) return;

    var scale = mask.scale;
    var width = Math.max(1, Math.ceil(avoidRect.width * scale));
    var height = Math.max(1, Math.ceil(avoidRect.height * scale));
    var radius = Math.max(1, Math.round((mask.visibleRect.left - avoidRect.left) * scale));
    var strokeRadius = Math.max(1, Math.round(1.2 * scale));
    var filled = new Uint8Array(width * height);
    var sourceData = mask.data;

    canvas.width = width;
    canvas.height = height;

    for (var y = 0; y < mask.height; y += 1) {
      for (var x = 0; x < mask.width; x += 1) {
        if (sourceData[(y * mask.width + x) * 4 + 3] <= 16) continue;

        var centerX = Math.round((mask.bounds.left + (x + 0.5) / scale - avoidRect.left) * scale);
        var centerY = Math.round((mask.bounds.top + (y + 0.5) / scale - avoidRect.top) * scale);

        for (var dy = -radius; dy <= radius; dy += 1) {
          for (var dx = -radius; dx <= radius; dx += 1) {
            if (dx * dx + dy * dy > radius * radius) continue;
            var px = centerX + dx;
            var py = centerY + dy;
            if (px < 0 || px >= width || py < 0 || py >= height) continue;
            filled[py * width + px] = 1;
          }
        }
      }
    }

    var context = canvas.getContext("2d");
    if (!context) return;

    var output = context.createImageData(width, height);
    var outputData = output.data;
    var edge = new Uint8Array(width * height);
    var filledCount = 0;
    var strokeCount = 0;

    for (var oy = 0; oy < height; oy += 1) {
      for (var ox = 0; ox < width; ox += 1) {
        var index = oy * width + ox;
        if (!filled[index]) continue;
        filledCount += 1;

        var isEdge = ox === 0 || oy === 0 || ox === width - 1 || oy === height - 1 ||
          !filled[index - 1] || !filled[index + 1] ||
          !filled[index - width] || !filled[index + width];
        if (isEdge) edge[index] = 1;

        var outIndex = index * 4;
        outputData[outIndex] = 250;
        outputData[outIndex + 1] = 105;
        outputData[outIndex + 2] = 15;
        outputData[outIndex + 3] = 26;
      }
    }

    for (var ey = 0; ey < height; ey += 1) {
      for (var ex = 0; ex < width; ex += 1) {
        if (!edge[ey * width + ex] || (ex + ey) % Math.round(8 * scale) > Math.round(4.8 * scale)) continue;

        for (var sy = -strokeRadius; sy <= strokeRadius; sy += 1) {
          for (var sx = -strokeRadius; sx <= strokeRadius; sx += 1) {
            var strokeX = ex + sx;
            var strokeY = ey + sy;
            if (strokeX < 0 || strokeX >= width || strokeY < 0 || strokeY >= height) continue;
            var strokeIndex = (strokeY * width + strokeX) * 4;
            outputData[strokeIndex] = 250;
            outputData[strokeIndex + 1] = 105;
            outputData[strokeIndex + 2] = 15;
            outputData[strokeIndex + 3] = 248;
            strokeCount += 1;
          }
        }
      }
    }

    context.putImageData(output, 0, 0);
    item.debugZone.dataset.safespringMaskMeasured = "true";
    item.debugZone.dataset.safespringMaskPixels = String(filledCount);
    item.debugZone.dataset.safespringMaskStrokePixels = String(strokeCount);
    item.debugZone.dataset.safespringMaskSource = mask.width + "x" + mask.height;
  }

  function bubbleMotionDistance() {
    return 4;
  }

  function candidateBubblePlacements(head, avoidRect, bubbleRect, edgeGap) {
    var headGap = Math.max(6, avoidRect.width * 0.08);

    return [
      {
        name: "right",
        priority: 0,
        left: avoidRect.right + edgeGap,
        top: head.y - bubbleRect.height * 0.54
      },
      {
        name: "above-right",
        priority: 1,
        left: Math.max(head.x + headGap, avoidRect.right - bubbleRect.width * 0.38),
        top: avoidRect.top - bubbleRect.height - edgeGap
      },
      {
        name: "above",
        priority: 2,
        left: head.x - bubbleRect.width * 0.5,
        top: avoidRect.top - bubbleRect.height - edgeGap
      },
      {
        name: "left",
        priority: 3,
        left: avoidRect.left - bubbleRect.width - edgeGap,
        top: head.y - bubbleRect.height * 0.54
      },
      {
        name: "above-left",
        priority: 4,
        left: Math.min(head.x - bubbleRect.width - headGap, avoidRect.left - bubbleRect.width * 0.62),
        top: avoidRect.top - bubbleRect.height - edgeGap
      }
    ];
  }

  function scoreBubbleCandidate(candidate, rect, idealRect, avoidRect, head) {
    var overlap = rectOverlapArea(rect, avoidRect);
    var headCovered = rectContainsPoint(rect, head) ? 1 : 0;
    var clampDistance = Math.abs(rect.left - candidate.left) + Math.abs(rect.top - candidate.top);

    return candidate.priority * 2500 +
      overlap * 1000 +
      headCovered * 1000000 +
      clampDistance * 14 +
      Math.abs(rect.left - idealRect.left) +
      Math.abs(rect.top - idealRect.top);
  }

  function chooseBubblePlacement(item, hostRect, mascotRect, imageRect, bubbleRect) {
    var viewport = viewportBounds();
    var head = mascotHeadPoint(item, imageRect);
    var edgeGap = bubbleMotionDistance();
    var avoidRect = mascotAvoidRect(mascotRect);
    var minLeft = Math.max(viewport.left + 6, hostRect.left + 4);
    var viewportMaxLeft = viewport.right - bubbleRect.width - 6;
    var hostMaxLeft = hostRect.right - bubbleRect.width - 4;
    var maxLeft = viewport.width >= 720 ? viewportMaxLeft : Math.min(viewportMaxLeft, hostMaxLeft);

    if (maxLeft < minLeft) {
      minLeft = viewport.left + 6;
      maxLeft = Math.max(minLeft, viewport.right - bubbleRect.width - 6);
    }

    var minTop = viewport.top + 6;
    var maxTop = Math.max(minTop, viewport.bottom - bubbleRect.height - 6);
    var best = null;

    candidateBubblePlacements(head, avoidRect, bubbleRect, edgeGap).forEach(function (candidate) {
      var left = clamp(candidate.left, minLeft, maxLeft);
      var top = clamp(candidate.top, minTop, maxTop);
      var rect = {
        left: left,
        top: top,
        right: left + bubbleRect.width,
        bottom: top + bubbleRect.height,
        width: bubbleRect.width,
        height: bubbleRect.height
      };
      var score = scoreBubbleCandidate(candidate, rect, {
        left: candidate.left,
        top: candidate.top
      }, avoidRect, head);

      if (!best || score < best.score) {
        best = {
          name: candidate.name,
          rect: rect,
          head: head,
          score: score
        };
      }
    });

    return best;
  }

  function bubbleArrowSide(bubbleRect, head) {
    if (head.x < bubbleRect.left) return "left";
    if (head.x > bubbleRect.right) return "right";
    if (head.y < bubbleRect.top) return "top";
    if (head.y > bubbleRect.bottom) return "bottom";

    var distances = [
      { side: "left", value: Math.abs(head.x - bubbleRect.left) },
      { side: "right", value: Math.abs(head.x - bubbleRect.right) },
      { side: "top", value: Math.abs(head.y - bubbleRect.top) },
      { side: "bottom", value: Math.abs(head.y - bubbleRect.bottom) }
    ];

    distances.sort(function (a, b) {
      return a.value - b.value;
    });

    return distances[0].side;
  }

  function setBubbleMotion(bubble, placementName) {
    bubble.style.setProperty("--safespring-mascot-bubble-shift-x", "0");
    bubble.style.setProperty("--safespring-mascot-bubble-shift-y", "0");

    if (placementName === "right") {
      bubble.style.setProperty("--safespring-mascot-bubble-shift-x", "-4px");
      return;
    }

    if (placementName === "left") {
      bubble.style.setProperty("--safespring-mascot-bubble-shift-x", "4px");
      return;
    }

    if (placementName === "above" ||
      placementName === "above-right" ||
      placementName === "above-left") {
      bubble.style.setProperty("--safespring-mascot-bubble-shift-y", "4px");
    }
  }

  function setBubbleArrow(bubble, bubbleRect, head, placementName) {
    var side = bubbleArrowSide(bubbleRect, head);
    var arrowInset = 8;

    bubble.dataset.safespringBubbleArrow = side;
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-left", "auto");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-right", "auto");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-top", "auto");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-bottom", "auto");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-shift-x", "0");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-shift-y", "0");
    setBubbleMotion(bubble, placementName);

    if (side === "left" || side === "right") {
      var arrowTop = clamp(head.y - bubbleRect.top, arrowInset, bubbleRect.height - arrowInset);
      bubble.style.setProperty("--safespring-mascot-bubble-arrow-" + side, "-0.18rem");
      bubble.style.setProperty("--safespring-mascot-bubble-arrow-top", arrowTop + "px");
      bubble.style.setProperty("--safespring-mascot-bubble-arrow-shift-y", "-50%");
      bubble.style.setProperty("--safespring-mascot-bubble-origin", side + " center");
      return;
    }

    var arrowLeft = clamp(head.x - bubbleRect.left, arrowInset, bubbleRect.width - arrowInset);
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-" + side, "-0.18rem");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-left", arrowLeft + "px");
    bubble.style.setProperty("--safespring-mascot-bubble-arrow-shift-x", "-50%");
    bubble.style.setProperty("--safespring-mascot-bubble-origin", "center " + side);
  }

  function positionMascotDebugZone(item, hostRect, avoidRect, head, mask) {
    if (!item.debugZone) return;

    item.debugZone.style.setProperty("--safespring-mascot-debug-left", avoidRect.left - hostRect.left + "px");
    item.debugZone.style.setProperty("--safespring-mascot-debug-top", avoidRect.top - hostRect.top + "px");
    item.debugZone.style.setProperty("--safespring-mascot-debug-width", avoidRect.width + "px");
    item.debugZone.style.setProperty("--safespring-mascot-debug-height", avoidRect.height + "px");
    item.debugZone.style.setProperty("--safespring-mascot-debug-head-left", head.x - avoidRect.left + "px");
    item.debugZone.style.setProperty("--safespring-mascot-debug-head-top", head.y - avoidRect.top + "px");
    item.debugZone.dataset.safespringMaskMeasured = mask ? "true" : "false";
    drawMascotDebugMask(item, avoidRect, mask);
  }

  function createMascotDebugZone(isSitting) {
    var debugZone = document.createElement("span");
    debugZone.className = "safespring-code-mascot-debug-zone";
    debugZone.classList.toggle("safespring-code-mascot-debug-zone--sitting", isSitting);
    debugZone.setAttribute("aria-hidden", "true");

    var canvas = document.createElement("canvas");
    canvas.className = "safespring-code-mascot-debug-zone__shape";
    debugZone.appendChild(canvas);

    return debugZone;
  }

  function positionMascotFace(item, hostRect, imageRect) {
    if (!item.face || !item.faceSource) return;

    var faceWidth = imageRect.width * (item.faceSource.width / mascotImageSourceSize.width);
    var faceHeight = imageRect.height * (item.faceSource.height / mascotImageSourceSize.height);
    var centerX = imageRect.left + imageRect.width * 0.58;
    var centerY = imageRect.top + imageRect.height * 0.125;
    var left = centerX - faceWidth / 2;
    var top = centerY - faceHeight / 2;
    var scaleX = faceWidth / item.faceSource.width;
    var scaleY = faceHeight / item.faceSource.height;

    item.face.style.setProperty("--safespring-mascot-face-left", left - hostRect.left + "px");
    item.face.style.setProperty("--safespring-mascot-face-top", top - hostRect.top + "px");
    item.face.style.setProperty("--safespring-mascot-face-width", faceWidth + "px");
    item.face.style.setProperty("--safespring-mascot-face-height", faceHeight + "px");
    item.face.style.backgroundImage = 'url("' + mascotFacesUrl + '")';
    item.face.style.backgroundPosition = (-item.faceSource.left * scaleX) + "px " + (-item.faceSource.top * scaleY) + "px";
    item.face.style.backgroundSize = (mascotFaceSprite.spriteWidth * scaleX) + "px " + (mascotFaceSprite.spriteHeight * scaleY) + "px";
    item.face.dataset.safespringMascotFacePositioned = "true";
  }

  function positionMascotEffect(item, hostRect, imageRect) {
    if (!item.effect) return;

    var head = mascotHeadPoint(item, imageRect);
    item.effect.style.setProperty("--safespring-mascot-effect-left", head.x - hostRect.left + "px");
    item.effect.style.setProperty("--safespring-mascot-effect-top", head.y - hostRect.top + "px");
    item.effect.style.setProperty("--safespring-mascot-effect-size", Math.max(16, Math.min(28, imageRect.width * 0.34)) + "px");
    item.effect.dataset.safespringMascotEffectPositioned = "true";
  }

  function positionMascotBubble(item) {
    if (!item.host.isConnected || !item.image.isConnected || !item.bubble.isConnected) return;

    var hostRect = item.host.getBoundingClientRect();
    var imageRect = item.image.getBoundingClientRect();
    var legsRect = item.legs ? item.legs.getBoundingClientRect() : null;
    var mask = measureMascotAlpha(item, imageRect, legsRect);
    var mascotRect = mask ? mask.visibleRect : mascotVisualRect(item, imageRect, legsRect);
    var bubbleRect = item.bubble.getBoundingClientRect();

    if (!mascotRect || bubbleRect.width <= 0 || bubbleRect.height <= 0) return;

    var head = mascotHeadPoint(item, imageRect);
    var avoidRect = mascotAvoidRect(mascotRect);
    var placement = chooseBubblePlacement(item, hostRect, mascotRect, imageRect, bubbleRect);
    if (!placement) return;
    positionMascotFace(item, hostRect, imageRect);
    positionMascotEffect(item, hostRect, imageRect);

    var localLeft = placement.rect.left - hostRect.left;
    var localTop = placement.rect.top - hostRect.top;

    item.bubble.dataset.safespringBubblePositioned = "true";
    item.bubble.dataset.safespringBubblePlacement = placement.name;
    item.bubble.style.setProperty("--safespring-mascot-bubble-left", localLeft + "px");
    item.bubble.style.setProperty("--safespring-mascot-bubble-top", localTop + "px");
    setBubbleArrow(item.bubble, placement.rect, placement.head, placement.name);
    positionMascotDebugZone(item, hostRect, avoidRect, head, mask);
  }

  function positionMascotBubbles() {
    mascotBubbleFrame = 0;
    mascotBubbleItems = mascotBubbleItems.filter(function (item) {
      return item.host.isConnected && item.bubble.isConnected;
    });
    mascotBubbleItems.forEach(positionMascotBubble);
  }

  function scheduleMascotBubblePositions() {
    if (mascotBubbleFrame || !mascotBubbleItems.length) return;
    mascotBubbleFrame = window.requestAnimationFrame(positionMascotBubbles);
  }

  function setMascotFace(item, faceIndex) {
    if (!item.face) return;

    var normalized = normalizeMascotFaceIndex(faceIndex);
    item.face.dataset.safespringMascotFace = String(normalized);
    item.host.dataset.safespringMascotFace = String(normalized);
    item.faceSource = mascotFaceSource(normalized);
    setMascotEffect(item, normalized);
    scheduleMascotBubblePositions();
  }

  function cycleMascotFace(item) {
    if (!item.face) return;
    var current = parseInt(item.face.dataset.safespringMascotFace, 10) || 1;
    setMascotFace(item, current + 1);
  }

  function setMascotEffect(item, faceIndex) {
    if (!item.effect) return;

    var effect = mascotFaceEffect(faceIndex);
    var run = (parseInt(item.effect.dataset.safespringMascotEffectRun, 10) || 0) + 1;

    item.effect.dataset.safespringMascotEffect = "none";
    item.effect.dataset.safespringMascotEffectRun = String(run);
    if (effect === "none") return;

    item.effect.offsetWidth;
    item.effect.dataset.safespringMascotEffect = effect;
  }

  function registerMascotBubble(host, image, legs, face, effect, bubble, debugZone, isSitting) {
    var item = {
      host: host,
      image: image,
      legs: legs,
      face: face,
      faceSource: face ? mascotFaceSource(parseInt(face.dataset.safespringMascotFace, 10)) : null,
      effect: effect,
      bubble: bubble,
      debugZone: debugZone,
      isSitting: isSitting
    };
    mascotBubbleItems.push(item);
    if (face && effect) setMascotEffect(item, parseInt(face.dataset.safespringMascotFace, 10));

    image.addEventListener("load", scheduleMascotBubblePositions, { once: true });
    image.addEventListener("mouseenter", scheduleMascotBubblePositions);
    image.addEventListener("touchstart", scheduleMascotBubblePositions, { passive: true });
    if (legs) {
      legs.addEventListener("load", scheduleMascotBubblePositions, { once: true });
      legs.addEventListener("mouseenter", scheduleMascotBubblePositions);
      legs.addEventListener("touchstart", scheduleMascotBubblePositions, { passive: true });
    }

    if (face) {
      function activateMascotFace() {
        cycleMascotFace(item);
      }

      image.dataset.safespringMascotInteractive = "true";
      image.title = "Change mascot expression";
      image.setAttribute("aria-label", "Change mascot expression");
      image.setAttribute("role", "button");
      image.setAttribute("tabindex", "0");
      image.removeAttribute("aria-hidden");
      image.addEventListener("click", activateMascotFace);
      image.addEventListener("keydown", function (event) {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activateMascotFace();
      });

      if (legs) {
        legs.dataset.safespringMascotInteractive = "true";
        legs.title = "Change mascot expression";
        legs.addEventListener("click", activateMascotFace);
      }
    }

    scheduleMascotBubblePositions();
  }

  function enhanceCodeBlockMascot(pre) {
    if (!codeBlockHasMascot(pre)) return;

    var host = codeBlockHost(pre);
    var isSitting = codeBlockHasSittingMascot(pre);
    var faceIndex = codeBlockMascotFace(pre);
    host.classList.add("safespring-code-with-mascot");
    host.classList.toggle("safespring-code-mascot-sitting", isSitting);
    pre.classList.add("safespring-code-with-mascot__block");
    if (!isSitting) markMascotWrapTarget(host);

    if (host.querySelector(".safespring-code-mascot")) return;

    var image = document.createElement("img");
    image.className = "safespring-code-mascot";
    if (isSitting) image.classList.add("safespring-code-mascot--sitting");
    image.src = mascotImageUrl;
    image.alt = "";
    image.decoding = "async";
    image.draggable = false;
    image.setAttribute("aria-hidden", "true");

    var sittingLegs = null;
    if (isSitting) {
      sittingLegs = document.createElement("img");
      sittingLegs.className = "safespring-code-mascot-legs";
      sittingLegs.src = sittingMascotImageUrl;
      sittingLegs.alt = "";
      sittingLegs.decoding = "async";
      sittingLegs.draggable = false;
      sittingLegs.setAttribute("aria-hidden", "true");
    }

    var face = null;
    if (faceIndex) {
      face = document.createElement("span");
      face.className = "safespring-code-mascot-face";
      face.dataset.safespringMascotFace = String(faceIndex);
      face.setAttribute("aria-hidden", "true");
    }

    var bubble = document.createElement("span");
    bubble.className = "safespring-code-mascot-bubble";
      bubble.textContent = "Hello world!";
      bubble.setAttribute("aria-hidden", "true");

    var effect = null;
    if (face) {
      effect = createMascotEffect();
    }

    var debugZone = null;
    if (mascotBubbleDebugEnabled()) {
      debugZone = createMascotDebugZone(isSitting);
    }

    host.insertBefore(image, host.firstChild);
    if (sittingLegs) host.insertBefore(sittingLegs, image.nextSibling);
    if (face) host.insertBefore(face, sittingLegs ? sittingLegs.nextSibling : image.nextSibling);
    if (effect) host.insertBefore(effect, face ? face.nextSibling : sittingLegs ? sittingLegs.nextSibling : image.nextSibling);
    if (debugZone) host.insertBefore(debugZone, effect ? effect.nextSibling : face ? face.nextSibling : sittingLegs ? sittingLegs.nextSibling : image.nextSibling);
    host.insertBefore(bubble, debugZone ? debugZone.nextSibling : effect ? effect.nextSibling : face ? face.nextSibling : sittingLegs ? sittingLegs.nextSibling : image.nextSibling);
    registerMascotBubble(host, image, sittingLegs, face, effect, bubble, debugZone, isSitting);
  }

  function loadArticleViewPreference() {
    var fallback = { version: 1, mode: "reading", width: null, textSize: 100 };
    try {
      var saved = JSON.parse(window.localStorage.getItem(articleViewStorageKey));
      if (!saved || saved.version !== 1 || (saved.mode !== "reading" && saved.mode !== "code")) return fallback;
      var width = saved.width;
      if (width !== null && (typeof width !== "number" || !Number.isFinite(width) || width <= 0)) return fallback;
      var textSize = articleTextSizes.includes(saved.textSize) ? saved.textSize : fallback.textSize;
      return { version: 1, mode: saved.mode, width: saved.mode === "code" ? width : null, textSize: textSize };
    } catch (error) {
      return fallback;
    }
  }

  function saveArticleViewPreference(mode, width, textSize = articleViewPreference.textSize) {
    articleViewPreference = { version: 1, mode: mode, width: mode === "code" ? width : null, textSize: textSize };
    try {
      window.localStorage.setItem(articleViewStorageKey, JSON.stringify(articleViewPreference));
    } catch (error) {
      // Keep the selected view in memory when browser storage is unavailable.
    }
  }

  function updateArticleSidebarInset(article, rect, limits) {
    var main = articleView.main;
    if (!main) return;
    var inset = 0;
    if (article && article.isConnected && article.classList.contains("sf-article-resizable") &&
        document.body.classList.contains("sf-code-focus") && articleResizeMedia.matches) {
      inset = Math.max(0, rect.left - limits.left);
    }
    main.style.setProperty("--sf-sidebar-inset", inset + "px");
  }

  function applyArticleViewPreference(article) {
    if (!article) {
      updateArticleSidebarInset(null);
      return;
    }
    article.style.setProperty("--sf-article-text-scale", articleViewPreference.textSize / 100);
    var width = articleViewPreference.width;
    var limits;
    if (codeFocusEnabled && articleResizeMedia.matches && article.classList.contains("sf-article-resizable") && width !== null) {
      limits = articleResizeLimits(article);
      article.style.setProperty("--sf-article-width", Math.max(limits.min, Math.min(width, limits.max)) + "px");
    } else {
      article.style.removeProperty("--sf-article-width");
    }
    updateArticleResizeHandle(article, limits);
  }

  function articleResizeLimits(article) {
    var parent = articleView.content;
    var parentStyle = window.getComputedStyle(parent);
    var articleStyle = window.getComputedStyle(article);
    var paddingLeft = parseFloat(parentStyle.paddingLeft) || 0;
    var paddingRight = parseFloat(parentStyle.paddingRight) || 0;
    var available = parent.clientWidth - paddingLeft - paddingRight;
    var decoration = (parseFloat(articleStyle.paddingLeft) || 0) + (parseFloat(articleStyle.paddingRight) || 0) +
      (parseFloat(articleStyle.borderLeftWidth) || 0) + (parseFloat(articleStyle.borderRightWidth) || 0);
    var maximum = Math.max(1, Math.floor(available - decoration));
    var left = parent.getBoundingClientRect().left;
    return {
      min: Math.min(320, maximum),
      max: maximum,
      decoration: decoration,
      left: left,
      center: left + parent.clientLeft + paddingLeft + available / 2
    };
  }

  function updateArticleResizeHandle(article, limits) {
    if (!article) {
      updateArticleSidebarInset(null);
      return;
    }
    var handle = articleView.handle;
    var grip = articleView.grip;
    // Read geometry once before updating sidebar positions and control attributes.
    var rect = article.getBoundingClientRect();
    limits = limits || articleResizeLimits(article);
    var width = Math.max(limits.min, Math.min(limits.max, Math.round(rect.width - limits.decoration)));
    updateArticleSidebarInset(article, rect, limits);
    handle.hidden = !articleResizeMedia.matches;
    grip.tabIndex = articleResizeMedia.matches ? 0 : -1;
    if (!rect.width) return;
    grip.setAttribute("aria-valuemin", String(limits.min));
    grip.setAttribute("aria-valuemax", String(limits.max));
    grip.setAttribute("aria-valuenow", String(width));
    grip.setAttribute("aria-valuetext", width + " pixels; article width");
    articleView.value.textContent = width + " px";
    showArticleResizeIntro(handle);
  }

  function holdArticleLayout() {
    var root = document.documentElement;
    var properties = ["overflow-anchor", "scroll-behavior"];
    var previous = properties.map(function (property) {
      return { value: root.style.getPropertyValue(property), priority: root.style.getPropertyPriority(property) };
    });
    root.style.setProperty("overflow-anchor", "none");
    root.style.setProperty("scroll-behavior", "auto");
    return function () {
      properties.forEach(function (property, index) {
        if (previous[index].value) {
          root.style.setProperty(property, previous[index].value, previous[index].priority);
        } else {
          root.style.removeProperty(property);
        }
      });
    };
  }

  function articleReadingAnchor(article, pointerY) {
    var dragging = pointerY !== undefined;
    var header = document.querySelector(".md-header");
    var top = dragging ? 0 : (header ? Math.max(0, header.getBoundingClientRect().bottom) : 0) + 8;
    var anchor = null;
    var distance = Infinity;
    var selector = "h1, h2, h3, h4, h5, h6, pre";
    var candidates = article.querySelectorAll(dragging ? selector + ", p" : selector);
    for (var node of candidates) {
      var rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height || rect.bottom <= top || rect.top >= window.innerHeight) continue;
      if (!dragging) return { node: node, top: rect.top };
      var nextDistance = Math.abs(rect.top - pointerY);
      if (nextDistance < distance) {
        anchor = { node: node, top: rect.top };
        distance = nextDistance;
      }
    }
    return anchor;
  }

  function changeArticleLayout(article, update, frames = 2) {
    finishArticleResize(true);
    if (codeFocusScrollCleanup) codeFocusScrollCleanup();
    var anchor = articleReadingAnchor(article);
    var restoreLayout = holdArticleLayout();
    try {
      update(anchor);
      alignArticleResizeAnchor(anchor);
    } finally {
      settleArticleLayout(anchor, restoreLayout, frames);
      scheduleMascotBubblePositions();
    }
  }

  function alignArticleResizeAnchor(anchor) {
    if (!anchor || !anchor.node.isConnected) return;
    var delta = anchor.node.getBoundingClientRect().top - anchor.top;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, behavior: "instant" });
  }

  function settleArticleLayout(anchor, restoreLayout, frames) {
    var frame;
    codeFocusScrollCleanup = function () {
      window.cancelAnimationFrame(frame);
      restoreLayout();
      codeFocusScrollCleanup = null;
    };
    function align() {
      alignArticleResizeAnchor(anchor);
      if (--frames > 0) frame = window.requestAnimationFrame(align);
      else codeFocusScrollCleanup();
    }
    frame = window.requestAnimationFrame(align);
  }

  function applyArticleResizeWidth(article, width, anchor, limits) {
    var value = Math.round(clamp(width, limits.min, limits.max)) + "px";
    if (article.style.getPropertyValue("--sf-article-width") === value) return;
    article.style.setProperty("--sf-article-width", value);
    alignArticleResizeAnchor(anchor);
    updateArticleResizeHandle(article, limits);
    scheduleMascotBubblePositions();
  }

  function updateArticleResizeDrag() {
    var drag = articleResizeDrag;
    if (!drag || !drag.article.isConnected) return;
    drag.animation = 0;
    if (!drag.restoreLayout) {
      // A click or slight pointer jitter should leave the current view intact.
      if (Math.abs(drag.pointerX - drag.startX) < articleResizeThreshold) return;
      dismissArticleResizeHint(drag.handle);
      if (codeFocusScrollCleanup) codeFocusScrollCleanup();
      drag.anchor = articleReadingAnchor(drag.article, drag.startY);
      drag.startWidth = drag.article.style.getPropertyValue("--sf-article-width");
      drag.startMode = codeFocusEnabled;
      drag.restoreLayout = holdArticleLayout();
      document.body.classList.add("sf-code-resizing");
      updateCodeFocusToolbar(true);
      // Wide changes the available space; measure after switching. A viewport
      // resize cancels the drag, so these bounds stay valid until release.
      drag.limits = articleResizeLimits(drag.article);
    }
    var width = 2 * (drag.pointerX - drag.grabOffset - drag.limits.center) - drag.limits.decoration;
    applyArticleResizeWidth(drag.article, width, drag.anchor, drag.limits);
  }

  function finishArticleResize(cancel) {
    var drag = articleResizeDrag;
    if (!drag) return;
    window.cancelAnimationFrame(drag.animation);
    // Releasing the pointer can finish a drag, but cannot start one by itself.
    if (!cancel && (drag.restoreLayout || drag.animation)) updateArticleResizeDrag();
    articleResizeDrag = null;
    if (drag.handle.hasPointerCapture(drag.pointerId)) drag.handle.releasePointerCapture(drag.pointerId);
    if (!drag.restoreLayout) return;
    if (cancel) {
      if (drag.startWidth) drag.article.style.setProperty("--sf-article-width", drag.startWidth);
      else drag.article.style.removeProperty("--sf-article-width");
      codeFocusEnabled = drag.startMode;
      if (drag.article.isConnected) updateCodeFocusToolbar();
      alignArticleResizeAnchor(drag.anchor);
    }
    document.body.classList.remove("sf-code-resizing");
    drag.restoreLayout();
    if (!cancel) saveArticleViewPreference("code", parseFloat(drag.article.style.getPropertyValue("--sf-article-width")) || null);
    updateArticleResizeHandle(drag.article);
    scheduleMascotBubblePositions();
  }

  function startArticleResize(event, article, handle) {
    if (!articleResizeMedia.matches || event.button !== 0 || !event.isPrimary) return;
    if (article !== articleView.article || !article.isConnected) return;
    event.preventDefault();
    if (articleResizeDrag) finishArticleResize(true);
    var rect = article.getBoundingClientRect();
    articleResizeDrag = {
      article: article,
      handle: handle,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      pointerX: event.clientX,
      grabOffset: event.clientX - rect.right,
      animation: 0,
      restoreLayout: null
    };
    handle.setPointerCapture(event.pointerId);
    articleView.grip.focus({ preventScroll: true });
  }

  function trackArticleResize(event) {
    var drag = articleResizeDrag;
    if (!drag || event.pointerId !== drag.pointerId) return;
    if (event.type === "pointercancel") return finishArticleResize(true);
    // Recover a missed release using the last held position, not a later hover.
    if (event.type === "pointermove" && !(event.buttons & 1)) return finishArticleResize(false);
    drag.pointerX = event.clientX;
    if (event.type === "pointerup") return finishArticleResize(false);
    if (!drag.restoreLayout && Math.abs(drag.pointerX - drag.startX) < articleResizeThreshold) return;
    if (!drag.animation) drag.animation = window.requestAnimationFrame(updateArticleResizeDrag);
  }

  function resizeArticleFromKeyboard(event, article) {
    if (!articleResizeMedia.matches || articleResizeDrag || event.altKey || event.ctrlKey || event.metaKey) return;
    var direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 :
      event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    if (article !== articleView.article || !article.isConnected) return;
    event.preventDefault();
    dismissArticleResizeHint(articleView.handle);
    changeArticleLayout(article, function (anchor) {
      var initialWidth = article.getBoundingClientRect().width - articleResizeLimits(article).decoration;
      updateCodeFocusToolbar(true);
      var limits = articleResizeLimits(article);
      var width = event.key === "Home" ? limits.min : event.key === "End" ? limits.max :
        initialWidth + direction * (event.shiftKey ? 80 : 20);
      applyArticleResizeWidth(article, width, anchor, limits);
      saveArticleViewPreference("code", parseFloat(article.style.getPropertyValue("--sf-article-width")) || null);
    }, 1);
  }

  function loadArticleHintDismissed() {
    try {
      return window.localStorage.getItem(articleHintStorageKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function rememberArticleHint() {
    if (articleHintDismissed) return;
    articleHintDismissed = true;
    try {
      window.localStorage.setItem(articleHintStorageKey, "1");
    } catch (error) {
      // Remember the introduction in memory when browser storage is unavailable.
    }
  }

  function showArticleResizeIntro(handle) {
    if (!handle) return;
    if (!articleHintIntroMedia.matches) {
      delete handle.dataset.hintIntro;
      return;
    }
    if (articleHintDismissed || handle.hidden || !handle.isConnected) return;
    var rect = articleView.grip.getBoundingClientRect();
    if (!rect || !rect.width || !rect.height || rect.bottom <= 0 || rect.top >= window.innerHeight) return;
    handle.dataset.hintIntro = "true";
    var style = window.getComputedStyle(articleView.hint);
    if (style && style.visibility !== "hidden" && style.display !== "none" && Number(style.opacity) > 0) rememberArticleHint();
  }

  function dismissArticleResizeHint(handle) {
    delete handle.dataset.hintIntro;
    handle.dataset.hintSuppressed = "true";
    rememberArticleHint();
  }

  function enhanceArticleResize(article) {
    article.classList.add("sf-article-resizable");
    var handle = document.createElement("div");
    handle.className = "sf-article-resize-handle";
    handle.innerHTML = '<span class="sf-article-resize-control">' +
      '<span class="sf-article-resize-grip" role="slider" aria-label="Article width" aria-orientation="horizontal" aria-describedby="sf-article-resize-help">' +
      '<span class="sf-article-resize-value" aria-hidden="true"></span></span>' +
      '<span class="sf-article-resize-hint"><span id="sf-article-resize-help">Drag to adjust article width</span>' +
      '<button class="sf-article-resize-hint-close" type="button" aria-label="Dismiss width tip">×</button></span></span>';
    handle.addEventListener("pointerdown", function (event) {
      if (!event.target.closest(".sf-article-resize-hint")) startArticleResize(event, article, handle);
    });
    handle.querySelector(".sf-article-resize-hint-close").addEventListener("click", function (event) {
      event.stopPropagation();
      dismissArticleResizeHint(handle);
      articleView.grip.focus({ preventScroll: true });
    });
    handle.addEventListener("pointerleave", function () { delete handle.dataset.hintSuppressed; });
    handle.addEventListener("focusout", function (event) {
      if (!handle.contains(event.relatedTarget)) delete handle.dataset.hintSuppressed;
    });
    handle.addEventListener("keydown", function (event) {
      if (!event.target.closest(".sf-article-resize-hint")) resizeArticleFromKeyboard(event, article);
    });
    handle.addEventListener("focusin", function () { updateArticleResizeHandle(article); });
    article.appendChild(handle);
    return handle;
  }

  function refreshArticleWidth() {
    if (articleResizeDrag) finishArticleResize(true);
    var article = articleView.article;
    if (!article || !article.isConnected) {
      updateArticleSidebarInset(null);
      return;
    }
    applyArticleViewPreference(article);
  }

  function enhanceCodeBlocks() {
    document.querySelectorAll(".md-typeset pre > code").forEach(function (code) {
      var pre = code.parentElement;
      if (!pre) return;
      if (isMermaidBlock(pre, code)) {
        pre.dataset.safespringEnhanced = "skip-mermaid";
        return;
      }

      if (pre.dataset.safespringEnhanced === "true") return;
      pre.dataset.safespringEnhanced = "true";
      enhanceCodeBlockMascot(pre);
      var language = inferLanguage(code);
      if (language) {
        pre.dataset.safespringLanguage = language;
      } else {
        pre.removeAttribute("data-safespring-language");
      }

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
        copyText(code.textContent).then(function () {
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

      var actions = document.createElement("div");
      actions.className = "safespring-code-actions";
      actions.appendChild(button);
      header.appendChild(label);
      header.appendChild(actions);
      pre.insertBefore(header, code);
      enhanceCodeBlockExpansion(pre, code);
    });
  }




  function updateCodeFocusToolbar(enabled = codeFocusEnabled) {
    codeFocusEnabled = enabled;
    articleView.modeButtons.forEach(function (button) {
      button.setAttribute("aria-pressed", String((button.dataset.sfView === "code") === codeFocusEnabled));
    });
    document.body.classList.toggle("sf-code-focus", codeFocusEnabled);
  }

  function updateArticleTextSizeControls() {
    var size = articleViewPreference.textSize;
    var buttons = articleView.textButtons;
    buttons[1].textContent = size + "%";
    buttons[1].setAttribute("aria-label", "Reset article text size (currently " + size + "%)");
    buttons[0].setAttribute("aria-disabled", String(size === articleTextSizes[0]));
    buttons[2].setAttribute("aria-disabled", String(size === articleTextSizes[articleTextSizes.length - 1]));
  }
  function changeArticleView(event) {
    var button = event.target.closest("button[data-sf-view], button[data-sf-text-size]");
    var article = articleView.article;
    if (!button || !articleView.toolbar.contains(button) || !article.isConnected) return;
    var resizingText = button.hasAttribute("data-sf-text-size");
    var size = articleViewPreference.textSize;
    if (resizingText) {
      var direction = Number(button.dataset.sfTextSize);
      size = direction === 0 ? 100 : articleTextSizes[articleTextSizes.indexOf(size) + direction];
      if (size === undefined || size === articleViewPreference.textSize) return;
    }
    finishArticleResize(true);
    var mode = resizingText ? articleViewPreference.mode : button.dataset.sfView;
    var width = mode === "code" ? articleViewPreference.width : null;
    if (!resizingText && (mode === "code") === codeFocusEnabled) {
      saveArticleViewPreference(mode, width, size);
      applyArticleViewPreference(article);
      return;
    }
    changeArticleLayout(article, function () {
      saveArticleViewPreference(mode, width, size);
      updateCodeFocusToolbar(mode === "code");
      updateArticleTextSizeControls();
      applyArticleViewPreference(article);
      if (resizingText) articleView.status.textContent = "Article text size " + size + "%";
    });
  }

  function createArticleToolbar() {
    var toolbar = document.createElement("div");
    toolbar.className = "sf-code-focus-toolbar";
    toolbar.setAttribute("role", "group");
    toolbar.setAttribute("aria-labelledby", "sf-code-focus-label");
    toolbar.innerHTML = '<div class="sf-view-options-card"><span class="sf-code-focus-label" id="sf-code-focus-label">View options</span>' +
      '<div class="sf-view-options-modes">' + ["reading", "code"].map(function (mode) {
      return '<button class="sf-code-focus-toggle" type="button" data-sf-view="' + mode + '" aria-describedby="sf-code-focus-description">' +
        '<span class="sf-code-focus-icon sf-code-focus-icon--' + mode + '" aria-hidden="true"></span>' +
        '<span>' + (mode === "code" ? "Wide" : "Default") + '</span></button>';
    }).join("") + '</div><span class="sf-code-focus-description" id="sf-code-focus-description">' +
      'Default restores the standard layout. Wide uses your saved article width and expands code blocks.</span>' +
      '<div class="sf-article-text-size" role="group" aria-labelledby="sf-article-text-size-label">' +
      '<span id="sf-article-text-size-label">Text size</span>' +
      '<div class="sf-article-text-stepper">' +
      '<button class="sf-article-text-size-button" type="button" data-sf-text-size="-1" aria-label="Decrease article text size">−</button>' +
      '<button class="sf-article-text-size-button" type="button" data-sf-text-size="0" aria-label="Reset article text size" title="Reset text size">100%</button>' +
      '<button class="sf-article-text-size-button" type="button" data-sf-text-size="1" aria-label="Increase article text size">+</button></div>' +
      '<span class="sf-code-focus-description" role="status"></span></div></div>';
    toolbar.onclick = changeArticleView;
    return toolbar;
  }

  function enhanceArticleCodeFocus() {
    if (codeFocusScrollCleanup) codeFocusScrollCleanup();
    var article = document.querySelector(".md-content article");
    var scrollwrap = document.querySelector(".md-sidebar--secondary > .md-sidebar__scrollwrap");
    var valid = article && article.querySelector("h1") && scrollwrap;
    if (!valid || articleView.article !== article || articleView.path !== location.pathname || articleView.toolbar.parentElement !== scrollwrap) {
      if (articleView.article) {
        articleView.article.classList.remove("sf-article-resizable");
        articleView.article.style.removeProperty("--sf-article-width");
        articleView.main.style.removeProperty("--sf-sidebar-inset");
        articleView.handle.remove();
        articleView.toolbar.remove();
      }
      articleView = {};
      if (valid) {
        var toolbar = createArticleToolbar();
        var handle = enhanceArticleResize(article);
        scrollwrap.prepend(toolbar);
        articleView = {
          article: article,
          path: location.pathname,
          toolbar: toolbar,
          handle: handle,
          main: article.closest(".md-main__inner"),
          content: article.closest(".md-content"),
          grip: handle.querySelector(".sf-article-resize-grip"),
          value: handle.querySelector(".sf-article-resize-value"),
          hint: handle.querySelector(".sf-article-resize-hint"),
          status: toolbar.querySelector('[role="status"]'),
          modeButtons: toolbar.querySelectorAll("[data-sf-view]"),
          textButtons: toolbar.querySelectorAll("[data-sf-text-size]")
        };
      }
    }
    document.body.classList.toggle("sf-code-focus", !!valid && codeFocusEnabled);
    if (!valid) return;
    updateCodeFocusToolbar();
    updateArticleTextSizeControls();
    applyArticleViewPreference(article);
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

  function classifyContentLink(link) {
    var href = link.getAttribute("href");
    if (!href || link.dataset.safespringLink) return;

    var type = "other";

    try {
      var url = new URL(href, window.location.href);
      var docsHostnames = {
        "docs.safespring.com": true,
        "www.docs.safespring.com": true
      };

      if (url.protocol === "mailto:") {
        type = "mailto";
      } else if (url.protocol === "tel:") {
        type = "tel";
      } else if (url.origin === window.location.origin || docsHostnames[url.hostname]) {
        type = url.pathname === window.location.pathname && url.hash ? "anchor" : "internal";
      } else if (url.protocol === "http:" || url.protocol === "https:") {
        type = "external";
      }
    } catch (error) {
      type = "other";
    }

    link.dataset.safespringLink = type;
  }

  function enhanceContentLinks() {
    document.querySelectorAll(".md-typeset a[href]").forEach(classifyContentLink);
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

  function isMobileNavViewport() {
    return window.matchMedia("(max-width: 76.234em)").matches;
  }

  function getTopLevelMobileNavItem(element) {
    var item = element.closest(".safespring-mobile-nav__item");
    if (!item) return null;

    var list = item.parentElement;
    if (!list || !list.matches(".md-nav--primary > .md-nav__list")) return null;

    return item;
  }

  function setSidebarScrollTop(nav) {
    var scrollwrap = nav.closest(".md-sidebar__scrollwrap");
    if (scrollwrap) scrollwrap.scrollTop = 0;
  }

  function setMobileNavSection(nav, input) {
    nav.querySelectorAll(":scope > .md-nav__list > .safespring-mobile-nav__item > .md-nav__toggle").forEach(function (toggle) {
      toggle.checked = toggle === input;
    });

    nav.classList.add("safespring-mobile-nav--section-open");
    setSidebarScrollTop(nav);
  }

  function closeMobileNavSection(nav) {
    nav.classList.remove("safespring-mobile-nav--section-open");
    setSidebarScrollTop(nav);
  }

  function enhanceMobileNavState() {
    var nav = document.querySelector(".md-nav--primary");
    if (!nav || nav.dataset.safespringMobileNavEnhanced === "true") return;

    nav.dataset.safespringMobileNavEnhanced = "true";

    var drawer = document.getElementById("__drawer");
    if (drawer) {
      drawer.addEventListener("change", function () {
        closeMobileNavSection(nav);
      });
    }

    nav.addEventListener("click", function (event) {
      if (!isMobileNavViewport()) return;

      var label = event.target.closest("label[for]");
      if (!label || !nav.contains(label)) return;

      if (label.classList.contains("md-nav__title") && label.closest(".md-nav[data-md-level='1']")) {
        event.preventDefault();
        closeMobileNavSection(nav);
        return;
      }

      var item = getTopLevelMobileNavItem(label);
      if (!item || !item.classList.contains("md-nav__item--nested")) return;

      var input = item.querySelector(":scope > .md-nav__toggle");
      if (!input) return;

      event.preventDefault();
      setMobileNavSection(nav, input);
    });
  }

  function enhancePage() {
    if (articleResizeDrag) finishArticleResize(true);
    enhanceSidebarScroll();
    enhanceMobileNavState();
    enhanceContentLinks();
    cleanupMermaidCodeBlockEnhancements();
    enhanceCodeBlocks();
    enhanceArticleCodeFocus();
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
    if (event.key === "Escape") {
      if (articleResizeDrag) {
        event.preventDefault();
        finishArticleResize(true);
      }
      closeMoreMenus();
    }
  });

  articleResizeMedia.addEventListener("change", refreshArticleWidth);
  articleHintIntroMedia.addEventListener("change", refreshArticleWidth);

  // Keep following an active drag even if capture is lost or the handle moves.
  ["pointermove", "pointerup", "pointercancel"].forEach(function (type) {
    window.addEventListener(type, trackArticleResize, true);
  });

  window.addEventListener("blur", function () {
    if (articleResizeDrag) finishArticleResize(true);
  });

  window.addEventListener("resize", function () {
    refreshArticleWidth();
    closeMoreMenus();
    scheduleMascotBubblePositions();
  });

  window.addEventListener("scroll", function () {
    scheduleMascotBubblePositions();
    if (!articleHintDismissed && articleView.handle) {
      showArticleResizeIntro(articleView.handle);
    }
  }, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleMascotBubblePositions, { passive: true });
    window.visualViewport.addEventListener("scroll", scheduleMascotBubblePositions, { passive: true });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      refreshArticleWidth();
      scheduleMascotBubblePositions();
    }).catch(function () {
      return;
    });
  }

})();
