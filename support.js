
/////// Add script support ///////

const buttons = document.getElementsByClassName('button');

// Button mouse enter
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('mouseenter', event => {
    buttons[i].style.backgroundColor = (app.theme === 'light') ? '#eee' : '#3e3e3e';
    buttons[i].style.borderColor = (app.theme === 'light') ? '#d0d0d0' : '#5e5e5e';
  });
}

// Button mouse leave
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('mouseleave', event => {
    buttons[i].style.backgroundColor = (app.theme === 'light') ? '#fff' : '#2e2e2e';
    buttons[i].style.borderColor = (app.theme === 'light') ? '#e0e0e0' : '#4e4e4e';
  });
}

// Button mouse down
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('mousedown', event => {
    buttons[i].style.backgroundColor = (app.theme === 'light') ? '#ddd' : '#4e4e4e';
    buttons[i].style.borderColor = (app.theme === 'light') ? '#c0c0c0' : '#6e6e6e';
  });
}

// Button mouse up
for (let i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('mouseup', event => {
    buttons[i].style.backgroundColor = (app.theme === 'light') ? '#eee' : '#3e3e3e';
    buttons[i].style.borderColor = (app.theme === 'light') ? '#d0d0d0' : '#5e5e5e';
  });
}