// const theme = window.api.sendSync('call', 'getTheme');
// for(const [key, value] of Object.entries(theme.colors)){
//     document.body.style.setProperty(`--${key}`, value)
// }

const themeWrappers = document.getElementsByClassName('themeWrapper');
for(var i = 0; i < themeWrappers.length; i++) {
    const themeWrapper = themeWrappers.item(i);
    themeWrapper.onclick = (() => {
        const data = {
            colors: {
                "line-color": themeWrapperVar('--theme-line-color'),
                "line-dark-color": themeWrapperVar('--theme-line-dark-color'),
                "bg-color": themeWrapperVar('--theme-bg-color'),
                "hover-color": themeWrapperVar('--theme-hover-color'),
                "text-color": themeWrapperVar('--theme-text-color'),
                "text-dark-color": themeWrapperVar('--theme-text-dark-color'),
            }
        }
        window.api.emit('call', 'themeUpdate', data)
        window.api.emit('call', 'themeMenuWin-hide')

        function themeWrapperVar(varname){
            return getComputedStyle(themeWrapper).getPropertyValue(varname)
        }
    })
}
