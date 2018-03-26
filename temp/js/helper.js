function Helper () {
    this.toObject = function toObject (arr) {
        var rv = {};
        for (var i = 0; i < arr.length; ++i)
            rv[i] = arr[i];
        return rv;
    }
}

function Http (server) {
    if (window.location.hostname === "172.17.0.1") {
        this.url = {
            node: 'http://172.17.0.1:8443'
        }
    } else {
        this.url = {
            node: 'http://lc.unigrow.ttrks.de:8443'
        }
    }
    this.get = function get (route, success = function (){}, error = function (){} ) {
        $.ajax({
            type: 'GET',
            url: this.url[server] + route,
            success: function(data) {
                success(JSON.parse(data));
            },
            error: function(err) {
                console.log(err);
                error(err);
            }
        });
    }
    this.post = function post (route, data = {}, success = function (){}, error = function (){} ) {
        $.ajax({
            type: 'POST',
            data: JSON.stringify(data),
            contentType: 'application/json',
            url: this.url[server] + route,
            success: function(data) {
                success(JSON.parse(data));
            },
            error: function(err) {
                console.log(err);
                error(err);
            }
        });
    }
}
