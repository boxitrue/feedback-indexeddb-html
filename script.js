const dbName = "FeedbackDB";
const storeName = "feedback_reports";

let db;
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadFeedback();
};

document.getElementById("feedbackForm").addEventListener("submit", function (e) {
  e.preventDefault();
  const form = e.target;
  const entry = {
    name: form.name.value,
    email: form.email.value,
    summary: form.summary.value,
    details: form.details.value,
    timestamp: new Date().toISOString()
  };

  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).add(entry);
  tx.oncomplete = () => {
    form.reset();
    loadFeedback();
  };
});

function loadFeedback() {
  const tx = db.transaction(storeName, "readonly");
  const store = tx.objectStore(storeName);
  const request = store.getAll();

  request.onsuccess = function () {
    const container = document.getElementById("feedbackCards");
    container.innerHTML = "";
    request.result.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(entry => {
      const card = document.createElement("div");
      card.className = "feedback-alert-card";
      card.innerHTML = `
        <strong>${entry.summary}</strong><br/>
        <small>${entry.timestamp}</small><br/>
        ${entry.details ? `<p>${entry.details}</p>` : ""}
        ${entry.name ? `<em>From: ${entry.name}</em>` : ""}
      `;
      container.appendChild(card);
    });
  };
}
