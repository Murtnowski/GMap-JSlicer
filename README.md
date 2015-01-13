GMap-JSlicer
============

Image to Google Maps powered by javascript

```
slicer = new JSlicer(document.getElementById('map'), 'myImage.png');
slicer.init();
```

Allows you to view an image as a Google Map without have to do any pre-tiling or server-side work.  Its quick and simple to implement.

This is not production ready and really should be only used as a code sample.  However is does work.

We take a IMG element of the image we want to mapify then use Canvas to generate the necessary tiles used by Google Maps when rendering.  The entire process is done client side in Javascript.

Eventually when Web Workers get better support for Canvas, we will use them to improve performance.

Also on some mobile device won't load images over a certain size.  The iPhone is limited to width * height ≤ 3 * 1024 * 1024

See it in the wild: http://gvgmaps.com/
