import { exec } from 'node:child_process';
import { access, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { test as setup } from '@playwright/test';

import { keplrData } from '../config/keplr';

const execAsync = promisify(exec);

async function checkExtensionExists(): Promise<boolean> {
  try {
    await access(keplrData.extensionPath);
    return true;
  } catch {
    return false;
  }
}

export async function donwloadKeplrExtension() {
  const exists = await setup.step('Check if extension exists', async () => {
    return await checkExtensionExists();
  });

  if (exists) {
    return;
  }

  const fileName = `keplr-extension-manifest-v3-${keplrData.version}.zip`;
  const releaseUrl = `${keplrData.repository}/releases/download/${keplrData.version}/${fileName}`;

  const outputFilePath = await setup.step(`Download Keplr ${keplrData.version}`, async () => {
    const { stdout: tempDir } = await execAsync('mktemp -d');
    const filePath = join(tempDir.trim(), fileName);
    await execAsync(`curl -L "${releaseUrl}" --output "${filePath}"`);
    return filePath;
  });

  await setup.step('Extract extension', async () => {
    await mkdir(keplrData.extensionPath, { recursive: true });
    await execAsync(`unzip "${outputFilePath}" -d "${keplrData.extensionPath}"`);
  });
}

setup('downloads Keplr extension if not present', async () => {
  await donwloadKeplrExtension();
});
