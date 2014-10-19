(function(window, $) {

    // if this is the child window, send the token to the parent window
    if(window.opener && window.opener !== window.top){
        window.opener.postMessage(JSON.stringify(getHashParams()), location.href, window.opener);
        this.close();
    }

    // listen for the token from the child window
    window.onmessage = function(e){
        console.log('received message', e.data);
        var params = JSON.parse(e.data),
            access_token = params.access_token,
            state = params.state,
            storedState = localStorage.getItem(stateKey);

        localStorage.removeItem(stateKey);
        if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    userProfilePlaceholder.html(userProfileTemplate(response));

                    $('#login').hide();
                    $('#loggedin').show();


                    // get user's playlists
                    $.ajax({
                        url: 'https://api.spotify.com/v1/users/' + response.id + '/playlists',
                        headers: {
                            'Authorization': 'Bearer ' + access_token
                        },
                        success: function (response) {
                            playlistsPlaceholder.html(playlistsTemplate(response));
                        }
                    });

                }
            });
        }
    };


    var app_id = 'fa47b31638ea4c86b1d48ad000a3c710';
    var redirect_uri = 'http://yir.github.io/authflow/index.html';

    // [i think] state key is for "deep-linking" a user
    var stateKey = 'spotify_auth_state';

    var userProfileTemplate = Handlebars.compile($('#user-profile-template').html()),
        userProfilePlaceholder = $('#user-profile'),
        playlistsTemplate = Handlebars.compile($('#playlists-template').html()),
        playlistsPlaceholder = $('#playlists');
        params = getHashParams(),
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
        if (access_token) {
//            $.ajax({
//                url: 'https://api.spotify.com/v1/me',
//                headers: {
//                    'Authorization': 'Bearer ' + access_token
//                },
//                success: function(response) {
//                    userProfilePlaceholder.html(userProfileTemplate(response));
//
//                    $('#login').hide();
//                    $('#loggedin').show();
//
//
//                    // get user's playlists
//                    $.ajax({
//                        url: 'https://api.spotify.com/v1/users/'+user_id+'/playlists',
//                        headers: {
//                            'Authorization': 'Bearer ' + access_token
//                        },
//                        success: function(response) {
//                            playlistsPlaceholder.html(playlistsTemplate(response));
//                        }
//                    });
//
//                }
//            });
        } else {
            $('#login').show();
            $('#loggedin').hide();
        }

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

            popUp(url, "Spotify", 350, 500);
        });


        function popUp(url, title, w, h) {
            wLeft = window.screenLeft ? window.screenLeft : window.screenX;
            wTop = window.screenTop ? window.screenTop : window.screenY;

            var left = wLeft + (window.innerWidth / 2) - (w / 2);
            var top = wTop + (window.innerHeight / 2) - (h / 2);
            return window.open(url, title, 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
        }

    }
})(window, window.jQuery);
