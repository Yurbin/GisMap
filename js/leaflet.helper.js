var leafletHelper = (function() {
    var iconArray = [
        { iconName: "Default", iconFile: "../css/images/marker-icon.png" },
        { iconName: "Air", iconFile: "../css/images/icon/Air.png" },
        { iconName: "Airport", iconFile: "../css/images/icon/Airport.png" },
        { iconName: "Fire", iconFile: "../css/images/icon/Fire.png" },
        {
            iconName: "Fire_Station",
            iconFile: "../css/images/icon/Fire_Station.png"
        },
        { iconName: "Gas", iconFile: "../css/images/icon/Gas.png" },
        { iconName: "Water", iconFile: "../css/images/icon/Water.png" }
    ];

    return {
        getUrlParam: function(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
            var r = decodeURI(window.location.search.substr(1)).match(reg); //匹配目标参数
            if (r != null) return unescape(r[2]);
            return null; //返回参数值
        },
        iconArray: iconArray,
        getIcon: function() {
            var rbiIcon = {};
            iconArray.forEach(function(o) {
                rbiIcon[o.iconName] = L.icon({
                    iconUrl: o.iconFile,
                    iconSize: [35, 35],
                    iconAnchor: [12, 35],
                    popupAnchor: [0, -35],
                    shadowUrl: "../css/images/marker-shadow.png",
                    shadowSize: [41, 41]
                });
            });
            rbiIcon["Default"] = L.icon({
                iconUrl: "../css/images/marker-icon.png",
                iconRetinaUrl: "../css/images/marker-icon-2x.png",
                shadowUrl: "../css/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                tooltipAnchor: [16, -28],
                shadowSize: [41, 41]
            });
            return rbiIcon;
        },
        // 将经纬度坐标转换成字符串
        latlngToPoints: function(layer) {
            var latlngs = [],
                points = "";
            if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
                latlngs = layer.getLatLngs()[0];
                points = latlngs
                    .map(function(o) {
                        return o.lat + "," + o.lng;
                    })
                    .join(";");
            } else if (layer instanceof L.Polyline) {
                latlngs = layer.getLatLngs();
                points = latlngs
                    .map(function(o) {
                        return o.lat + "," + o.lng;
                    })
                    .join(";");
            } else if (layer instanceof L.Marker) {
                latlngs = layer.getLatLng();
                points = latlngs.lat + "," + latlngs.lng;
            }
            return points;
        },
        // 将字符串转换成经纬度坐标
        pointToLaglngs: function(data) {
            var latlngs = [];
            switch (data.AreaType) {
                case "circle":
                case "marker":
                    latlngs = data.Points.split(",");
                    break;
                default:
                    latlngs = data.Points.split(";").map(function(o) {
                        return o.split(",");
                    });
                    break;
            }
            return latlngs;
        },
        updateLayer: function(layer, data) {
            if (layer["setStyle"]) {
                layer.setStyle({
                    color: data.StrokeColor,
                    weight: data.StrokeWeight,
                    opacity: data.StrokeOpacity,
                    fillColor: data.FillColor,
                    fillOpacity: data.FillOpacity
                });
            }
            if (layer["setIcon"] && data.IconFile) {
                layer.setIcon(rbiIcon[data.IconFile]);
            }
        },
        ajaxHelper: function(uri, method, data) {
            return $
                .ajax({
                    type: method,
                    url: uri,
                    dataType: "json",
                    contentType: "application/json",
                    data: data ? JSON.stringify(data) : null
                })
                .fail(function(jqXHR, textStatus, errorThrown) {
                    console.error(errorThrown);
                });
        },
        getProjs: function(url, callBack) {
            var self = this;
            self.ajaxHelper(url, "GET").done(function(data) {
                var arrLayer = [];
                data.forEach(function(item) {
                    var latlngs = self.pointToLaglngs(item);
                    var layer = L[item.AreaType](latlngs, item);
                    layer.proj = item;
                    self.updateLayer(layer, item);
                    arrLayer.push(layer);
                });
                callBack(arrLayer);
            });
        }
    };
})();
