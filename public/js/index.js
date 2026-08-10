import '@babel/polyfill';
import { displayMap } from './map';
import { login, logout } from './login';
import { updateData } from './updateSettings';

// DOM elements
const mapEl = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');

// MAP
if (mapEl) {
  const locations = JSON.parse(mapEl.dataset.locations);
  displayMap(locations);
}

// LOGIN
if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout)

if (userDataForm) 
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateData(name, email);
  })