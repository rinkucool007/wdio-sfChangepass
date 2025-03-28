import { expect } from 'chai';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// Constants
const URLS = {
  LOGIN: 'https://login.salesforce.com',
  LOGOUT: '/secur/logout.jsp'
};

// Data Handler
class DataHandler {
  static getUsernames(): string[] {
    try {
      const csvPath = path.resolve(__dirname, '../../data/passwords.csv');
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });
      return records.map((record: { Username: string }) => record.Username);
    } catch (error) {
      throw new Error(`Failed to read usernames from CSV: ${error.message}`);
    }
  }

  static getPassword(): string {
    try {
      const txtPath = path.resolve(__dirname, '../../data/password.txt');
      return fs.readFileSync(txtPath, 'utf-8').trim();
    } catch (error) {
      throw new Error(`Failed to read password from password.txt: ${error.message}`);
    }
  }

  static getNewPassword(): string {
    try {
      const txtPath = path.resolve(__dirname, '../../data/newPassword.txt');
      return fs.readFileSync(txtPath, 'utf-8').trim();
    } catch (error) {
      throw new Error(`Failed to read new password from newPassword.txt: ${error.message}`);
    }
  }
}

// Page Objects
class LoginPage {
  private get usernameInput() { return $('#username') }
  private get passwordInput() { return $('#password') }
  private get loginButton() { return $('#Login') }

  async login(username: string, password: string) {
    try {
      await this.usernameInput.setValue(username);
      await this.passwordInput.setValue(password);
      await this.loginButton.click();
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
}

class HomePage {
  private get userNavButton() { return $('.userNavButton') }
  private get logoutLink() { return $('=Logout') }

  async logout() {
    try {
      await this.userNavButton.click();
      await this.logoutLink.click();
    } catch (error) {
      throw new Error(`Logout failed: ${error.message}`);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await $('.userNavButton').isDisplayed();
    } catch (error) {
      throw new Error(`Failed to verify login status: ${error.message}`);
    }
  }
}

class ChangePasswordPage {
  private get currentPasswordInput() { return $('xpath:///*[@id="currentpassword"]') }
  private get newPasswordInput() { return $('xpath:///*[@id="newpassword"]') }
  private get confirmPasswordInput() { return $('xpath:///*[@id="confirmpassword"]') }
  private get securityAnswerInput() { return $('xpath:///*[@id="answer"]') }
  private get changePasswordButton() { return $('xpath:///*[@id="password-button"]') }

  async navigateToChangePassword() {
    try {
      await browser.url('/_ui/core/userprofile/ui/ChangePassword?retURL=/home');
    } catch (error) {
      throw new Error(`Failed to navigate to change password page: ${error.message}`);
    }
  }

  async changePassword(currentPassword: string, newPassword: string) {
    try {
      await this.currentPasswordInput.setValue(currentPassword);
      await this.newPasswordInput.setValue(newPassword);
      await this.confirmPasswordInput.setValue(newPassword);
      await this.securityAnswerInput.setValue('Juno Beach');
      await this.changePasswordButton.click();
    } catch (error) {
      throw new Error(`Password change failed: ${error.message}`);
    }
  }
}

// Test Suite
describe('Salesforce Login/Change Password/Logout Test', () => {
  const loginPage = new LoginPage();
  const homePage = new HomePage();
  const changePasswordPage = new ChangePasswordPage();
  let usernames: string[];
  let password: string;
  let newPassword: string;

  before(async () => {
    try {
      usernames = DataHandler.getUsernames();
      password = DataHandler.getPassword();
      newPassword = DataHandler.getNewPassword();
    } catch (error) {
      throw new Error(`Test setup failed: ${error.message}`);
    }
  });

  usernames.forEach((username) => {
    describe(`Testing with username: ${username}`, () => {
      beforeEach(async () => {
        try {
          await browser.url(URLS.LOGIN);
          await browser.pause(2000);
        } catch (error) {
          throw new Error(`Failed to navigate to login page: ${error.message}`);
        }
      });

      afterEach(async () => {
        try {
          await browser.deleteCookies();
          await browser.pause(2000);
        } catch (error) {
          console.warn(`Failed to clear cookies: ${error.message}`);
        }
      });

      it('should login, change password, and logout successfully', async () => {
        try {
          // Login
          await loginPage.login(username, password);
          await browser.pause(2000);
          
          // Verify login
          const isLoggedIn = await homePage.isLoggedIn();
          expect(isLoggedIn, `Login verification failed for ${username}`).to.be.true;

          // Change Password
          await changePasswordPage.navigateToChangePassword();
          await browser.pause(2000);
          await changePasswordPage.changePassword(password, newPassword);
          await browser.pause(2000);

          // Logout
          await homePage.logout();
          await browser.pause(2000);

          // Verify logout
          await browser.url(URLS.LOGIN);
          await browser.pause(2000);
          const isLoginPageDisplayed = await $('#username').isDisplayed();
          expect(isLoginPageDisplayed, `Logout verification failed for ${username}`).to.be.true;

          // Update password for next iteration
          password = newPassword;
        } catch (error) {
          throw new Error(`Test failed for ${username}: ${error.message}`);
        }
      });
    });
  });
});
