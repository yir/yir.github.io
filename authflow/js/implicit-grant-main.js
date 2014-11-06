(function(window, $) {

    // if this is the child window, send the token to the parent window
    if(window.opener && window.opener !== window.top){
        window.opener.postMessage(JSON.stringify(getHashParams()), location.href);
        this.close();
    }

    // listen for the token from the child window
    window.onmessage = function(e){
        var params = JSON.parse(e.data),
            access_token = params.access_token,
            state = params.state,
            storedState = localStorage.getItem(stateKey);

        localStorage.removeItem(stateKey);
        
        var API_ENDPOINT = localStorage.getItem('use-new-api') === 'true' ? 'https://www.spotify.com/us/kdf4jfr2K/' : 'https://api.spotify.com/v1/me';
        
        if (access_token) {
            $.ajax({
                url: API_ENDPOINT,
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    
                    $('<pre></pre>').appendTo($('#loggedin')).text(JSON.stringify(response));

                    $('#login').hide();
                    $('#loggedin').show();
                    
                    // start image test
                    if(!location.hostname.match(/github/)){
                        var iframe = $('<iframe frameborder=no scrolling=no>').css({width:1200,height:630,border:0});
                        $('#loggedin').append(iframe);
                        iframe.attr('src', '/card-image/' + response.id + '/' + access_token);
                    }
                    // end image test

                },
                error: function (jqxhr, status, err) {
                    var errbox = $('<div class="alert alert-danger" role="alert"></div>').appendTo($('#login')).html(
                        'Could not retrieve data, check browser console for more details.<br>'+
                        '(Cross-origin isn\'t enabled for <b>www</b>.spotify.com, but it is for <b>api</b>.spotify.com.)'
                    );
                    setTimeout(function(){
                        errbox.fadeOut('slow', function(){ errbox.remove(); });
                    }, 5000);
                }
            });
        }
    };


    var app_id = 'fa47b31638ea4c86b1d48ad000a3c710';
    //var redirect_uri = 'http://yir.github.io/authflow/index.html';
    var redirect_uri = location.href;

    // [i think] state key is for "deep-linking" a user
    var stateKey = 'spotify_auth_state';

    var params = getHashParams(),
        access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }


    if (access_token && (state == null || state !== storedState)) {
        alert('There was an error during the authentication');
    } else {
        localStorage.removeItem(stateKey);
        if (!access_token) {
            $('#login').show();
            $('#loggedin').hide();
        }
        
        $('#use-new-api')[0].checked = localStorage.getItem('use-new-api') === 'true';
        $('#use-new-api').on('click', function() {
            var me = this;
            setTimeout(function(){
                localStorage.setItem('use-new-api', me.checked.toString());
            }, 50);
        });


        $('#login-button').on('click', function() {

            var state = generateRandomString(16);

            localStorage.setItem(stateKey, state);
            var scope = 'user-read-private user-read-email user-library-read user-library-modify playlist-read-private playlist-modify-private playlist-modify-public';

            var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(app_id);
            url += '&scope=' + encodeURIComponent(scope);
            url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
            url += '&state=' + encodeURIComponent(state);
//            var url = 'https://accounts.spotify.com/login?continue=' + encodeURIComponent(redirect_uri);

            popUp(url, "Spotify", 350, 550);
        });


        function popUp(url, title, w, h) {
            var left = (window.screenLeft || window.screenX) + (window.innerWidth / 2) - (w / 2);
            var top =  (window.screenTop || window.screenY) + (window.innerHeight / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }

    }
})(window, window.jQuery);
