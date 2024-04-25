const app = {
   serverApi: 'http://127.0.0.1:8000/api/v1',
   loginForm: `
   <div class="w-50 mx-auto">
      <h1 class="text-center">ĐĂNG NHẬP</h1>
      <form class="login-form">
         <div class="form-group">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" class="form-control" placeholder="Email..." required>
         </div>
         <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input type="password" name="password" id="password" class="form-control" placeholder="Mật khẩu..." required>
         </div>
         <button class="btn btn-primary btn-block">Đăng nhập</button>
      </form>
   </div>`,
   accountForm: `
   <div class="w-50 mx-auto">
      <h1 class="text-center">TÀI KHOẢN</h1>
      <form class="account-form">
         <div class="form-group">
            <label for="fullname">Họ và tên</label>
            <input type="text" name="fullname" id="fullname" class="form-control" placeholder="Họ và tên...">
         </div>
         <div class="form-group">
            <label for="email">Email</label>
            <input type="email" name="email" id="email" class="form-control" placeholder="Email...">
         </div>
         <div class="form-group">
            <label for="inputGroupAvatar">Ảnh đại diện</label>
            <div class="custom-file mb-2">
               <label class="custom-file-label" for="inputGroupAvatar">Choose file</label>
               <input type="file" name="avatar" class="custom-file-input mb-2" id="inputGroupAvatar"  placeholder="Ảnh đại diện...">
            </div>
            <div id="avatar"></div>
         </div>
         <button class="btn btn-primary btn-block">Lưu thay đổi</button>
      </form>
   </div>`,
   notify: (msg, msgType="success") => {
      Swal.fire({
         title: "Thông báo!!",
         text: msg,
         icon: msgType
      })
   },
   render: function(html) {
      root.innerHTML = html;
   },
   addEvent: function() {
      root.addEventListener('submit', (e) => {
         e.preventDefault();
         if(e.target.classList.contains('login-form')) {
            this.handleLogin(e.target);
         }
         if(e.target.classList.contains('account-form')) {
            this.handleUpdateAccount(e.target);
         }
      })
   },
   handleLogin: async function(form) {
      const data = Object.fromEntries([...new FormData(form)])
      await fetch(`${this.serverApi}/auth/login`, {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(data)
      })
      .then(res=>res.json())
      .then((validate) => {
         if(validate.status == 200) {
            localStorage.setItem('tokens', JSON.stringify(validate.data));
            this.start();
         } else {
            this.notify(validate.message, 'warning')
         }
      })
   },
   handleUpdateAccount: async function(form) {
      if(localStorage.getItem('tokens')) {
         const {access_token: accessToken} = JSON.parse(localStorage.getItem('tokens'));
         const data = new FormData(form);
         await fetch(`${this.serverApi}/auth/profile`, {
            method: 'POST',
            headers: {
               Authorization: 'Bearer ' + accessToken
            },
            body: data
         })
         .then(res => res.json())
         .then(result => {
            if(result.status == 200) {
               this.notify("Lưu thông tin thành công");
               this.start();
            } else {
               this.notify("Thay đổi thông tin thất bại. Vui lòng kiểm tra lại", "warning")
            }
         })
      }
      
   },
   getProfile: async function() {
      if(localStorage.getItem('tokens')) {
         const {access_token: accessToken} = JSON.parse(localStorage.getItem('tokens'));
         await fetch(`${this.serverApi}/auth/profile`, {
            method: 'GET',
            headers: {
               Authorization: 'Bearer ' + accessToken
            }
         })
         .then(res => res.json())
         .then((response) => {
            if(response.status != 200) {
               localStorage.removeItem('tokens');
               this.start();
            } else {
               const {fullname, email, avatar} = response.data;

               const fullnameEl = root.querySelector(".account-form #fullname");
               const emailEl = root.querySelector(".account-form #email");
               const avatarEl = root.querySelector(".account-form #avatar");

               fullnameEl.value = fullname;
               emailEl.value = email;
               avatarEl.innerHTML = avatar ? `<img width=200 src="${avatar}"/>` : `<img width=200 src="https://vineview.com/wp-content/uploads/2017/07/avatar-no-photo-300x300.png"/>`;
            }
         })
      }
   },
   start: function() {
      const isLogin = localStorage.getItem('tokens') ? true : false;
      if(!isLogin) {
         html = this.loginForm
      } else {
         html = this.accountForm
      }
      this.render(html);
      this.addEvent();
      this.getProfile();
   }
}
const root = document.querySelector('#root');
app.start()