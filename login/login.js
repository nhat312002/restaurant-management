const form = document.querySelector('#create-account-form');
const usernameInput = document.querySelector('#username');
const titleInput = document.querySelector('#title');

form.addEventListener('submit', (event)=>{
    
    validateForm();
    console.log(isFormValid());
    if(isFormValid()==true){
        form.submit();
     }else {
         event.preventDefault();
     }

});

function isFormValid(){
    const inputContainers = form.querySelectorAll('.input-group');
    let result = true;
    inputContainers.forEach((container)=>{
        if(container.classList.contains('error')){
            result = false;
        }
    });
    return result;
} 

function validateForm() {
    //USERNAME
    if(usernameInput.value.trim()==''){
        setError(usernameInput, 'Hãy điền đầy đủ thông tin');
    }else if(usernameInput.value.trim()=='nhanvien1' || usernameInput.value.trim()=='nhanvien1'){
        setSuccess(usernameInput);
    }else {
        setError(usernameInput, 'Tài khoản không tồn tại');
    }
    //TITLE
    if(titleInput.value.trim()==''){
        setError(titleInput, 'Hãy điền đầy đủ thông tin');
    }else if(titleInput.value.trim()=='nhanvien1' || titleInput.value.trim()=='nhanvien1') {
        setSuccess(titleInput);
    }else {
        setError(titleInput, 'Sai mật khẩu')    
    }

}

function setError(element, errorMessage) {
    const parent = element.parentElement;
    if(parent.classList.contains('success')){
        parent.classList.remove('success');
    }
    parent.classList.add('error');
    const paragraph = parent.querySelector('p');
    paragraph.textContent = errorMessage;
}

function setSuccess(element){
    const parent = element.parentElement;
    if(parent.classList.contains('error')){
        parent.classList.remove('error');
    }
    parent.classList.add('success');
}