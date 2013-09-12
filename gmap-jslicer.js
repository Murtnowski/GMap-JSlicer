/**
 * GMap-JSlicer v0.1
 * Author: Matt Urtnowski
 * GitHub: https://github.com/Murtnowski/GMap-JSlicer
 *
 * Not Production Ready
 * For use as code sample only
 **/
function JSlicer(target, src) {
    this.img;
    this.target = target;
    this.src = src;
    this.centreLat = 0.0;
    this.centreLon = 0.0;
    this.initialZoom = 3;
    this.imageWraps = false;
    this.map;
    this.gmicMapType;
}

function GMICMapType(img) {
    this.sourceImg = img;
    this.Cache = Array();
    this.opacity = 1.0;
}
    
(function() {        
    JSlicer.prototype.init = function init() {
        var that = this;
        
        var downloadAsset = function(src, callback) {
            if(!this.img) {
                var img = document.createElement('img');
                
                img.onerror = function() {
                    console.log(src + ' failed to load');
                    if(callback) {
                        callback(false);
                    }
                };

                img.onload = function() {
                    var canvas = document.createElement('canvas'); 
                    var dimension = Math.max(img.width, img.height);
                    canvas.width = dimension;
                    canvas.height = dimension;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(img, (dimension - img.width) / 2, (dimension - img.height) / 2);
                    
                    
                    img.onload = function() {
                        img.removeEventListener('onload', arguments.callee, false);
                        that.img = img;
                        if(callback) {
                            callback(img);
                        }
                    };
                    
                    img.src = canvas.toDataURL();
                };
                
                img.src = src;
            } else {
                if(callback) {
                    callback(this.img);
                }
            }
        };
        
        var load =  function() {
            that.resizeMapDiv();
            var latlng = new google.maps.LatLng(that.centreLat, that.centreLon);
            var myOptions = {
                zoom: that.initialZoom,
                minZoom: 0,
                maxZoom: 7,
                center: latlng,
                panControl: true,
                zoomControl: true,
                mapTypeControl: true,
                scaleControl: false,
                streetViewControl: false,
                overviewMapControl: true,
                mapTypeControlOptions: { 
                    mapTypeIds: ["GameMap"],
                    position: google.maps.ControlPosition.TOP_RIGHT,
                    style: google.maps.MapTypeControlStyle.DEFAULT
                },
            mapTypeId: "GameMap"
            }
            
            map = new google.maps.Map(that.target, myOptions);
            gmicMapType = new GMICMapType(that.img);
            map.mapTypes.set("GameMap",gmicMapType);
            
            if(!that.imageWraps) {
                that.setBounds();
            }
        };

        downloadAsset(this.src, function() {
            load();
        });
    };
    
    JSlicer.prototype.resizeMapDiv = function resizeMapDiv() {
        var d = this.target;

        var offsetTop = 0;
        for (var elem = d; elem != null; elem = elem.offsetParent) {
            offsetTop += elem.offsetTop;

        }
        
        var height = getWindowHeight() - offsetTop - 16;

        if (height>=0) {
            d.style.height=height+"px";
        }
    };
    
    JSlicer.prototype.setBounds = function setBounds() {
        var allowedBounds = new google.maps.LatLngBounds(
             new google.maps.LatLng(-85.0, -180.0), 
             new google.maps.LatLng(85.0, 180.0)
        );
        
        var lastValidCenter = map.getCenter();
        
        google.maps.event.addListener(map, 'center_changed', function() {
            if (allowedBounds.contains(map.getCenter())) {
                lastValidCenter = map.getCenter();
                return; 
            }
            
            map.panTo(lastValidCenter);
        });
    };
    
    JSlicer.prototype.redraw = function redraw() {
        var zoom = map.getZoom();
        map.setZoom(0);
        setTimeout(function(){map.setZoom(zoom);}, 0);
    };

    GMICMapType.prototype.tileSize = new google.maps.Size(256, 256);
    GMICMapType.prototype.maxZoom = 19;
    GMICMapType.prototype.getTile = function(coord, zoom, ownerDocument) {
        var c = Math.pow(2, zoom);
        var tilex=coord.x,tiley=coord.y;
        if (this.imageWraps) {
            if (tilex<0) tilex=c+tilex%c;
            if (tilex>=c) tilex=tilex%c;
            if (tiley<0) tiley=c+tiley%c;
            if (tiley>=c) tiley=tiley%c;
        }
        else {
            if ((tilex<0)||(tilex>=c)||(tiley<0)||(tiley>=c))
            {
                var blank = ownerDocument.createElement('DIV');
                blank.style.width = this.tileSize.width + 'px';
                blank.style.height = this.tileSize.height + 'px';
                return blank;
            }
        }

        var img = ownerDocument.createElement('img');

        img.id = "t_" + zoom + "_" + tilex + "_" + tiley;
        img.style.width = this.tileSize.width + 'px';
        img.style.height = this.tileSize.height + 'px';

        var canvas = ownerDocument.createElement('canvas'); 
        canvas.width = this.tileSize.width;
        canvas.height = this.tileSize.height
        var ctx = canvas.getContext("2d");
        ctx.drawImage(this.sourceImg, this.sourceImg.width / Math.pow(2, zoom) * tilex, this.sourceImg.height / Math.pow(2, zoom) * tiley, this.sourceImg.width / Math.pow(2, zoom), this.sourceImg.height / Math.pow(2, zoom), 0, 0, this.tileSize.width, this.tileSize.height);
        img.src = canvas.toDataURL();

        this.Cache.push(img);

        return img;
    };
    
    GMICMapType.prototype.realeaseTile = function(tile) {
        var idx = this.Cache.indexOf(tile);
        if(idx!=-1) this.Cache.splice(idx, 1);
        tile=null;
    };
    
    GMICMapType.prototype.name = "GMap-JSlicer";
    GMICMapType.prototype.alt = "GMap-JSlicer";
    GMICMapType.prototype.setOpacity = function(newOpacity) {
        this.opacity = newOpacity;
        for (var i = 0; i < this.Cache.length; i++) {
            this.Cache[i].style.opacity = newOpacity;
            this.Cache[i].style.filter = "alpha(opacity=" + newOpacity * 100 + ")"; //ie
        }
    };
    
    getWindowHeight = function() {
        if (window.self&&self.innerHeight) {
            return self.innerHeight;
        }
        if (document.documentElement&&document.documentElement.clientHeight) {
            return document.documentElement.clientHeight;
        }
        return 0;
    };
 })();