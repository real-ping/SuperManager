
home.onclick = (() => {
    console.log('home clicked');
    window.api.emit("call", "home")
})

let pgMax = container.children.length, pgMin = 1, page = pgMin;
let pageFlickInterval = 15000; // ms
timer_middle_num.innerText = page;
container.firstElementChild.classList.remove('page-hidden');

let pageLocked = false;

window.api.on('pageLockStateUpdate', (e, state) => {
    timer_middle_lockIcon.classList.toggle("hidden", pageLocked)
    pageLocked = state
})

setInterval(() => {
    if (pageLocked) return;
    let lastPageNum = page;
    page == pgMax ? page = pgMin : page++;
    updatePage(lastPageNum)
}, pageFlickInterval);

timer_top.onclick = (() => {
    if (page == pgMax) return
    page++
    updatePage(page - 1)
})

timer_middle.onclick = (() => {
    timer_middle_lockIcon.classList.toggle("hidden", pageLocked)
    pageLocked = !pageLocked;
    window.api.emit('pageLockStateUpdate', pageLocked)
})

timer_bottom.onclick = (() => {
    if (page == pgMin) return
    page--;
    updatePage(page + 1)
})

function updatePage(lastPageNum) {
    timer_middle_num.innerText = page;
    const pageEl = container.children.item(page - 1);
    const lastPageEl = container.children.item(lastPageNum - 1);
    lastPageEl.classList.add('page-hidden')
    pageEl.classList.remove('page-hidden')
}

musicOptionsButtonWrapper.onclick = (() => {
    window.api.emit('call', 'openSpotifyWindow')
})

musicPlayPause.onclick = (() => {
    window.api.emit('call', 'playYoutubePlaylist')
})

var ramMeter = new ProgressBar.SemiCircle('#ramMeter', {
    color: 'var(--text-dark-color)',
    strokeWidth: 2.1,
    trailColor: 'var(--line-dark-color)',
    trailWidth: 0.8,
    easing: 'easeOut',
});

let ramData = 0.1

ramMeter.setText(`${(ramData * 100)}% RAM`)
ramMeter.animate(ramData);

window.api.on('ramMeter', (e, d) => {
    ramData = d / 100;
    ramMeter.setText(`${(ramData * 100).toFixed(0)}% RAM`);
    ramMeter.animate(ramData);
})

var cpuMeter = new ProgressBar.SemiCircle('#cpuMeter', {
    color: 'var(--text-dark-color)',
    strokeWidth: 2.1,
    trailColor: 'var(--line-dark-color)',
    trailWidth: 0.8,
    easing: 'easeOut',
});

let cpuData = 0.1

cpuMeter.setText(`${(cpuData * 100)}% CPU`)
cpuMeter.animate(cpuData);

window.api.on('cpuMeter', (e, d) => {
    cpuData = d / 100;
    cpuMeter.setText(`${(cpuData * 100).toFixed(0)}% CPU`);
    cpuMeter.animate(cpuData);
})

var uploadMeter = new ProgressBar.SemiCircle('#uploadMeter', {
    color: 'var(--text-dark-color)',
    strokeWidth: 2.1,
    trailColor: 'var(--line-dark-color)',
    trailWidth: 0.8,
    easing: 'easeOut',
});

let uploadData = 0

uploadMeter.setText(`${uploadData}mb 🡅`)
uploadMeter.animate(uploadData);

window.api.on('uploadMeter', (e, d) => {
    uploadData = d / 100
    uploadMeter.setText(`${d}mb 🡅`)
    uploadMeter.animate(uploadData);
})

var downloadMeter = new ProgressBar.SemiCircle('#downloadMeter', {
    color: 'var(--text-dark-color)',
    strokeWidth: 2.1,
    trailColor: 'var(--line-dark-color)',
    trailWidth: 0.8,
    easing: 'easeOut',
});

let downloadData = 0

downloadMeter.setText(`${downloadData}mb 🡇`)
downloadMeter.animate(downloadData);

window.api.on('downloadMeter', (e, d) => {
    downloadData = d / 100
    downloadMeter.setText(`${d}mb 🡇`)
    downloadMeter.animate(downloadData);
})

const stopwatchCircle = new ProgressBar.SemiCircle("#stopwatchCircle", {
    color: 'var(--text-dark-color)',
    strokeWidth: 2.1,
    trailColor: 'var(--line-dark-color)',
    trailWidth: 0.8,
    easing: 'easeOut',
})


let timer = {
    ms: 0,
    s: 0,
    m: 0,
    h: 0,
}

function msToString(ms) {
    return ms.toString().length == 1 ? `00${ms}` : ms.toString().length == 2 ? `0${ms}` : ms;
}


function sToString(s) {
    return s.toString().length == 1 ? `0${s}` : s;
}

function mToString(m) {
    return m.toString().length == 1 ? `0${m}` : m;
}
function hToString(h) {
    return h.toString().length == 1 ? `0${h}` : h;
}

