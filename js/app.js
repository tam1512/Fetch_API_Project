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
            <label for="avatar">Ảnh đại diện</label>
            <input type="file" name="avatar" id="avatar" class="form-control" placeholder="Ảnh đại diện...">
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
      })
   },
   handleLogin: async function(form) {
      const data = Object.fromEntries([...new FormData(form)])
      const response = await fetch(`${this.serverApi}/auth/login`, {
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
   start: function() {
      const isLogin = localStorage.getItem('tokens') ? true : false;
      if(!isLogin) {
         html = this.loginForm
      } else {
         html = this.accountForm
      }
      this.render(html);
      this.addEvent();
   }
}
const root = document.querySelector('#root');
app.start()