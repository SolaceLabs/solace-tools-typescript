import s from 'shelljs';
import fs from 'fs';

class PackageJsonService {

  public setVersion({ packageJsonDescription, version, packageJsonDir }:{
    packageJsonDescription: string;
    version: string;
    packageJsonDir: string;
  }): void {
    const funcName = 'setVersion';
    const logName = `${PackageJsonService.name}.${funcName}()`;

    console.log(`${logName}: starting ...`);
    console.log(`${logName}: input=${JSON.stringify({
      packageJsonDescription: packageJsonDescription,
      version: version,
      packageJsonDir: packageJsonDir
    }, null, 2)}`);

    const packageJsonFile = `${packageJsonDir}/package.json`;
    const packageJsonBackupFile = `${packageJsonDir}/.backup.package.json`;
    try {
      const packageJson: any = require(packageJsonFile);

      packageJson.description = `${packageJsonDescription}, v${version}`;
      const newPackageJsonString = JSON.stringify(packageJson, null, 2);
      // backup
      s.cp(`${packageJsonFile}`, packageJsonBackupFile);
      // write new file
      fs.writeFileSync(packageJsonFile, newPackageJsonString);  
      console.log(`${logName}: success.`);
    } catch(e) {
      console.log(`${logName}: error=${e}`);
      throw e;
    }
  }
}

export default new PackageJsonService();