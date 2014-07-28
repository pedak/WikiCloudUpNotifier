// ProFuse Wikipedia Adapter 
// v2.01
// Peter Kalchgruber
// University of Vienna
// Source: https://developer.chrome.com/extensions/options


// Saves options to chrome.storage
function save_options() {
  var server = document.getElementById('server').value;
  chrome.storage.sync.set({
    server: server,
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    server: 'http://example.com',
  }, function(items) {
    document.getElementById('server').value = items.server;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);