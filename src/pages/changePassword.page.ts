class ChangePasswordPage {
    private get currentPasswordInput() { return $('xpath:///*[@id="currentpassword"]') }
    private get newPasswordInput() { return $('xpath:///*[@id="newpassword"]') }
    private get confirmPasswordInput() { return $('xpath:///*[@id="confirmpassword"]') }
    private get securityAnswerInput() { return $('xpath:///*[@id="answer"]') }
    private get changePasswordButton() { return $('xpath:///*[@id="password-button"]') }
  
    async changePassword(currentPassword: string, newPassword: string) {
      await this.currentPasswordInput.setValue(currentPassword);
      await this.newPasswordInput.setValue(newPassword);
      await this.confirmPasswordInput.setValue(newPassword);
      await this.securityAnswerInput.setValue('Juno Beach');
      await this.changePasswordButton.click();
    }
  
    async navigateToChangePassword() {
      await browser.url('/_ui/core/userprofile/ui/ChangePassword?retURL=/home');
    }
  }
  
  export default new ChangePasswordPage();