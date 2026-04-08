

$(function() {
    // Create the app
    var app = new Hnd.App({
      searchEngineMinChars: 3,
      searchEngineAccentInsensitive: false
    });
    // Update translations
    hnd_ut(app);
    // Instanciate imageMapResizer
    imageMapResize();
    // Custom JS
    try{
(function () {
  "use strict";

  var lastSignature = "";
  var leftNavCollapsed = false;

function getPageSignature() {
  var h1 = Array.from(document.querySelectorAll("h1")).find(function (el) {
    return isVisible(el) &&
      !el.closest("nav") &&
      !el.closest("aside") &&
      !el.closest("#right-nav") &&
      !el.closest("header");
  });

  var title = h1 ? (h1.textContent || "").trim() : "";
  var headingCount = getHeaders().length;
  return location.href + "||" + title + "||" + headingCount;
}

function getContentRoot() {
  var candidates = [
    document.querySelector("#topic_content"),
    document.querySelector(".topic-content"),
    document.querySelector(".topic"),
    document.querySelector("article"),
    document.querySelector("main")
  ].filter(Boolean);

  if (!candidates.length) return document.body;

  var best = candidates[0];
  var bestCount = 0;

  candidates.forEach(function (el) {
    var count = el.querySelectorAll("h2, h3, h4").length;
    if (count > bestCount) {
      best = el;
      bestCount = count;
    }
  });

  return best;
}

function isVisible(el) {
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
}

function getHeaders() {
  return Array.from(document.querySelectorAll("h2, h3, h4")).filter(function (h) {
    var text = (h.textContent || "").trim();
    if (!text) return false;
    if (!isVisible(h)) return false;

    /* Exclude headings inside navigation / chrome */
    if (h.closest("#right-nav")) return false;
    if (h.closest("nav")) return false;
    if (h.closest("aside")) return false;
    if (h.closest("#contents")) return false;
    if (h.closest("#toc")) return false;
    if (h.closest(".tree")) return false;
    if (h.closest(".treeview")) return false;
    if (h.closest("header")) return false;

    return true;
  });
}

  function slugify(text) {
    return (text || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function ensureIds(headers) {
    var used = {};

    headers.forEach(function (h, i) {
      if (!h.id || !h.id.trim()) {
        var base = slugify(h.textContent) || ("section-" + i);
        var id = base;
        var counter = 2;

        while (document.getElementById(id) || used[id]) {
          id = base + "-" + counter;
          counter++;
        }

        h.id = id;
        used[id] = true;
      } else {
        used[h.id] = true;
      }
    });
  }

  function setActiveLink(activeId) {
    document.querySelectorAll("#right-nav a.right-nav-link").forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + activeId;
      link.classList.toggle("active", isActive);
    });
  }

  function expandActiveGroup(activeId) {
    var activeLink = document.querySelector('#right-nav a.right-nav-link[href="#' + activeId + '"]');
    if (!activeLink) return;

    var groupItems = activeLink.closest(".nav-group-items");
    if (groupItems && groupItems.classList.contains("collapsed")) {
      groupItems.classList.remove("collapsed");

      var title = groupItems.previousElementSibling;
      if (title && title.classList.contains("nav-group-title")) {
        title.classList.remove("collapsed");
      }
    }
  }

  function updateActive() {
    var headers = getHeaders();
    if (!headers.length) return;

    var activeId = headers[0].id;
    var triggerLine = 140;

    headers.forEach(function (h) {
      var rect = h.getBoundingClientRect();
      if (rect.top <= triggerLine) {
        activeId = h.id;
      }
    });

    setActiveLink(activeId);
    expandActiveGroup(activeId);
  }

  function buildRightNav() {
    if (!document.body) return;

    var headers = getHeaders();
    var existingNav = document.getElementById("right-nav");

    if (!headers.length) {
      if (existingNav) existingNav.remove();
      return;
    }

    ensureIds(headers);

    var nav = existingNav;
    if (!nav) {
      nav = document.createElement("div");
      nav.id = "right-nav";
      document.body.appendChild(nav);
    }

    nav.innerHTML = "";

    var title = document.createElement("div");
    title.className = "right-nav-title";
    title.textContent = "On this page";
    nav.appendChild(title);

    var currentGroupItems = null;

    headers.forEach(function (h) {
      var tag = h.tagName.toLowerCase();
      var text = (h.textContent || "").trim();
      if (!text) return;

      if (tag === "h2") {
        var group = document.createElement("div");
        group.className = "nav-group";

        var groupTitle = document.createElement("div");
        groupTitle.className = "nav-group-title";
        groupTitle.textContent = text;

        var groupItems = document.createElement("div");
        groupItems.className = "nav-group-items";

        groupTitle.addEventListener("click", function () {
          groupItems.classList.toggle("collapsed");
          groupTitle.classList.toggle("collapsed");
        });

        group.appendChild(groupTitle);
        group.appendChild(groupItems);
        nav.appendChild(group);

        currentGroupItems = groupItems;
      } else {
        var link = document.createElement("a");
        link.href = "#" + h.id;
        link.textContent = text;
        link.className = "right-nav-link " + tag;

        link.addEventListener("click", function (e) {
          e.preventDefault();

          if (history.replaceState) {
            history.replaceState(null, "", "#" + h.id);
          } else {
            location.hash = "#" + h.id;
          }

          h.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });

          setActiveLink(h.id);
          expandActiveGroup(h.id);
        });

        if (currentGroupItems) {
          currentGroupItems.appendChild(link);
        } else {
          nav.appendChild(link);
        }
      }
    });

    var back = document.createElement("div");
    back.className = "back-to-top";
    back.textContent = "↑ Back to top";
    back.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    nav.appendChild(back);

    updateActive();
  }

  function refreshIfNeeded() {
    var sig = getPageSignature();
    if (sig !== lastSignature) {
      lastSignature = sig;
      leftNavCollapsed = false; // reset so collapse runs again on new page
      setTimeout(buildRightNav, 50);
      setTimeout(buildRightNav, 250);
      setTimeout(buildRightNav, 700);
      setTimeout(buildRightNav, 1200);
    }
  }

  function addCopyButtons() {
    var pres = document.querySelectorAll("pre");

    pres.forEach(function (pre) {
      if (pre.querySelector(".copy-code-btn")) return;

      var btn = document.createElement("button");
      btn.className = "copy-code-btn";
      btn.type = "button";
      btn.textContent = "Copy";

      btn.addEventListener("click", function () {
        var code = pre.innerText || pre.textContent || "";

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(code).then(function () {
            btn.textContent = "Copied";
            btn.classList.add("copied");

            setTimeout(function () {
              btn.textContent = "Copy";
              btn.classList.remove("copied");
            }, 1200);
          });
        }
      });

      pre.appendChild(btn);
    });
  }

  function collapseLeftNav() {
    if (!window.jQuery) return;

    // Find the jsTree container via its rendered UL
    var treeUl = document.querySelector(".jstree-container-ul");
    if (!treeUl) return;

    var $treeContainer = jQuery(treeUl.parentElement);
    if (!$treeContainer.length) return;

    // .jstree(true) returns false if not yet initialized
    var instance = $treeContainer.jstree(true);
    if (!instance) return;

    // Collapse all nodes
    instance.close_all();
    leftNavCollapsed = true;

    // After collapsing, re-open just the parent of the active page item
    setTimeout(function () {
      var activeAnchor = $treeContainer[0].querySelector(".jstree-clicked");
      if (activeAnchor) {
        var activeLi = activeAnchor.closest("li");
        var parentLi = activeLi ? activeLi.parentElement.closest("li") : null;
        if (parentLi) {
          instance.open_node(parentLi);
        }
      }
    }, 100);
  }

  // Poll for jsTree to be ready — handles fast servers (e.g. GitHub Pages)
  // where ready.jstree may fire before our listener is attached
  function pollForJsTree() {
    var attempts = 0;
    var maxAttempts = 20; // try for up to ~5 seconds
    var interval = setInterval(function () {
      attempts++;
      if (leftNavCollapsed || attempts >= maxAttempts) {
        clearInterval(interval);
        return;
      }
      collapseLeftNav();
    }, 250);
  }

  function refreshUi() {
    buildRightNav();
    addCopyButtons();
    collapseLeftNav();
  }

  refreshUi();
  setTimeout(refreshUi, 250);
  setTimeout(refreshUi, 700);
  setTimeout(refreshUi, 2500);
  setTimeout(refreshUi, 4000);

  // Listen for jsTree's ready event as a primary trigger
  if (window.jQuery) {
    jQuery(document).on("ready.jstree", function () {
      setTimeout(collapseLeftNav, 100);
      setTimeout(collapseLeftNav, 500);
    });
  }

  // Also poll as a fallback for when the event is missed (e.g. GitHub Pages)
  pollForJsTree();

  setInterval(refreshIfNeeded, 500);

  window.addEventListener("scroll", function () {
    window.requestAnimationFrame(updateActive);
  }, { passive: true });

  window.addEventListener("resize", function () {
    setTimeout(updateActive, 50);
  });

  if (window.app && app.EVENTS && app.EVENTS.onTopicChanged) {
    app.EVENTS.onTopicChanged(function () {
      setTimeout(refreshUi, 100);
      setTimeout(refreshUi, 300);
      setTimeout(refreshUi, 800);
      setTimeout(refreshUi, 1200);
    });
  }
})();
}catch(e){console.warn("Exception in custom JavaScript Code:", e);}
    // Boot the app
    app.Boot();
});