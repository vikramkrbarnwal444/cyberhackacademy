// Counter Animation for Stats
function animateValue(id, start, end, duration) {
  let obj = document.getElementById(id);
  let range = end - start;
  let stepTime = Math.abs(Math.floor(duration / range));
  let current = start;
  let increment = end > start ? 1 : -1;
  let timer = setInterval(function () {
    current += increment;
    obj.textContent = current.toLocaleString();
    if (current == end) {
      clearInterval(timer);
    }
  }, stepTime);
}

// Run counters after page load
window.onload = function () {
  animateValue("attacks", 0, 48000, 2000);      // fake stat
  animateValue("data", 0, 3200, 2000);           // GB leaked
  animateValue("phishing", 0, 1280, 2000);       // phishing sites
};
