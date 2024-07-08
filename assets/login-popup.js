//============= To show popup ==============
function toggleBtn(event) {

    event?.preventDefault();
    document.querySelector('.popup__container').classList.toggle('popup_close');
    document.body.classList.toggle("overflow-hidden");
    const registerErrorMsg = document.querySelector('.register_popup-error__message');
    if (registerErrorMsg) document.querySelector('.register_popup-error__message').style.display = "none";

    if (!document.querySelector('.popup__container').classList.contains('popup_close')) {
        toggleContent(false, false)
        history.pushState('', document.title, `${window.location.pathname}#login`);
        const hulkapp = document.querySelector('#wizard-validation-form .after_form_submit');
        if (hulkapp) hulkapp.innerHTML = '';
        const wholesaleForm = document.getElementById('wholesale-form');
        if (wholesaleForm) {
            wholesaleForm.style.display = 'none';
            Array.from(wholesaleForm.querySelectorAll('input, textarea')).forEach((element) => {
                element.value = '';
            });
            const alertMessageElement = wholesaleForm?.querySelector('.alert_message');

            if (alertMessageElement) {
                alertMessageElement.textContent = '';
            }
        }
        const errorMessageContainer = document.querySelector('.popup-error__message');
        if (errorMessageContainer) errorMessageContainer.style.display = 'none';
        const registerForm = document.querySelector('#register-form')
        registerForm.querySelectorAll('input').forEach((each) => each.value = '')
        event.target.querySelector('form')?.querySelector('.register_popup-error__message')?.classList.add('hidden');
    } else {
        document.querySelector('body').classList.remove("overflow-hidden");
    }



    history.pushState('', document.title, window.location.pathname);
}

document.addEventListener('DOMContentLoaded', function () {

    document.querySelectorAll('body:not(.register) #register-form').forEach((each) => {
        each.querySelector('a[href="/account/login"]').addEventListener(('click'), (e) => {
            e.preventDefault();
            document.querySelector('.price__conatiner .product-info__prices + .svg__hover')
            document.querySelector('#register-form').classList.add('js-hidden');
            document.querySelector('#login-form').classList.remove('js-hidden');
            document.body.classList.add("overflow-hidden");

        })
    })

    if (window.location.hash === '#register' || '#recover') {

        history.replaceState('', document.title, window.location.pathname);
    }

    if (window.location.hash === '#recover') {
        toggleContent(true, false);
    } else if (window.location.hash === '#register') {
        toggleContent(false, true);
    } else if (window.location.hash === '#login') {
        toggleContent(false, false);
    }
});

//=============== Toggling loginForm, registerForm and recoverForm =================
const loginForm = document.getElementById('login-form');
const recoverForm = document.getElementById('recover-form');
const registerForm = document.getElementById('register-form');
let formEl;
function toggleContent(recover, register) {

    loginForm.classList.toggle('js-hidden', recover || register);
    recoverForm.classList.toggle('js-hidden', !recover);
    registerForm.classList.toggle('js-hidden', !register);
}

document.querySelector('.js-recover').addEventListener('click', (evt) => {
    evt.preventDefault();
    toggleContent(true, false);
    history.pushState('', document.title, `${window.location.pathname}#recover`);
});

document.querySelector('.js-register').addEventListener('click', (evt) => {
    evt.preventDefault();
    toggleContent(false, true);

    history.pushState('', document.title, `${window.location.pathname}/#register`);
});

document.querySelector('.js-login').addEventListener('click', (evt) => {
    evt.preventDefault();
    toggleContent(false, false);
    history.pushState('', document.title, `${window.location.pathname}#login`);
});

document.querySelector('.svg__hover')?.addEventListener('click', (evt) => {
    evt.preventDefault();
    toggleContent(false, false);
});



// onchange of input for email and number it will validate these input
// incase failed to validate it will disable the form add error msg
const isEmailValid = {};
const isNumberValid = {};

document.querySelectorAll('form[action="/account"]').forEach((form) => {
    const submitButton = form.querySelector('button.customer__registration');
    const errorMsg = form.querySelector('.custom_error.register_popup-error__message');
    form.querySelectorAll('input[required], select[required]').forEach((input) => {
        input.addEventListener('input', () => {
            if (input.type === 'email') {
                // Validate email format
                const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                const error = errorMsg.querySelector('.error_email');
                if (!isValidEmail) {
                    submitButton.setAttribute('disabled', '');
                    error.classList.remove('hidden');
                    isEmailValid[input.name] = false;
                } else {
                    isEmailValid[input.name] = true;
                    error.classList.add('hidden');
                }
            } else if (input.type === 'number' && input.getAttribute('pattern')) {
                const pattern = /^\d{8}$/;
                const error = errorMsg.querySelector('.error_number');
                if (!pattern.test(input.value)) {
                    submitButton.setAttribute('disabled', '');
                    error.classList.remove('hidden');
                    isNumberValid[input.name] = false;
                } else {
                    isNumberValid[input.name] = true;
                    error.classList.add('hidden');
                }
            }

            // Check if all inputs are valid before enabling the button
            if (Object.values(isEmailValid).every(val => val) && Object.values(isNumberValid).every(val => val)) {
                submitButton.removeAttribute('disabled');
            } else {
                submitButton.setAttribute('disabled', '');
            }
        });
    });
});


document.addEventListener('DOMContentLoaded', function () {

    document.querySelector('#guest .drawer__footer.quick-add__footer').addEventListener('click', (evt) => {
        evt.preventDefault();
        document.querySelector('.quick-add__content .drawer__close-btn').click();
        toggleBtn(evt);
    });


})



