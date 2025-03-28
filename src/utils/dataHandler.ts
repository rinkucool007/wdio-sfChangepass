import { parse } from 'csv-parse/sync';
import * as fs from 'fs';
import * as path from 'path';

export class DataHandler {
  static getUsernames(): string[] {
    const csvPath = path.resolve(__dirname, '../../data/passwords.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    });
    return records.map((record: { Username: string }) => record.Username);
  }

  static getPassword(): string {
    const txtPath = path.resolve(__dirname, '../../data/password.txt');
    return fs.readFileSync(txtPath, 'utf-8').trim();
  }

  static getNewPassword(): string {
    const txtPath = path.resolve(__dirname, '../../data/newPassword.txt');
    return fs.readFileSync(txtPath, 'utf-8').trim();
  }
}