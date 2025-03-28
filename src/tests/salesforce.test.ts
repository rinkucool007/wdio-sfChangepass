import { expect } from 'chai';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

// Constants
const URLS = {
  LOGIN: 'https://login.salesforce.com',
  LOGOUT: '/secur/logout.jsp',
  CHANGE_PASSWORD: '/_ui/core/userprofile/ui/ChangePassword?retURL=/home',
  LANDING_PAGE: '/home'
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
class SalesforcePage {
  // Login Page Elements
  private get usernameInput() { return $('#username') }
  private get passwordInput() { return $('#password') }
  private get loginButton() { return $('#Login') }

  // Change Password Page Elements
  private get currentPasswordInput() { return $('xpath:///*[@id="currentpassword"]') }
  private get newPasswordInput() { return $('xpath:///*[@id="newpassword"]') }
  private get confirmPasswordInput() { return $('xpath:///*[@id="confirmpassword"]') }
  private get securityAnswerInput() { return $('xpath:///*[@id="answer"]') }
  private get changePasswordButton() { return $('xpath:///*[@id="password-button"]') }

  // Home Page Elements
  private get userNavButton() { return $('.userNavButton') }
  private get logoutLink() { return $('=Logout') }

  // Step 1: Login
  async login(username: string, password: string) {
    try {
      await this.usernameInput.setValue(username);
      await this.passwordInput.setValue(password);
      await this.loginButton.click();
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 1 - Login failed: ${error.message}`);
    }
  }

  // Step 2: Navigate to Change Password
  async goToChangePasswordScreen() {
    try {
      await browser.url(URLS.CHANGE_PASSWORD);
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 2 - Navigation to change password failed: ${error.message}`);
    }
  }

  // Step 3: Enter Password Details
  async enterPasswordDetails(currentPassword: string, newPassword: string) {
    try {
      await this.currentPasswordInput.setValue(currentPassword);
      await this.newPasswordInput.setValue(newPassword);
      await this.confirmPasswordInput.setValue(newPassword);
      await this.securityAnswerInput.setValue('Juno Beach');
    } catch (error) {
      throw new Error(`Step 3 - Entering password details failed: ${error.message}`);
    }
  }

  // Step 4: Click Change Password
  async clickChangePassword() {
    try {
      await this.changePasswordButton.click();
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 4 - Change password button click failed: ${error.message}`);
    }
  }

  // Step 5: Go to Landing Page
  async goToLandingPage() {
    try {
      await browser.url(URLS.LANDING_PAGE);
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 5 - Navigation to landing page failed: ${error.message}`);
    }
  }

  // Step 6: Logout
  async logout() {
    try {
      await this.userNavButton.click();
      await this.logoutLink.click();
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 6 - Logout failed: ${error.message}`);
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.userNavButton.isDisplayed();
    } catch (error) {
      throw new Error(`Login verification failed: ${error.message}`);
    }
  }
}

// Test Suite
describe('Salesforce Password Change Workflow', () => {
  const salesforcePage = new SalesforcePage();
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
    describe(`Testing workflow for username: ${username}`, () => {
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

      it('should complete all password change steps successfully', async () => {
        try {
          // Step 1: Login
          await salesforcePage.login(username, password);
          const isLoggedIn = await salesforcePage.isLoggedIn();
          expect(isLoggedIn, `Login verification failed for ${username}`).to.be.true;

          // Step 2: Go to change password screen
          await salesforcePage.goToChangePasswordScreen();

          // Step 3: Enter password details
          await salesforcePage.enterPasswordDetails(password, newPassword);

          // Step 4: Click change password
          await salesforcePage.clickChangePassword();

          // Step 5: Go to landing page
          await salesforcePage.goToLandingPage();

          // Step 6: Logout
          await salesforcePage.logout();

          // Verify logout
          await browser.url(URLS.LOGIN);
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
