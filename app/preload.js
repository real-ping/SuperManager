
const {
    contextBridge,
    ipcRenderer,
    desktopCapturer
} = require('electron')

console.log(`Preload.js has loaded.`);

contextBridge.exposeInMainWorld('api', {
    emit: ipcRenderer.send,
    on: function(channel, cb) {
        ipcRenderer.on(channel, (...data) => {
            cb(...data)
        })
    },
    once: function(channel, cb) {
        ipcRenderer.once(channel, (...data) => {
            try {
                if (data) cb(...data)
                else cb()
            } catch (error) {
                console.log(error);
            }

        })
    },
    getScreens: function(otherConstrants) {
        return new Promise((resolve, reject) => {
            let screens = [];
            let constrants = { types: ['screen'] }
            constrants = Object.assign(constrants, otherConstrants)
            desktopCapturer.getSources(constrants).then(sources => {
                sources.forEach(source => {
                    screens.push({
                        name: source.name,
                        id: source.id,
                        url: source.thumbnail.toDataURL()
                    })
                })

            }).finally(() => {
                resolve(screens)
            }).catch(error => reject(err));
        })
    },
    getWindows: function(otherConstrants) {
        return new Promise((resolve, reject) => {
            let windows = [];
            let constrants = { types: ['window'] }
            constrants = Object.assign(constrants, otherConstrants)
            desktopCapturer.getSources(constrants).then(sources => {
                sources.forEach(source => {
                    windows.push({
                        name: source.name,
                        id: source.id,
                        url: source.thumbnail.toDataURL()
                    })
                })

            }).finally(() => {
                resolve(windows)
            }).catch(error => reject(err));
        })
    },
    sendSync: function(channel, ...data){
        return ipcRenderer.sendSync(channel, ...data)
    }
});