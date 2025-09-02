import { GdiObject } from './GdiObject';
import { DeviceContext } from './DeviceContext';
import { createCanvas, Canvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import * as fs from 'fs';
export class Bitmap extends GdiObject {
    private canvas: Canvas;
    private ctx: CanvasRenderingContext2D;
    private width: number;
    private height: number;

    constructor(width: number, height: number) {
        super();
        this.width = width;
        this.height = height;
        this.canvas = createCanvas(width, height);
        this.ctx = this.canvas.getContext('2d');
    }

    GetWidth(): number {
        return this.width;
    }

    GetHeight(): number {
        return this.height;
    }

    GetCanvas(): Canvas {
        return this.canvas;
    }

    GetContext(): CanvasRenderingContext2D {
        return this.ctx;
    }

    // 从文件加载位图
    static FromFile(path: string): Promise<Bitmap> {
        return new Promise((resolve, reject) => {
            loadImage(path).then((image: any) => {
                const bitmap = new Bitmap(image.width, image.height);
                bitmap.ctx.drawImage(image, 0, 0);
                resolve(bitmap);
            }).catch(reject);
        });
    }

    // 从Buffer加载位图
    static FromBuffer(buffer: Buffer): Promise<Bitmap> {
        return new Promise((resolve, reject) => {
            loadImage(buffer).then((image: any) => {
                const bitmap = new Bitmap(image.width, image.height);
                bitmap.ctx.drawImage(image, 0, 0);
                resolve(bitmap);
            }).catch(reject);
        });
    }


    // 为索引颜色模式创建位图
    static CreateBitmapFromIndexedData(
        infoBuffer: Buffer,
        pixelData: Buffer,
        width: number,
        height: number,
        bpp: number,
        paletteSize: number,
        isTopDown: boolean
    ): Bitmap {
        const palette: number[][] = [];
        const numColors = paletteSize / 4;

        for (let i = 0; i < numColors; i++) {
            const offset = 40 + i * 4;
            const b = infoBuffer.readUInt8(offset);
            const g = infoBuffer.readUInt8(offset + 1);
            const r = infoBuffer.readUInt8(offset + 2);
            palette.push([r, g, b]);
        }

        const stride = Math.floor((width * bpp + 31) / 32) * 4;

        const bitmap = new Bitmap(width, height);
        const ctx = bitmap.GetContext();
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        for (let y = 0; y < height; y++) {
            const line = isTopDown ? y : height - 1 - y;
            for (let x = 0; x < width; x++) {
                let paletteIndex = 0;
                const byteIndex = line * stride + Math.floor(x * bpp / 8);
                const bitOffset = (7 - (x % (8 / bpp)) * bpp);

                if (bpp === 8) {
                    paletteIndex = pixelData.readUInt8(byteIndex);
                } else if (bpp === 4) {
                    const byte = pixelData.readUInt8(byteIndex);
                    if (x % 2 === 0) {
                        paletteIndex = (byte >> 4) & 0x0F;
                    } else {
                        paletteIndex = byte & 0x0F;
                    }
                } else if (bpp === 1) {
                    const byte = pixelData.readUInt8(byteIndex);
                    paletteIndex = (byte >> bitOffset) & 0x01;
                }

                if (paletteIndex >= palette.length) {
                    paletteIndex = 0;
                }

                const pixelOffset = (y * width + x) * 4;
                const color = palette[paletteIndex];
                if (color) {
                    data[pixelOffset] = color[0]!;     // R
                    data[pixelOffset + 1] = color[1]!; // G
                    data[pixelOffset + 2] = color[2]!; // B
                    data[pixelOffset + 3] = 255;      // A
                }
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return bitmap;
    }


    // 绘制位图
    Draw(
        hDC: DeviceContext,
        x: number,
        y: number,
        width?: number,
        height?: number
    ): boolean {
        const ctx = hDC.GetContext();

        if (width && height) {
            ctx.drawImage(this.canvas, x, y, width, height);
        } else {
            ctx.drawImage(this.canvas, x, y);
        }

        return true;
    }

    // 克隆位图
    Clone(): Bitmap {
        const bitmap = new Bitmap(this.width, this.height);
        bitmap.ctx.drawImage(this.canvas, 0, 0);
        return bitmap;
    }

    // 保存为文件
    SaveToFile(path: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const out = fs.createWriteStream(path);
            const stream = this.canvas.createPNGStream();

            stream.pipe(out);
            out.on('finish', resolve);
            out.on('error', reject);
        });
    }

    // 获取Buffer
    ToBuffer(): Buffer {
        return this.canvas.toBuffer();
    }
}