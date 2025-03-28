import { expect } from 'chai';
import LoginPage from '../pages/login.page';
import HomePage from '../pages/home.page';
import ChangePasswordPage from '../pages/changePassword.page';
import { URLS } from '../utils/constants';
import { DataHandler } from '../utils/dataHandler';

describe('Salesforce Login/Change Password/Logout Test', () => {
  const usernames = DataHandler.getUsernames();
  let password = DataHandler.getPassword();
  const newPassword = DataHandler.getNewPassword();

  usernames.forEach((username) => {
    describe(`Testing with username: ${username}`, () => {
      beforeEach(async () => {
        await browser.url(URLS.LOGIN);
      });

      afterEach(async () => {
        await browser.deleteCookies(); // Clear session
      });

      it('should login, change password, and logout successfully', async () => {
        // Login
        await LoginPage.login(username, password);
        
        // Verify login
        await browser.pause(2000);
        const isLoggedIn = await HomePage.isLoggedIn();
        expect(isLoggedIn, `Login failed for ${username}`).to.be.true;

        // Change Password
        await ChangePasswordPage.navigateToChangePassword();
        await browser.pause(2000);
        await ChangePasswordPage.changePassword(password, newPassword);
        await browser.pause(2000);

        // Logout
        await HomePage.logout();
        
        // Verify logout
        await browser.url(URLS.LOGIN);
        await browser.pause(2000);
        const isLoginPageDisplayed = await $('#username').isDisplayed();
        expect(isLoginPageDisplayed, `Logout failed for ${username}`).to.be.true;

        // Update password for next iteration
        password = newPassword;
      });
    });
  });
});