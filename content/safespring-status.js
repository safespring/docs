(function () {
  var statusEndpoint = "https://lbpj80qtys85.statuspage.io/api/v2/summary.json";
  var statusRequest;
  var serviceLabels = {
    "Safespring Kubernetes Engine": "Kubernetes",
    "Safespring Compute": "Compute",
    "Safespring Storage": "Storage",
    "Safespring Backup": "Backup",
    "Safespring Portal": "Portal",
    "Safespring Private Cloud": "Private Cloud"
  };
  var statusLabels = {
    degraded_performance: "Degraded",
    major_outage: "Major outage",
    operational: "Operational",
    partial_outage: "Partial outage",
    under_maintenance: "Maintenance"
  };
  var overallLabels = {
    critical: "Critical incident",
    major: "Major incident",
    maintenance: "Maintenance",
    minor: "Minor incident",
    none: "Operational"
  };

  function statusKey(value) {
    return String(value || "unknown").replace(/_/g, "-");
  }

  function componentLabel(status) {
    return statusLabels[status] || "Unknown";
  }

  function overallLabel(status) {
    if (!status) return "Unknown";
    if (status.indicator === "none") return status.description || "All Systems Operational";
    return overallLabels[status.indicator] || status.description || "Unknown";
  }

  function setOverall(card, status) {
    var overall = card.querySelector("[data-safespring-status-overall]");
    var text = card.querySelector("[data-safespring-status-overall-text]");
    if (!overall || !text) return;

    overall.dataset.safespringStatusOverall = statusKey(status && status.indicator);
    text.textContent = overallLabel(status);
  }

  function setComponentRow(row, component) {
    var text = row.querySelector("[data-safespring-status-component-text]");
    var status = component ? component.status : "unknown";

    row.dataset.safespringStatusComponentState = statusKey(status);
    if (text) text.textContent = componentLabel(status);
  }

  function element(tag, properties, ...children) {
    const node = Object.assign(document.createElement(tag), properties);
    node.append(...children);
    return node;
  }

  function setMaintenance(card, maintenances) {
    const section = card.querySelector("[data-safespring-status-maintenance]");
    const list = card.querySelector("[data-safespring-status-maintenance-list]");
    if (!section || !list) return;

    const now = Date.now();
    const upcoming = (Array.isArray(maintenances) ? maintenances : [])
      .filter(m => m && m.status === "scheduled" && m.id && Date.parse(m.scheduled_for) > now)
      .sort((a, b) => Date.parse(a.scheduled_for) - Date.parse(b.scheduled_for));
    list.textContent = "";
    const all = section.querySelector(".safespring-status-card__maintenance-all");
    all.hidden = upcoming.length <= 3;
    all.textContent = "View all maintenance (" + upcoming.length + ")";
    section.hidden = !upcoming.length;
    if (!upcoming.length) return;

    const dateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" });
    list.append(...upcoming.slice(0, 3).map(maintenance => {
      const names = [...new Set((Array.isArray(maintenance.components) ? maintenance.components : [])
        .map(c => c && typeof c.name === "string" ? c.name.trim() : "").filter(Boolean))];
      const services = names.join(", ") || maintenance.name || "See maintenance details";
      const date = dateFormat.format(new Date(maintenance.scheduled_for));
      const label = [date, services, names.length && maintenance.name].filter(Boolean).join(" — ");
      const link = element("a", {
        className: "safespring-status-card__maintenance-link", title: label,
        href: "https://status.safespring.com/incidents/" + encodeURIComponent(maintenance.id)
      }, element("time", { dateTime: maintenance.scheduled_for, textContent: date }), element("span", {
        className: "safespring-status-card__maintenance-services",
        textContent: names.map(name => serviceLabels[name] || name).join(", ") || services
      }));
      link.setAttribute("aria-label", label);
      return element("li", {}, link);
    }));
  }

  function setUnavailable(card) {
    setOverall(card, { indicator: "unknown", description: "Unavailable" });
    setMaintenance(card, []);
    card.querySelectorAll("[data-safespring-status-component]").forEach(function (row) {
      row.dataset.safespringStatusComponentState = "unknown";
      var text = row.querySelector("[data-safespring-status-component-text]");
      if (text) text.textContent = "Unavailable";
    });
  }

  function renderStatus(card, data) {
    var components = {};
    (data.components || []).forEach(function (component) {
      components[component.name] = component;
    });

    setOverall(card, data.status);
    card.querySelectorAll("[data-safespring-status-component]").forEach(function (row) {
      setComponentRow(row, components[row.dataset.safespringStatusComponent]);
    });
    setMaintenance(card, data.scheduled_maintenances);
  }

  function fetchStatus() {
    if (!statusRequest) {
      statusRequest = fetch(statusEndpoint, { headers: { accept: "application/json" } })
        .then(function (response) {
          if (!response.ok) throw new Error("Status request failed");
          return response.json();
        })
        .catch(function (error) {
          statusRequest = null;
          throw error;
        });
    }

    return statusRequest;
  }

  function enhanceStatusCards() {
    document.querySelectorAll("[data-safespring-status]").forEach(function (card) {
      if (card.dataset.safespringStatusEnhanced === "true") return;
      card.dataset.safespringStatusEnhanced = "true";

      fetchStatus()
        .then(function (data) {
          renderStatus(card, data);
        })
        .catch(function () {
          setUnavailable(card);
        });
    });
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(enhanceStatusCards);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", enhanceStatusCards);
  } else {
    enhanceStatusCards();
  }
})();