stopwatchCircle.setText(`Stop-watch\n${hToString(timer.h)}:${mToString(timer.m)}:${sToString(timer.s)}.${msToString(timer.ms)}`);
let runningStopwatchId = null;
let stopwatchIsRunning = false;
let stopwatchIsPaused = false;
stopwatchTab.oncontextmenu = (() => {
    timer = {
        ms: 0,
        s: 0,
        m: 0,
        h: 0,
    }
    clearInterval(runningStopwatchId);
    stopwatchCircle.animate(0)
    stopwatchCircle.setText(`Stop-watch\n${hToString(timer.h)}:${mToString(timer.m)}:${sToString(timer.s)}.${msToString(timer.ms)}`);
    stopwatchIsRunning = false;
    stopwatchIsPaused = false;
})

stopwatchTab.onclick = (() => {
    if (stopwatchIsRunning) {
        stopwatchIsPaused = !stopwatchIsPaused;
    } else {
        stopwatchIsRunning = true;
        runningStopwatchId = setInterval(() => {
            if (stopwatchIsPaused) return;
            timer.ms++;

            if (timer.ms == 200) {
                timer.ms = 0;
                timer.s++;
                stopwatchCircle.animate((timer.s))
            }
            if (timer.s == 60) {
                timer.s = 0;
                timer.m++
            }
            if (timer.m == 60) {
                timer.m = 0;
                timer.h++
            }
            if (timer.h == 60) clearInterval(runningStopwatchId);
            stopwatchCircle.setText(`Stop-watch\n${hToString(timer.h)}:${mToString(timer.m)}:${sToString(timer.s)}.${msToString(timer.ms)}`);
        }, 1);
    }

});

// let timer = {
//     m: 5,
//     s: 0
// }

const timerCirlce = new ProgressBar.SemiCircle("#timerCircle", {
    color: 'var(--text-dark-color)',
    strokeWidth: 2.1,
    trailColor: 'var(--line-dark-color)',
    trailWidth: 0.8,
    easing: 'easeOut',
    text: {
        value: "Timer\n05:00.000"
    }
})
let ranSpotifyControlsOnce = false;
window.api.on('ping', ((e, ping) => {
    if (ranSpotifyControlsOnce) return;
    ranSpotifyControlsOnce = true;
    console.log(ping < 2000 ? "Running spotify controls in 1 second" : "Not running spotify controls")
    if (ping < 2000) {
        setTimeout(() => {
            runSpotfyControls(true)
        }, 1000);
    }
}))

function runSpotfyControls(run) {
    if (!run) return;
    // window.api.emit('call', 'spotify-sendHeartbeatTrackData')
    setTimeout(() => {

        window.api.emit('call', 'spotify-sendTrackData')
        console.log('requested');
    }, 5000);

    window.api.on('spotify-trackDataUpdate', (e, currentPlayingTrack) => {
        console.log(currentPlayingTrack);
        scrollText.innerText = currentPlayingTrack.item.name;
        const progressPercentage = currentPlayingTrack.progress_ms / currentPlayingTrack.item.duration_ms;
        const progressInWidth = musicTimeline.offsetWidth * progressPercentage;
        musicTimelineDot.style.width = `${progressInWidth}px`;
        musicTimer.innerText = `${millisToMinutesAndSeconds(currentPlayingTrack.progress_ms)} of ${millisToMinutesAndSeconds(currentPlayingTrack.item.duration_ms)}`
    })


    const isCurrentlyPlaying = window.api.sendSync('call', 'spotify-isCurrentlyPlaying');
    if (isCurrentlyPlaying) {
        // pause ICON
        musicPlayPauseIcon_play.style.display = "none";
        musicPlayPauseIcon_pause.style.display = "";
    } else {
        // play ICON
        musicPlayPauseIcon_play.style.display = "";
        musicPlayPauseIcon_pause.style.display = "none";
    }



    musicPlayPause.onclick = (() => {
        if (window.api.sendSync('call', 'spotify-isCurrentlyPlaying')) {
            window.api.emit('call', 'spotify-pause')
            musicPlayPauseIcon_play.style.display = "";
            musicPlayPauseIcon_pause.style.display = "none";
        } else {
            window.api.emit('call', 'spotify-play')
            musicPlayPauseIcon_play.style.display = "none";
            musicPlayPauseIcon_pause.style.display = "";
        }
    })

    function millisToMinutesAndSeconds(millis) {
        var minutes = Math.floor(millis / 60000);
        var seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }
    musicControlLeft.onclick = (() => {
        window.api.emit('call', 'spotify-skipToPrevious')
    })
    musicControlRight.onclick = (() => {
        window.api.emit('call', 'spotify-skipToNext')
    })
}

const theme = window.api.sendSync('call', 'getTheme');
for (const [key, value] of Object.entries(theme.colors)) {
    document.body.style.setProperty(`--${key}`, value)
}

window.api.on('newTheme', (e, themeData) => {
    console.log(themeData);
    for (const [key, value] of Object.entries(themeData.colors)) {
        document.body.style.setProperty(`--${key}`, value)
    }
})