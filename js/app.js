// project-folder/js/app.js
// lightweight interactions for landing (hover smoothness, future proof)
document.addEventListener('DOMContentLoaded', () => {
    // subtle animation for product window (just for demonstration)
    const win = document.querySelector('.product-window');
    if(win) {
        win.addEventListener('mouseenter', () => {
            win.style.transition = 'transform 0.3s ease';
            win.style.transform = 'scale(1.01)';
        });
        win.addEventListener('mouseleave', () => {
            win.style.transform = 'scale(1)';
        });
    }
    // any future interactivity can be placed here
});