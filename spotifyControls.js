module.exports = {
    getUserdata: getData,
    getPlaylist: getPlaylist,
    hasPlayingDevice: hasPlayingDevice,
    isCurrentlyPlaying: isCurrentlyPlaying,
    getCurrentlyPlaying: getCurrentlyPlaying,
    pauseCurrentPlaying: pauseCurrentPlaying,
    resumeCurrentPlaying: resumeCurrentPlaying,
    skipToNext: skipToNext,
    skipToPrevious: skipToPrevious

}


const SpotifyWebApi = require('spotify-web-api-node');
const spotifyApi = new SpotifyWebApi({
    redirectUri: 'http://localhost:8888/callback',
    clientId: "213bc537dc824f9392d9521c2c1f662e",
    clientSecret: "497b586b791047bd95655261581a3165"
});


process.on('warning', (err) => {
    console.log('=====================================================');
    console.log([err.message]);
    console.log('=====================================================');
    if(err.message.split('\n')[1] == "Details: The access token expired." || err.message.split('\n')[1] == "Details: No token provided."){
        console.log('loading auth window');
        const spotifyAuth = require('./spotify');
        spotifyAuth.getAccessToken(spotifyApi)
    }
})

async function getData(){
    const me = await spotifyApi.getMe();
    return me.body;
}

async function getPlaylist(userId) {
    const d = await spotifyApi.getUserPlaylists(userId);
    d.body.items.forEach(item => {
        console.log(item);
    })
}

async function hasPlayingDevice(){
    const devices = await spotifyApi.getMyDevices()
    if(devices.body.devices.length > 0 && !devices.body.devices[0].is_restricted) return true;
    else return false;
}

async function isCurrentlyPlaying(){
    return await (await spotifyApi.getMyCurrentPlaybackState()).body.is_playing
}

async function getCurrentlyPlaying(){
    const data = await spotifyApi.getMyCurrentPlayingTrack()
    return data.body;
}

async function pauseCurrentPlaying() {
    return await spotifyApi.pause()
}

async function resumeCurrentPlaying() {
    return await spotifyApi.play()
}

async function skipToNext() {
    return await spotifyApi.skipToNext();
}

async function skipToPrevious() {
    return await spotifyApi.skipToPrevious();
}