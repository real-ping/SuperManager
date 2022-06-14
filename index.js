
const { spawn } = require("child_process");
const { join } = require('path')
const { BrowserWindow, app, ipcMain, systemPreferences, shell, globalShortcut, Tray, nativeImage, Menu } = require('electron');
const nks = require('node-key-sender');
const process = require('process');
const os = require('os');
const fs = require('fs');
const osu = require('node-os-utils');
const spotifyControls = require("./spotifyControls");

app.whenReady().then(() => {

    let pageLockState = false;
    globalShortcut.register('Scrolllock', (() => {
        pageLockState = !pageLockState;
        win.webContents.send('pageLockStateUpdate', pageLockState)
    }))
    globalShortcut.register('Home', (() => {
        shell.openExternal('https://www.google.com')
    }))

    ipcMain.on('pageLockStateUpdate', (e, state) => {
        pageLockState = state;
    })

    const win = new BrowserWindow({
        alwaysOnTop: false,
        skipTaskbar: true,
        transparent: true,
        movable: false,
        resizable: false,
        frame: false,
        minimizable: false,
        width: 1920,
        height: 70,
        y: 40,
        x: 0,
        closable: false,
        webPreferences: {
            preload: join(__dirname, 'app/preload.js'),
        }
    });

    const popup = new BrowserWindow({
        skipTaskbar: true,
        alwaysOnTop: true,
        transparent: true,
        movable: true,
        resizable: false,
        minimizable: false,
        maximizable: false,
        center: true,
        width: 800,
        height: 600,
        webPreferences: {
            preload: join(__dirname, 'app/preload.js'),
        },
        show: false,
        frame: false,
    })
    // const youtubeWindow = new BrowserWindow({
    //     show: false,
    //     transparent: true,
    //     webPreferences: {
    //         preload: join(__dirname, 'app/preload.js'),
    //     },
    //     width: 680,
    //     height: 400,
    //     resizable: true,
    //     alwaysOnTop: true,
    //     x: 0,
    //     y: 120,
    //     frame: false,
    //     skipTaskbar: true,
    // });

    const themeMenuWin = new BrowserWindow({
        show: false,
        transparent: true,
        webPreferences: {
            preload: join(__dirname, 'app/preload.js'),
        },
        width: 690,
        height: 600,
        resizable: false,
        center: true,
        frame: false,
        movable: true,
        alwaysOnTop: true,
        skipTaskbar: true
    })

    themeMenuWin.loadURL(join(__dirname, '/popup/theme/index.html'))

    console.log('window started');

    win.loadFile(join(__dirname, "app/index.html"));

    const ipcFunctions = {
        "home": (() => {
            nks.sendCombination(['windows', 'm'])
        }),
        "popup": ((path) => {
            popup.show();
            popup.loadFile(join(__dirname, `popup/${path}/index.html`));
        }),
        "popupWindow-hide": (() => {
            popup.hide();
        }),
        "playYoutubeVideo": ((URL) => {
            youtubeWindow.loadURL(URL);
        }),
        "playYoutubePlaylist": (() => {
            const YT_playlist = require('./db/youtubePlaylist.json');
            delete require.cache[require.resolve('./db/youtubePlaylist.json')]
            youtubeWindow.loadFile(join(__dirname, `popup/youtube/index.html`));
            youtubeWindow.show()
            // YT_playlist.forEach(d => {
            //     youtubeWindow.loadURL(d.url);
            // })
        }),
        "getYoutubePlaylist": ((e) => {
            const YT_playlist = require('./db/youtubePlaylist.json');
            delete require.cache[require.resolve('./db/youtubePlaylist.json')];
            e.returnValue = YT_playlist;
        }),
        "youtubeWindow-hide": (() => {
            youtubeWindow.hide();
        }),
        "spotify-pause": (async () => {
            let is_playing = await spotifyControls.isCurrentlyPlaying()
            if (is_playing) await spotifyControls.pauseCurrentPlaying();
        }),
        "spotify-play": (async () => {
            let is_playing = await spotifyControls.isCurrentlyPlaying()
            if (!is_playing) await spotifyControls.resumeCurrentPlaying();
        }),
        "spotify-currentTrackData": (async (e) => {
            const data = await spotifyControls.getCurrentlyPlaying();
            e.returnValue = data
        }),
        "spotify-isCurrentlyPlaying": (async (e) => {
            const data = await spotifyControls.isCurrentlyPlaying();
            e.returnValue = data
        }),
        "spotify-skipToPrevious": (async () => {
            spotifyControls.skipToPrevious()
        }),
        "spotify-skipToNext": (async () => {
            spotifyControls.skipToNext()
        }),
        "spotify-sendHeartbeatTrackData": (async () => {
            setInterval(async () => {
                try {
                    const data = await spotifyControls.getCurrentlyPlaying();
                    win.webContents.send('spotify-trackDataUpdate', data)
                } catch (error) {
                    console.log(12312312312313, error);
                }
            }, 300);
        }),
        "spotify-sendTrackData": (async () => {
            const data = await spotifyControls.getCurrentlyPlaying();
            win.webContents.send('spotify-trackDataUpdate', data)
        }),
        "themeMenuWin-hide": (() => {
            themeMenuWindow(false)
        }),
        "getTheme": ((e) => {
            e.returnValue = require('./db/currentTheme.json');
            delete require.cache[require.resolve('./db/currentTheme.json')]
        }),
        "themeUpdate": ((themeData) => {
            fs.writeFileSync('./db/currentTheme.json', JSON.stringify(themeData));
            win.webContents.send('newTheme', themeData);
        }),
        "openSpotifyWindow": (() => {
            const path = `${os.homedir()}\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Spotify`
            shell.openPath(path)
        })
    }

    ipcMain.on('call', (e, func, ...args) => {
        console.log('IPC FUNC RECEIEVED:', func);
        args.push(e)
        ipcFunctions[func](...args)
    });

    let isRAMCPUPaused = false;
    setInterval(async () => {
        if(isRAMCPUPaused){
            win.webContents.send('cpuMeter', 0);
            win.webContents.send('ramMeter', 0);
            return;
        };
        osu.cpu.usage()
            .then(cpuPercentage => {
                win.webContents.send('cpuMeter', cpuPercentage);
            })

        osu.mem.info().then((d) => {
            win.webContents.send('ramMeter', d.usedMemPercentage);
        })
    }, 200);
    let isSpeedtestPaused = false;
    startSpeedTest()

    function restartSpeedTest() {
        startSpeedTest()
    }

    function startSpeedTest() {

        const exe = spawn('speed-test', {
            cwd: process.cwd(),
            shell: true
        })

        exe.stdout.on('data', (d) => {
            if (isSpeedtestPaused) {
                exe.kill();
                win.webContents.send('downloadMeter', 0);
                win.webContents.send('uploadMeter', 0);
                return;
            }
            let rawData = d.toString('utf8');
            rawData = rawData.split('\n');
            rawData.splice(0, 1);
            rawData.splice(rawData.length - 1, 1);
            rawData = rawData.map(x => x.trim());
            if (rawData.length == 0) return;
            let ping = rawData[0] != "Ping" ? isNaN(parseFloat(rawData[0].slice(7).replace('  ms', ''))) ? 0 : parseFloat(rawData[0].slice(7).replace('  ms', '')) : null;
            let download = rawData[1] != "Download" ? parseFloat(rawData[1].slice(11).replace(' Mbps', '')) : null;
            let upload = rawData[2] != "Upload" ? parseFloat(rawData[2].slice(9).replace(' Mbps', '')) : null;
            if (download != null) win.webContents.send('downloadMeter', download);
            if (upload != null) win.webContents.send('uploadMeter', upload);
            if (ping != null) win.webContents.send('ping', ping);
        });

        exe.stdout.on('end', () => {
            const intid = setInterval(() => {
                if (isSpeedtestPaused) return;
                clearInterval(intid);
                restartSpeedTest()
            }, 5000);
        })
    }

    const icon = nativeImage.createFromPath(join(__dirname, 'icon.ico'))
    let tray = new Tray(icon)
    process.tray = tray;

    tray.setTitle('Super Maager');

    const contextMenu = Menu.buildFromTemplate([
        { label: `Super manager`, enabled: false },
        { label: 'separator', type: 'separator' },
        { label: 'Open theme menu', type: 'normal', click: themeMenuWindow },
        { label: 'Toggle speed-test', type: 'checkbox', click: toggleSpeedTest },
        { label: 'Toggle ram and cpu tests', type: 'checkbox', click: toggleRAMCPU },
        { label: 'separator', type: 'separator' },
        { label: 'Quit', type: 'normal', click: quitProcess },
    ])
    tray.setContextMenu(contextMenu);
    tray.on('click', () => {
        win.focus()
    });
    let themeMenuWindowVisibility = false;
    function themeMenuWindow(force) {
        themeMenuWindowVisibility = typeof force == "boolean" ? force : !themeMenuWindowVisibility;
        themeMenuWindowVisibility ? themeMenuWin.show() : themeMenuWin.hide();
    }
    function toggleSpeedTest() {
        isSpeedtestPaused = !isSpeedtestPaused;
        console.log('speed test is now:', isSpeedtestPaused ? "paused" : "unpaused");
    }
    function toggleRAMCPU() {
        isRAMCPUPaused = !isRAMCPUPaused;
        console.log('Ram and CPU tests are now:', isRAMCPUPaused ? "paused" : "unpaused");
    }
    function quitProcess() {
        app.exit()  
        app.quit()
    }
});

