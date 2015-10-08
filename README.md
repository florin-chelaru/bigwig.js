# bigwig.js
Bigwig Library for JavaScript

# Installation

`bower install git://github.com/florin-chelaru/bigwig.js.git`

Add this script to your web page: 

```html
<script src="bigwig.min.js"></script>
```

# Usage

```javascript
var bigwigFile = new bigwig.BigwigFile('http://.../file.bigwig');
bigwigFile.query('chr1', 100000, 200000)
  .then(function(records) {
    records.forEach(function(record) {
      console.log(record.toJSON());
    });
  });
```

# Known issues

When trying to query a file, you get this error:

`XMLHttpRequest cannot load http://.../file.bigwig. No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost' is therefore not allowed access.`

This means that JavaScript cannot access the file because it is being blocked by the web browser for not being located 
on the same domain. There is no JavaScript solution for this problem yet; *workarounds*:

* if possible, place `bigwig.min.js` on the same domain as the bigwig file

* create a local PHP server and use the script `test/partial.php` to forward requests from JavaScript to the server storing the bigwig file;
then, the instantiation of the bigwig file becomes, for example:

```javascript
var bigwigFile = new bigwig.BigwigFile(
  'http://egg2.wustl.edu/roadmap/data/byFileType/signal/consolidated/macs2signal/pval/E001-H3K4me1.pval.signal.bigwig',
  'http://epiviz-dev.cbcb.umd.edu/bigwig/partial.php');
bigwigFile.query('chr1', 100000, 200000)
  .then(function(records) {
    records.forEach(function(record) {
      console.log(record.toJSON());
    });
  });
```

* write a script similar to `test/partial.php` that forwards requests from JavaScript to the server storing the bigwig file

# Demo

Demos are located in `test/index-min.html` (and for the uncompiled sources, in `test/index.html`).
