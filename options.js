// FactCheck
// v0.1
// Peter Kalchgruber
// University of Vienna
// Source: https://developer.chrome.com/extensions/options


// Saves options to chrome.storage
function save_options() {
  var server = document.getElementById('server').value;
  var disabled = document.getElementById('disabled').checked;
  chrome.storage.sync.set({
    server: server,
    disabled: disabled,
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
    server: 'https://fcheck.mminf.univie.ac.at',
    disabled: false,
  }, function(items) {
    document.getElementById('server').value = items.server;
    if (items.disabled == true){
      document.getElementById('disabled').checked = true;
  }
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);