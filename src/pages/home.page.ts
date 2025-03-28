class HomePage {
    private get userNavButton() { return $('.userNavButton') }
    private get logoutLink() { return $('=Logout') }
  
    async logout() {
      await this.userNavButton.click();
      await this.logoutLink.click();
    }
  
    async isLoggedIn(): Promise<boolean> {
      return await $('.userNavButton').isDisplayed();
    }
  }
  
  export default new HomePage();