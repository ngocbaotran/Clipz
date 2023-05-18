import { Injectable } from '@angular/core';

import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

@Injectable({
  providedIn: 'root'
})
export class FfmpegService {
  isReady = false;
  isRunning = false;
  private ffmpeg;

  constructor() {
    this.ffmpeg = createFFmpeg({log: true});
  }

  async init() {
    if (this.isReady) {
      return;
    }

    await this.ffmpeg.load();
    this.isReady = true;
  }

  async getScreenshots(file: File) {
    this.isRunning = true;
    const data = await fetchFile(file);
    // ghi dữ liệu nhị phân của ảnh vào hệ thống tệp ảo (virtual file system) của thư viện FFmpeg
    // hệ thống tệp ảo này tồn tại trong bộ nhớ của trình duyệt và không tương tác trực tiếp với hệ thống tệp vật lý trên máy tính
    // kiểu dữ liệu của nội dung để ghi vào FS('writeFile') là Uint8Array
    this.ffmpeg.FS('writeFile', file.name, data);
    const seconds = [1, 2, 3];
    const commands: string[] = [];

    seconds.forEach(second => {
      commands.push(
        // Input
        '-i', file.name, // file đầu vào
        // Output Options
        '-ss', `00:00:0${second}`, // thời điểm muốn lấy ảnh từ video
        '-frames:v', '1', // xác định số frame muốn lấy ra
        '-filter:v', 'scale=510:-1',
        // Output
        `output_0${second}.png` // định dạng file đầu ra
      );
    });

    await this.ffmpeg.run(...commands);
    const screenshots: string[] = [];

    seconds.forEach(second => {
      const screenshotFile = this.ffmpeg.FS(
        'readFile', `output_0${second}.png`
      );
      const screenshotBlob =  new Blob([screenshotFile.buffer], {
        type: 'image/png'
      });
      const screenshotURL = URL.createObjectURL(screenshotBlob);
      screenshots.push(screenshotURL);
    });

    this.isRunning = false;
    return screenshots;
  }

  async blobFromURL(url: string) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
  }
}
