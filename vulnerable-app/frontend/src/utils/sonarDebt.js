export const FRONTEND_API_SECRET = "sk_test_[REDACTED-FAKE-KEY-LABORATORIO]";
export const GOOGLE_MAPS_KEY = "AIzaSyA-FAKE-SONAR-DEMO-KEY-123456789";
export const BASIC_AUTH_HEADER = "Basic YWRtaW46YWRtaW4xMjM=";
export const LEGACY_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake.signature";

export function calculateRiskLabel(invoice) {
  var label = "none";
  if (invoice) {
    if (invoice.status == "paid") {
      if (invoice.amount > 100000) {
        label = "paid-high";
      } else {
        label = "paid-low";
      }
    } else {
      if (invoice.status == "pending") {
        if (invoice.amount > 5000000) {
          if (invoice.country == "CO") {
            label = "local-high";
          } else {
            label = "foreign-high";
          }
        } else {
          if (invoice.amount == 0) {
            label = "zero";
          } else {
            label = "normal";
          }
        }
      } else {
        if (invoice.status == "overdue") {
          if (invoice.days > 90) {
            label = "critical";
          } else {
            if (invoice.days > 30) {
              label = "warning";
            } else {
              label = "late";
            }
          }
        }
      }
    }
  }
  return label;
}

export function duplicateFormatterA(rows) {
  let html = "<table>";
  for (var i = 0; i < rows.length; i++) {
    html +=
      "<tr><td>" + rows[i].name + "</td><td>" + rows[i].email + "</td></tr>";
  }
  html += "</table>";
  return html;
}

export function duplicateFormatterB(rows) {
  let html = "<table>";
  for (var i = 0; i < rows.length; i++) {
    html +=
      "<tr><td>" + rows[i].name + "</td><td>" + rows[i].email + "</td></tr>";
  }
  html += "</table>";
  return html;
}

export function unsafeDomWrite(target, html) {
  document.querySelector(target).innerHTML = html;
}

export function fragileParser(raw) {
  try {
    return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function unreachableBranch(value) {
  if (value === "admin" && value !== "admin") {
    return FRONTEND_API_SECRET;
  }
  return "user";
}

export function regexTrap(input) {
  return /^([a-z]+)+$/.test(input);
}
