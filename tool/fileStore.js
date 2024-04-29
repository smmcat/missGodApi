const fs = require('fs').promises;

async function setOrCreateFile(path, data) {
  try {
    await fs.writeFile(path, data);
  } catch (error) {
    await createDirectoryPath(path);
    await fs.writeFile(path, data);
  }
}

async function getOrCreateFile(path, array = false) {
  try {
    await fs.access(path);
    return await fs.readFile(path, 'utf-8');
  } catch (error) {
    await createDirectoryPath(path);
    if (array) {
      await fs.writeFile(path, '[]');
    } else {
      await fs.writeFile(path, '{}');
    }
    return await fs.readFile(path, 'utf-8');
  }
}

async function createDirectoryPath(filePath) {
  const lastIndex = filePath.lastIndexOf('/');
  const directoryPath = filePath.substring(0, lastIndex);
  await fs.mkdir(directoryPath, { recursive: true });
}

module.exports = { setOrCreateFile, getOrCreateFile };
