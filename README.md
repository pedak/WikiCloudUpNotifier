PF-Wikipedia-Cloud-Update-Notifier
===================================

Install Chrome-Addon
--------
- Download Files: https://github.com/pedak/WikiCloudUpNotifier/archive/master.zip
- Open Chrome
- Tools -> Extensions
- Enable Developer Mode
- Load unpacked extension...
- Select downloaded folder


Setup Chrome-Addon
--------
- Open Tools -> Extensions -> Wi-Cloud-Update-Notifier
- Options
- Enter URL of PF-Server e.g. http://example.com:8080 (do not forget http at the beginning)


Enjoy to be informed on new updates on equivalent resources of the current Wikipedia article.

Background
----------
Browserplugin extracts wikipedia article of url
if article was opened already in the past, plugin searches for datestamp of last check
plugin calls url of middleware with article (and datestamp optionally)

