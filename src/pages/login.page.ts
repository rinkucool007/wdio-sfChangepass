class LoginPage {
    private get usernameInput() { return $('#username') }
    private get passwordInput() { return $('#password') }
    private get loginButton() { return $('#Login') }
  
    async login(username: string, password: string) {
      await this.usernameInput.setValue(username);
      await this.passwordInput.setValue(password);
      await this.loginButton.click();
    }
  }
  
  export default new LoginPage();