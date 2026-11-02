(function () {
  var statusEndpoint = "https://lbpj80qtys85.statuspage.io/api/v2/summary.json";
  var statusRequest;
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

  function setMaintenance(card, maintenances) {
    var link = card.querySelector("[data-safespring-status-maintenance]");
    if (!link) return;

    var activeMaintenances = (maintenances || []).filter(function (maintenance) {
      return maintenance.status && maintenance.status !== "completed";
    });

    if (!activeMaintenances.length) {
      link.hidden = true;
      link.textContent = "";
      return;
    }

    link.hidden = false;
    link.textContent = activeMaintenances.length === 1 ? "1 planned maintenance" : activeMaintenances.length + " planned maintenances";
  }

  function setUnavailable(card) {
    setOverall(card, { indicator: "unknown", description: "Unavailable" });
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
