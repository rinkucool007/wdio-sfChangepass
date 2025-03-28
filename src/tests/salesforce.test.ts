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
      console.log('Reading CSV from:', csvPath);
      const csvContent = fs.readFileSync(csvPath, 'utf-8');
      console.log('CSV Content:', csvContent);
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true
      });
      const usernames = records.map((record: { Username: string }) => record.Username);
      console.log('Parsed Usernames:', usernames);
      if (!usernames || usernames.length === 0) {
        throw new Error('No usernames found in CSV file');
      }
      return usernames;
    } catch (error) {
      throw new Error(`Failed to read usernames from CSV: ${error.message}`);
    }
  }

  static getPassword(): string {
    try {
      const txtPath = path.resolve(__dirname, '../../data/password.txt');
      const password = fs.readFileSync(txtPath, 'utf-8').trim();
      console.log('Password:', password);
      return password;
    } catch (error) {
      throw new Error(`Failed to read password from password.txt: ${error.message}`);
    }
  }

  static getNewPassword(): string {
    try {
      const txtPath = path.resolve(__dirname, '../../data/newPassword.txt');
      const newPassword = fs.readFileSync(txtPath, 'utf-8').trim();
      console.log('New Password:', newPassword);
      return newPassword;
    } catch (error) {
      throw new Error(`Failed to read new password from newPassword.txt: ${error.message}`);
    }
  }
}

// Page Objects
class SalesforcePage {
  private get usernameInput() { return $('#username') }
  private get passwordInput() { return $('#password') }
  private get loginButton() { return $('#Login') }
  private get currentPasswordInput() { return $('xpath:///*[@id="currentpassword"]') }
  private get newPasswordInput() { return $('xpath:///*[@id="newpassword"]') }
  private get confirmPasswordInput() { return $('xpath:///*[@id="confirmpassword"]') }
  private get securityAnswerInput() { return $('xpath:///*[@id="answer"]') }
  private get changePasswordButton() { return $('xpath:///*[@id="password-button"]') }
  private get userNavButton() { return $('.userNavButton') }
  private get logoutLink() { return $('=Logout') }

  async login(username: string, password: string) {
    try {
      console.log(`Logging in with ${username}`);
      await this.usernameInput.setValue(username);
      await this.passwordInput.setValue(password);
      await this.loginButton.click();
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 1 - Login failed: ${error.message}`);
    }
  }

  async goToChangePasswordScreen() {
    try {
      console.log('Navigating to change password screen');
      await browser.url(URLS.CHANGE_PASSWORD);
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 2 - Navigation to change password failed: ${error.message}`);
    }
  }

  async enterPasswordDetails(currentPassword: string, newPassword: string) {
    try {
      console.log('Entering password details');
      await this.currentPasswordInput.setValue(currentPassword);
      await this.newPasswordInput.setValue(newPassword);
      await this.confirmPasswordInput.setValue(newPassword);
      await this.securityAnswerInput.setValue('Juno Beach');
    } catch (error) {
      throw new Error(`Step 3 - Entering password details failed: ${error.message}`);
    }
  }

  async clickChangePassword() {
    try {
      console.log('Clicking change password button');
      await this.changePasswordButton.click();
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 4 - Change password button click failed: ${error.message}`);
    }
  }

  async goToLandingPage() {
    try {
      console.log('Navigating to landing page');
      await browser.url(URLS.LANDING_PAGE);
      await browser.pause(2000);
    } catch (error) {
      throw new Error(`Step 5 - Navigation to landing page failed: ${error.message}`);
    }
  }

  async logout() {
    try {
      console.log('Logging out');
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
  let usernames: string[] = [];
  let password: string = '';
  let newPassword: string = '';

  before(async () => {
    console.log('Running before hook');
    try {
      usernames = DataHandler.getUsernames();
      password = DataHandler.getPassword();
      newPassword = DataHandler.getNewPassword();
      console.log('Setup complete. Usernames:', usernames);
      if (!Array.isArray(usernames) || usernames.length === 0) {
        throw new Error('Usernames array is empty or invalid');
      }
    } catch (error) {
      console.error(`Before hook failed: ${error.message}`);
      throw error; // Ensure the test fails if setup fails
    }
  });

  beforeEach(async () => {
    console.log('Running beforeEach hook');
    try {
      await browser.url(URLS.LOGIN);
      await browser.pause(2000);
    } catch (error) {
      console.error(`beforeEach failed: ${error.message}`);
      throw new Error(`Failed to navigate to login page: ${error.message}`);
    }
  });

  afterEach(async () => {
    console.log('Running afterEach hook');
    try {
      await browser.deleteCookies();
      await browser.pause(2000);
    } catch (error) {
      console.warn(`Failed to clear cookies: ${error.message}`);
    }
  });

  // Fallback test if usernames is empty
  if (!usernames || usernames.length === 0) {
    it('should fail due to no usernames available', () => {
      throw new Error('No usernames loaded from CSV. Check data/passwords.csv');
    });
  } else {
    usernames.forEach((username) => {
      describe(`Testing workflow for username: ${username}`, () => {
        it('should complete all password change steps successfully', async () => {
          console.log(`Starting test for ${username}`);
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
            console.log(`Test completed successfully for ${username}`);
          } catch (error) {
            console.error(`Test failed for ${username}: ${error.message}`);
            throw new Error(`Test failed for ${username}: ${error.message}`);
          }
        });
      });
    });
  }
});
