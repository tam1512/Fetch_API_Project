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
         <button type="submit" class="btn btn-primary btn-block btn-login">Đăng nhập</button>
      </form>
   </div>`,
   accountForm: `
   <div class="w-50 mx-auto">
      <h1 class="text-center">TÀI KHOẢN</h1>
      <p>Xin chào: <b id="fullname-profile"></b> | <a href="#" class="logout">Đăng xuất</a></p>
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
         <button type="submit" class="btn btn-primary btn-block">Lưu thay đổi</button>
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
      root.addEventListener('click', (e) => {
         if (!e.target.tagName.toLowerCase() === 'a') {
            e.preventDefault();
         }
         if(e.target.classList.contains('logout')) {
            this.handleLogout();
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
            this.start(true);
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
               this.start(true);
            } else {
               this.notify("Thay đổi thông tin thất bại. Vui lòng kiểm tra lại", "warning")
            }
         })
      }
      
   },
   handleLogout: async function () {
      if(localStorage.getItem('tokens')) {
         const {access_token: accessToken} = JSON.parse(localStorage.getItem('tokens'));
         await fetch(`${this.serverApi}/auth/logout`, {
            method: 'GET',
            headers: {
               Authorization: 'Bearer ' + accessToken
            }
         })
         .then(res => res.json())
         .then((response) => {
            if(response.status == 200) {
               localStorage.removeItem('tokens');
               this.start(true);
            } else {
               this.notify('Đã có lỗi xảy ra vui lòng thử lại sau', 'warning');
            }
         })
      }
   },
   getProfile: async function() {
      if(localStorage.getItem('tokens')) {
         const {access_token: accessToken} = JSON.parse(localStorage.getItem('tokens'));
         const response = await fetch(`${this.serverApi}/auth/profile`, {
            method: 'GET',
            headers: {
               Authorization: 'Bearer ' + accessToken
            }
         })
         // .then(res => res.json())
         // .then((response) => {
         //    if(response.status != 200) {
         //       let newToken = this.getNewAccessToken();
         //       if(newToken) {
         //          localStorage.setItem('tokens', newToken);
         //          this.getProfile();
         //       } else {
         //          localStorage.removeItem('tokens');
         //          this.start(false);
         //       }
         //    } else {
         //       const {fullname, email, avatar} = response.data;

         //       const fullnameProfileEl = root.querySelector("#fullname-profile");
         //       const fullnameEl = root.querySelector(".account-form #fullname");
         //       const emailEl = root.querySelector(".account-form #email");
         //       const avatarEl = root.querySelector(".account-form #avatar");

         //       fullnameProfileEl.textContent = fullname;
         //       fullnameEl.value = fullname;
         //       emailEl.value = email;
         //       avatarEl.innerHTML = avatar ? `<img alt="" width=200 src="${avatar}"/>` : `<img alt="" width=200 src="https://vineview.com/wp-content/uploads/2017/07/avatar-no-photo-300x300.png"/>`;
         //    }
         // })

         let data = await response.json();
         if(response.ok) {
            const {fullname, email, avatar} = data.data;

            const fullnameProfileEl = root.querySelector("#fullname-profile");
            const fullnameEl = root.querySelector(".account-form #fullname");
            const emailEl = root.querySelector(".account-form #email");
            const avatarEl = root.querySelector(".account-form #avatar");

            fullnameProfileEl.textContent = fullname;
            fullnameEl.value = fullname;
            emailEl.value = email;
            avatarEl.innerHTML = avatar ? `<img alt="" width=200 src="${avatar}"/>` : `<img alt="" width=200 src="https://vineview.com/wp-content/uploads/2017/07/avatar-no-photo-300x300.png"/>`;
         } else {
            const newToken = await this.getNewAccessToken();
            if(newToken) {
               localStorage.setItem('tokens', JSON.stringify(newToken));
               this.getProfile();
            } else {
               localStorage.removeItem('tokens');
               this.start(false);
            }
         }
      }
   },
   getNewAccessToken: async function () {
      if(localStorage.getItem('tokens')) {
         const {refresh_token: refreshToken} = JSON.parse(localStorage.getItem('tokens'));
         const response = await fetch(`${this.serverApi}/auth/refresh-token`, {
            method: 'POST',
            headers: {
               "Content-type" : "application/json"
            },
            body: JSON.stringify({refresh_token : refreshToken})
         })
         let data = await response.json();
         if(response.ok) {
            return data.data;
         } else {
            return false;
         }
      }
   },
   start: function(old=false) {
      const isLogin = localStorage.getItem('tokens') ? true : false;
      if(!isLogin) {
         html = this.loginForm
      } else {
         html = this.accountForm
      }
      this.render(html);
      if(!old) {
         this.addEvent();
      }
      this.getProfile();
   }
}
const root = document.querySelector('#root');
app.start()